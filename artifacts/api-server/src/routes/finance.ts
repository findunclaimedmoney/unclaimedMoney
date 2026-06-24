import { Router, type IRouter } from "express";
import { FinanceEnquiryBody } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { financeEnquiriesTable } from "@workspace/db/schema";
import { Resend } from "resend";

const router: IRouter = Router();

// Stratton-compliant email routing.
// Until missingcash.com.au is verified in Resend, leads send FROM the lensflow
// address and Erin is NOT copied — Stratton's agreement forbids leads reaching
// them from a lensflow origin. Once the domain is verified, set
// MISSINGCASH_DOMAIN_VERIFIED=true and redeploy: leads then send from the
// branded missingcash address AND Erin Crofton is CC'd on every lead.
const DOMAIN_VERIFIED = process.env.MISSINGCASH_DOMAIN_VERIFIED === "true";
const LEAD_FROM = DOMAIN_VERIFIED
  ? "MissingCash Enquiries <leads@missingcash.com.au>"
  : "MissingCash Enquiries <leads@lensflow.com.au>";
const LEAD_TO = "admin@missingcash.com.au";
const LEAD_CC: string[] = ["integrations@stratton.com.au"];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatLeadEmail(data: FinanceEnquiryBody, enquiryId: number | null, source: string | null) {
  const idLabel = enquiryId !== null ? `#${enquiryId}` : "(not saved to database)";
  const fullName = `${data.firstName} ${data.lastName}`;
  const monthly = data.estimatedMonthly ? `$${Math.round(data.estimatedMonthly).toLocaleString()}/mo` : "—";
  const rows: [string, string][] = [
    ["Name", fullName],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Postcode", data.postcode],
    ["Loan type", data.loanType],
    ["Loan amount", `$${data.loanAmount.toLocaleString()}`],
    ["Preferred term", `${data.preferredTerm} years`],
    ["Estimated repayment", monthly],
    ["Message", data.message?.trim() || "—"],
  ];
  if (source) rows.push(["Campaign / video", source]);

  const text = [
    `New finance enquiry ${idLabel}`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <h2 style="color: #061826;">New finance enquiry <span style="color:#f5b942;">${idLabel}</span></h2>
      <table style="border-collapse: collapse; margin-top: 12px;">
        ${rows
          .map(
            ([label, value]) =>
              `<tr>
                <td style="padding: 6px 16px 6px 0; font-weight: bold; vertical-align: top;">${escapeHtml(label)}</td>
                <td style="padding: 6px 0;">${escapeHtml(value)}</td>
              </tr>`,
          )
          .join("")}
      </table>
    </div>
  `;

  return { text, html };
}

router.post("/finance/enquiry", async (req, res) => {
  const parsed = FinanceEnquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid enquiry data", details: parsed.error.issues });
    return;
  }

  const data = parsed.data;

  // Optional marketing attribution (e.g. ?v=cars1 / utm_*) — captured in the lead
  // email so each enquiry shows which TikTok video / campaign drove it.
  const rawSource = (req.body as { source?: unknown })?.source;
  const source =
    typeof rawSource === "string" && rawSource.trim()
      ? rawSource.trim().replace(/[\r\n]+/g, " ").slice(0, 120)
      : null;

  // 1) Try to save to the database. A DB failure must NOT lose the lead.
  let enquiryId: number | null = null;
  try {
    const [row] = await db
      .insert(financeEnquiriesTable)
      .values({
        ...data,
        estimatedMonthly: data.estimatedMonthly ? Math.round(data.estimatedMonthly) : undefined,
      })
      .returning({ id: financeEnquiriesTable.id });
    enquiryId = row.id;
    req.log.info({ enquiryId, email: data.email, loanType: data.loanType, source }, "Finance enquiry saved");
  } catch (err) {
    req.log.error({ err, email: data.email }, "Finance enquiry DB save failed — will still email the lead");
  }

  // 2) Always email the lead, independent of the DB. This is the safety net.
  let emailSent = false;
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const { text, html } = formatLeadEmail(data, enquiryId, source);
      const { error } = await resend.emails.send({
        from: LEAD_FROM,
        to: LEAD_TO,
        ...(LEAD_CC.length > 0 ? { cc: LEAD_CC } : {}),
        replyTo: data.email,
        subject: source
          ? `New finance enquiry from ${data.firstName} ${data.lastName} (via ${source})`
          : `New finance enquiry from ${data.firstName} ${data.lastName}`,
        text,
        html,
      });
      if (error) {
        req.log.error({ err: error, enquiryId }, "Finance enquiry email failed");
      } else {
        emailSent = true;
        req.log.info({ enquiryId }, "Finance enquiry email sent");
      }
    } catch (emailErr) {
      req.log.error({ err: emailErr, enquiryId }, "Finance enquiry email threw");
    }
  } else {
    req.log.warn({ enquiryId }, "RESEND_API_KEY not set — skipping finance enquiry email");
  }

  // 3) As long as the lead landed somewhere (DB or email), confirm success.
  if (enquiryId !== null || emailSent) {
    res.status(201).json({ success: true, enquiryId, emailSent });
    return;
  }

  // Both failed — the lead is genuinely lost. Tell them to call.
  req.log.error({ email: data.email }, "Finance enquiry lost — DB and email both failed");
  res.status(500).json({ error: "Failed to submit enquiry. Please try again or call 0432 280 181." });
});

export default router;
