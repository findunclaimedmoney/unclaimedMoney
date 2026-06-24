import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { tiktokLeadsTable } from "@workspace/db/schema";
import { Resend } from "resend";

const router: IRouter = Router();

const DOMAIN_VERIFIED = process.env.MISSINGCASH_DOMAIN_VERIFIED === "true";
const LEAD_FROM = DOMAIN_VERIFIED
  ? "MissingCash <leads@missingcash.com.au>"
  : "MissingCash <leads@lensflow.com.au>";
const LEAD_TO = "admin@missingcash.com.au";

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

router.post("/leads/capture", async (req, res) => {
  const { firstName, lastName, dob, email, source } = req.body as Record<string, string | undefined>;
  if (!firstName || !lastName || !dob) {
    res.status(400).json({ error: "firstName, lastName and dob are required" });
    return;
  }
  let leadId: number | null = null;
  let emailSent = false;

  try {
    const [row] = await db
      .insert(tiktokLeadsTable)
      .values({ firstName, lastName, dob, email: email ?? null, source: source ?? null })
      .returning({ id: tiktokLeadsTable.id });
    leadId = row?.id ?? null;
  } catch (err) {
    req.log.error({ err }, "Failed to save TikTok lead");
  }

  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      const subject = source
        ? `New TikTok Lead [${escapeHtml(source)}] — ${escapeHtml(firstName)} ${escapeHtml(lastName)}`
        : `New TikTok Lead — ${escapeHtml(firstName)} ${escapeHtml(lastName)}`;

      await resend.emails.send({
        from: LEAD_FROM,
        to: LEAD_TO,
        ...(email ? { replyTo: email } : {}),
        subject,
        html: `
          <h2 style="color:#061826">New TikTok Ad Lead${leadId ? ` #${leadId}` : ""}</h2>
          <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
            <tr><td><b>Name</b></td><td>${escapeHtml(firstName)} ${escapeHtml(lastName)}</td></tr>
            <tr><td><b>Date of Birth</b></td><td>${escapeHtml(dob)}</td></tr>
            ${email ? `<tr><td><b>Email</b></td><td>${escapeHtml(email)}</td></tr>` : ""}
            ${source ? `<tr><td><b>Source</b></td><td>${escapeHtml(source)}</td></tr>` : ""}
          </table>
        `,
      });
      emailSent = true;
    }
  } catch (err) {
    req.log.error({ err }, "Failed to send TikTok lead email");
  }

  if (!leadId && !emailSent) {
    res.status(500).json({ error: "Failed to save lead" });
    return;
  }

  res.status(201).json({ success: true, leadId, emailSent });
});

export default router;
