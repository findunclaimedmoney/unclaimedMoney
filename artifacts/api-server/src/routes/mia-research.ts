import { Router, type IRouter } from "express";
import { Resend } from "resend";
import { db, miaResearchRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { callOpenAIReport, generateResearchReport } from "../lib/mia-report";
import { searchMoneySmart } from "../lib/moneysmart-scraper";

const router: IRouter = Router();

function parseSubmitBody(body: unknown): { ok: true; data: { stripeSessionId: string; firstName: string; lastName: string; dob: string; currentAddress: string; previousAddresses: string; previousSurnames: string } } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request body" };
  const b = body as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const stripeSessionId = str(b["stripeSessionId"]);
  const firstName = str(b["firstName"]);
  const lastName = str(b["lastName"]);
  const dob = str(b["dob"]);
  const currentAddress = str(b["currentAddress"]);
  if (!stripeSessionId || !firstName || !lastName || !dob || !currentAddress) {
    return { ok: false, error: "Missing required fields: stripeSessionId, firstName, lastName, dob, currentAddress" };
  }
  return { ok: true, data: { stripeSessionId, firstName, lastName, dob, currentAddress, previousAddresses: str(b["previousAddresses"]), previousSurnames: str(b["previousSurnames"]) } };
}

const FROM_ADDRESS = process.env.MISSINGCASH_DOMAIN_VERIFIED === "true"
  ? "MissingCash <leads@missingcash.com.au>"
  : "MissingCash <leads@lensflow.com.au>";

router.get("/mia/research/session", async (req, res) => {
  const sessionId = req.query["session"] as string;
  if (!sessionId) {
    res.status(400).json({ error: "Missing session parameter" });
    return;
  }

  try {
    const [row] = await db
      .select()
      .from(miaResearchRequestsTable)
      .where(eq(miaResearchRequestsTable.stripeSessionId, sessionId))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Session not found. Please ensure you followed the link from your confirmation email." });
      return;
    }

    if (row.reportSentAt) {
      res.json({ alreadySent: true, email: row.email });
      return;
    }

    res.json({ valid: true, email: row.email, customerName: row.customerName });
  } catch (err) {
    req.log.error({ err }, "Failed to validate research session");
    res.status(500).json({ error: "Failed to validate session. Please try again." });
  }
});

router.post("/mia/research/submit", async (req, res) => {
  const parsed = parseSubmitBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const { stripeSessionId, firstName, lastName, dob, currentAddress, previousAddresses, previousSurnames } = parsed.data;

  let existingRow;
  try {
    const rows = await db
      .select()
      .from(miaResearchRequestsTable)
      .where(eq(miaResearchRequestsTable.stripeSessionId, stripeSessionId))
      .limit(1);
    existingRow = rows[0];
  } catch (err) {
    req.log.error({ err }, "Failed to fetch research request");
    res.status(500).json({ error: "Failed to process request. Please try again." });
    return;
  }

  if (!existingRow) {
    res.status(404).json({ error: "Invalid session. Please use the link from your confirmation email." });
    return;
  }

  if (existingRow.reportSentAt) {
    res.json({ success: true, alreadySent: true, email: existingRow.email });
    return;
  }

  try {
    await db
      .update(miaResearchRequestsTable)
      .set({ firstName, lastName, dob, currentAddress, previousAddresses, previousSurnames })
      .where(eq(miaResearchRequestsTable.stripeSessionId, stripeSessionId));
  } catch (err) {
    req.log.error({ err }, "Failed to update research request with details");
    res.status(500).json({ error: "Failed to save your details. Please try again." });
    return;
  }

  res.json({ success: true, email: existingRow.email });

  const details = { firstName, lastName, dob, currentAddress, previousAddresses, previousSurnames };

  try {
    req.log.info({ sessionId: stripeSessionId, firstName, lastName }, "Starting Mia research — live MoneySmart search + report generation");

    const [liveResults, reportText] = await Promise.all([
      searchMoneySmart({ firstName, lastName, previousSurnames: previousSurnames || undefined }),
      callOpenAIReport(details),
    ]);

    req.log.info({ matchCount: liveResults.matches.length, pagesScanned: liveResults.totalScanned }, "Live search complete — generating PDF");

    const pdfBuffer = await generateResearchReport(details, reportText, liveResults);

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: existingRow.email,
      subject: `⚡ Your Mia Speed Research Report — ${firstName} ${lastName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#061826;padding:0;border-radius:12px;overflow:hidden;">
          <div style="background:#061826;padding:32px 32px 20px;text-align:center;">
            <h1 style="color:#f5b942;font-size:22px;margin:0;">MissingCash</h1>
            <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Mia Speed Research Report</p>
          </div>
          <div style="background:#0f2233;padding:28px 32px;border-top:3px solid #f5b942;">
            <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">Hi ${firstName}, your personalised report is ready ✅</h2>
            <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">Mia has completed your personalised unclaimed money research — including a live search of the MoneySmart database. Your report is attached as a PDF.</p>
            <div style="background:#061826;border-radius:8px;padding:16px;margin:20px 0;border:1px solid #f5b942;">
              <p style="color:#f5b942;font-weight:bold;margin:0 0 8px;font-size:14px;">📋 Your report includes:</p>
              <ul style="color:#94a3b8;padding-left:20px;margin:0;font-size:13px;line-height:1.8;">
                <li>⚡ Live MoneySmart results — searched by Mia (${liveResults.scraped ? `${liveResults.totalScanned} pages scanned` : "included in PDF"})</li>
                <li>ATO myGov — Lost super &amp; tax refunds</li>
                <li>All 8 state revenue office registers</li>
                <li>Computershare &amp; Link share registries</li>
                <li>Fair Work unpaid wages</li>
                <li>Rental bonds &amp; lottery unclaimed prizes</li>
                <li>Your personalised priority search order</li>
              </ul>
            </div>
            <p style="color:#94a3b8;line-height:1.6;margin:16px 0;">Have questions as you go through the report? Open <strong style="color:#f5b942;">Mia</strong> at <a href="https://missingcash.com.au" style="color:#f5b942;">missingcash.com.au</a> — she can answer any follow-up questions about your search.</p>
          </div>
          <div style="background:#061826;padding:20px 32px;text-align:center;border-top:1px solid #1a2a3a;">
            <p style="color:#6b7a8d;font-size:11px;margin:0;">© MissingCash | ABN 52 347 989 391 | support@missingcash.com.au</p>
          </div>
        </div>`,
      attachments: [
        {
          filename: `mia-research-report-${firstName.toLowerCase()}-${lastName.toLowerCase()}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    await db
      .update(miaResearchRequestsTable)
      .set({ reportSentAt: new Date() })
      .where(eq(miaResearchRequestsTable.stripeSessionId, stripeSessionId));

    req.log.info({ sessionId: stripeSessionId, email: existingRow.email }, "Mia research report emailed successfully");
  } catch (err) {
    req.log.error({ err, sessionId: stripeSessionId }, "Failed to generate or email Mia research report");
  }
});

export default router;
