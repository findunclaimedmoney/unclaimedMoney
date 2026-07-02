import { Router, type IRouter } from "express";
import Stripe from "stripe";
import { Resend } from "resend";
import { db, miaResearchRequestsTable, miaFreeSearchesTable } from "@workspace/db";
import { prospectsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { callOpenAIReport, generateResearchReport } from "../lib/mia-report";
import { runPaidSearch } from "./paid-search";
import type { MoneySmartResults } from "../lib/moneysmart-scraper";
import { generateGuide } from "../lib/guides-pdf";
import { buildClaimInstructions } from "./claim-report";

const router: IRouter = Router();

const PRICE_TO_PRODUCT: Record<string, string> = {
  price_1TOZVABFhWjdi0urVfM1uOdH: "missingcash",
  price_1TPuoUBFhWjdi0urzZN7Sauv: "crypto",
  price_1TX1pZBFhWjdi0urODNB99ln: "cyber",
  price_1TX1rTBFhWjdi0urJECHDke8: "identity",
  price_1TX1zDBFhWjdi0urpXqepw6J: "bundle",
  price_1TliXfBFhWjdi0ur3omVxc8Q: "mia-research",
};

const GUIDE_TITLES: Record<string, string> = {
  missingcash: "MissingCash Premium Guide — How to Find Your Unclaimed Money",
  crypto: "MissingCrypto Recovery Guide",
  cyber: "Cyber Security Guide",
  identity: "Identity Theft Recovery Guide",
  bundle: "MissingCash Complete Bundle",
};

const FROM_ADDRESS = process.env.MISSINGCASH_DOMAIN_VERIFIED === "true"
  ? "MissingCash <leads@missingcash.com.au>"
  : "MissingCash <leads@lensflow.com.au>";

const SITE_BASE = "https://missingcash.com.au";

router.post("/stripe/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    req.log.error("STRIPE_WEBHOOK_SECRET is not configured");
    res.status(500).end();
    return;
  }

  if (!sig || typeof sig !== "string") {
    req.log.warn("Stripe webhook: missing signature header");
    res.status(400).end();
    return;
  }

  const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body as Buffer, sig, secret);
  } catch (err) {
    req.log.warn({ err }, "Stripe webhook: signature verification failed");
    res.status(400).end();
    return;
  }

  res.json({ received: true });

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const { handleCompanionSubscriptionWebhook } = await import("./companion-subscribe");
    await handleCompanionSubscriptionWebhook(event as unknown as { type: string; data: { object: Record<string, unknown> } });
    return;
  }

  if (event.type !== "checkout.session.completed") return;

  const session = event.data.object as Stripe.Checkout.Session;
  const email = session.customer_details?.email;
  const customerName = session.customer_details?.name ?? "there";

  if (!email) {
    req.log.warn({ sessionId: session.id }, "Stripe webhook: no customer email in session");
    return;
  }

  // ── $9.99 Paid name search ────────────────────────────────────────────────
  if (session.metadata?.["product"] === "paid-search") {
    const searchId = parseInt(session.metadata?.["searchId"] ?? "", 10);
    if (!isNaN(searchId)) {
      req.log.info({ searchId, email }, "paid-search: payment received — running search");
      runPaidSearch(searchId).catch((err) =>
        req.log.error({ err, searchId }, "paid-search: runPaidSearch failed"),
      );
    }
    return;
  }

  // ── Pipeline prospect payment ─────────────────────────────────────────────
  if (session.metadata?.["product"] === "mia-prospect-lookup") {
    const prospectId = parseInt(session.metadata?.["prospectId"] ?? "", 10);
    if (isNaN(prospectId)) {
      req.log.warn({ sessionId: session.id }, "Stripe webhook: mia-prospect-lookup missing prospectId in metadata");
      return;
    }

    req.log.info({ prospectId, email }, "Pipeline prospect payment received — delivering claim report");

    try {
      const [prospect] = await db.select().from(prospectsTable).where(eq(prospectsTable.id, prospectId)).limit(1);
      if (!prospect) {
        req.log.error({ prospectId }, "Stripe webhook: prospect not found");
        return;
      }

      const steps = buildClaimInstructions(prospect.name, prospect.amount ?? "", prospect.holder, prospect.state);
      const holderName = prospect.holder ?? "the registered holder";
      const firstName = prospect.name.split(" ")[0] ?? customerName;

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        replyTo: "support@missingcash.com.au",
        subject: `✅ Your Claim Report — ${prospect.amount ?? "Unclaimed Money"} in Your Name`,
        html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#061826;padding:0;border-radius:12px;overflow:hidden;">
  <div style="background:#061826;padding:32px 32px 20px;text-align:center;">
    <h1 style="color:#f5b942;font-size:22px;margin:0;">MissingCash</h1>
    <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Personalised Claim Report</p>
  </div>
  <div style="background:#0f2233;padding:28px 32px;border-top:3px solid #f5b942;">
    <h2 style="color:#ffffff;font-size:20px;margin:0 0 8px;">Hi ${firstName}, your claim report is ready ✅</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">We found <strong style="color:#f5b942;">${prospect.amount ?? "money"}</strong> held by <strong style="color:#ffffff;">${holderName}</strong> on the ASIC MoneySmart national unclaimed money register. Here are your step-by-step claim instructions.</p>

    <div style="background:#061826;border-radius:10px;padding:20px;border:1px solid #1a2a3a;margin-bottom:20px;">
      <p style="color:#f5b942;font-weight:bold;margin:0 0 14px;font-size:14px;">📋 Step-by-step claim instructions</p>
      <ol style="color:#94a3b8;padding-left:20px;margin:0;font-size:13px;line-height:2;">
        ${steps.map((s) => `<li style="margin-bottom:4px;">${s.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#ffffff;">$1</strong>')}</li>`).join("")}
      </ol>
    </div>

    <div style="background:#0a1f30;border-radius:8px;padding:14px;border:1px solid #1a2a3a;margin-bottom:20px;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">📌 Data source: <a href="https://moneysmart.gov.au/find-unclaimed-money" style="color:#f5b942;">ASIC MoneySmart public unclaimed money register</a> · ABN 52 347 989 391</p>
    </div>

    <p style="color:#94a3b8;line-height:1.6;margin:0;">Questions? Reply to this email or open <strong style="color:#f5b942;">Mia</strong> at <a href="${SITE_BASE}" style="color:#f5b942;">missingcash.com.au</a> — she can walk you through any step.</p>
  </div>
  <div style="background:#061826;padding:20px 32px;text-align:center;border-top:1px solid #1a2a3a;">
    <p style="color:#6b7a8d;font-size:11px;margin:0;">© MissingCash | ABN 52 347 989 391 | support@missingcash.com.au</p>
  </div>
</div>`,
      });

      req.log.info({ prospectId, email }, "Pipeline prospect claim report emailed successfully");
    } catch (err) {
      req.log.error({ err, prospectId, email }, "Failed to email pipeline prospect claim report");
    }
    return;
  }

  if (session.metadata?.["product"] === "mia-free-search") {
    const searchId = parseInt(session.metadata?.["searchId"] ?? "", 10);
    if (isNaN(searchId)) {
      req.log.warn({ sessionId: session.id }, "Stripe webhook: mia-free-search missing searchId in metadata");
      return;
    }

    req.log.info({ searchId, email }, "Mia free-search payment received — generating full report");

    try {
      const [row] = await db.select().from(miaFreeSearchesTable).where(eq(miaFreeSearchesTable.id, searchId)).limit(1);
      if (!row) {
        req.log.error({ searchId }, "Mia free-search: row not found");
        return;
      }

      await db.update(miaFreeSearchesTable).set({ status: "paid", stripeSessionId: session.id }).where(eq(miaFreeSearchesTable.id, searchId));

      const details = {
        firstName: row.firstName,
        lastName: row.lastName,
        dob: row.dob,
        currentAddress: row.currentAddress,
        previousAddresses: row.previousAddresses ?? "",
        previousSurnames: row.previousSurnames ?? "",
      };

      const teaserMatches: { name: string; amount: string; holder: string; state: string }[] =
        row.teaserMatchesJson ? (JSON.parse(row.teaserMatchesJson) as { name: string; amount: string; holder: string; state: string }[]) : [];

      const liveResults: MoneySmartResults = {
        matches: teaserMatches,
        totalScanned: teaserMatches.length,
        namesSearched: [`${row.firstName} ${row.lastName}`],
        scraped: teaserMatches.length > 0,
      };

      const reportText = await callOpenAIReport(details);
      const pdfBuffer = await generateResearchReport(details, reportText, liveResults);

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: `⚡ Your Mia Claim Report — ${row.firstName} ${row.lastName}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#061826;padding:0;border-radius:12px;overflow:hidden;">
            <div style="background:#061826;padding:32px 32px 20px;text-align:center;">
              <h1 style="color:#f5b942;font-size:22px;margin:0;">MissingCash</h1>
              <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Mia Full Claim Report</p>
            </div>
            <div style="background:#0f2233;padding:28px 32px;border-top:3px solid #00C1D5;">
              <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">Hi ${row.firstName}, your full claim report is attached ✅</h2>
              <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">Mia has generated your personalised unclaimed money claim report with full step-by-step instructions to recover every dollar found in your name.</p>
              <div style="background:#061826;border-radius:8px;padding:16px;margin:20px 0;border:1px solid #00C1D5;">
                <p style="color:#00C1D5;font-weight:bold;margin:0 0 8px;font-size:14px;">📋 Your report includes:</p>
                <ul style="color:#94a3b8;padding-left:20px;margin:0;font-size:13px;line-height:1.8;">
                  <li>Exact institution names &amp; account references for every match</li>
                  <li>Direct claim form links — no searching required</li>
                  <li>Step-by-step instructions personalised with your details</li>
                  <li>ATO myGov — Lost super &amp; tax refunds</li>
                  <li>All 8 state &amp; territory revenue office registers</li>
                  <li>Computershare &amp; Link share registries</li>
                  <li>Fair Work unpaid wages</li>
                </ul>
              </div>
              <p style="color:#94a3b8;line-height:1.6;margin:16px 0;">Questions? Open <strong style="color:#00C1D5;">Mia</strong> at <a href="https://missingcash.com.au" style="color:#00C1D5;">missingcash.com.au</a> — she can walk you through any step.</p>
            </div>
            <div style="background:#061826;padding:20px 32px;text-align:center;border-top:1px solid #1a2a3a;">
              <p style="color:#6b7a8d;font-size:11px;margin:0;">© MissingCash | ABN 52 347 989 391 | support@missingcash.com.au</p>
            </div>
          </div>`,
        attachments: [
          {
            filename: `mia-claim-report-${row.firstName.toLowerCase()}-${row.lastName.toLowerCase()}.pdf`,
            content: pdfBuffer.toString("base64"),
          },
        ],
      });

      await db.update(miaFreeSearchesTable).set({ reportSentAt: new Date(), status: "report_sent" }).where(eq(miaFreeSearchesTable.id, searchId));

      req.log.info({ searchId, email }, "Mia free-search full report emailed successfully");
    } catch (err) {
      req.log.error({ err, searchId, email }, "Failed to generate or email Mia free-search report");
    }
    return;
  }

  let priceId: string | null = null;
  try {
    const items = await stripeClient.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price"],
    });
    priceId = items.data[0]?.price?.id ?? null;
  } catch (err) {
    req.log.error({ err, sessionId: session.id }, "Stripe webhook: failed to fetch line items");
    return;
  }

  const product = priceId ? PRICE_TO_PRODUCT[priceId] : null;

  if (!product) {
    req.log.warn({ priceId, sessionId: session.id }, "Stripe webhook: unrecognised price ID");
    return;
  }

  req.log.info({ product, email }, "Stripe checkout completed — delivering product");

  const resend = new Resend(process.env.RESEND_API_KEY);

  if (product === "mia-research") {
    try {
      await db.insert(miaResearchRequestsTable).values({
        stripeSessionId: session.id,
        email,
        customerName,
      }).onConflictDoNothing();

      const link = `${SITE_BASE}/mia-research?session=${session.id}`;

      await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: "⚡ Your Mia Speed Research is Ready — Submit Your Details Now",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#061826;padding:0;border-radius:12px;overflow:hidden;">
            <div style="background:#061826;padding:32px 32px 20px;text-align:center;">
              <h1 style="color:#f5b942;font-size:22px;margin:0;">MissingCash</h1>
              <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Mia Speed Research</p>
            </div>
            <div style="background:#0f2233;padding:28px 32px;border-top:3px solid #f5b942;">
              <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">Hi ${customerName}, your research session is confirmed ✅</h2>
              <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">Thank you for purchasing Mia Speed Research. Mia will now search every Australian unclaimed money database using your personal details and email you a full written report.</p>
              <p style="color:#94a3b8;margin:0 0 24px;"><strong style="color:#f5b942;">Next step:</strong> Click the button below to submit your details so Mia can start your research.</p>
              <div style="text-align:center;margin:28px 0;">
                <a href="${link}" style="background:#f5b942;color:#061826;padding:16px 36px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
                  ⚡ Submit My Details — Start Research
                </a>
              </div>
              <p style="color:#6b7a8d;font-size:12px;text-align:center;margin:16px 0 0;">This link is unique to you. Your report will be emailed within minutes of submitting your details.</p>
            </div>
            <div style="background:#061826;padding:20px 32px;text-align:center;border-top:1px solid #1a2a3a;">
              <p style="color:#6b7a8d;font-size:11px;margin:0;">© MissingCash | ABN 52 347 989 391 | support@missingcash.com.au</p>
            </div>
          </div>`,
      });

      req.log.info({ email, sessionId: session.id }, "Mia research link emailed to customer");
    } catch (err) {
      req.log.error({ err, email }, "Failed to save research request or send Mia research email");
    }
    return;
  }

  const guideKeys = product === "bundle"
    ? (["missingcash", "crypto", "cyber", "identity"] as const)
    : ([product] as const);

  try {
    const attachments = await Promise.all(
      guideKeys.map(async (g) => {
        const buf = await generateGuide(g as "missingcash" | "crypto" | "cyber" | "identity");
        return {
          filename: `missingcash-${g}-guide.pdf`,
          content: buf.toString("base64"),
        };
      })
    );

    const isBundle = product === "bundle";
    const subject = isBundle
      ? "🏆 Your MissingCash Bundle — 4 Guides Inside"
      : `📄 Your ${GUIDE_TITLES[product] ?? "MissingCash Guide"} — Download Inside`;

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#061826;padding:0;border-radius:12px;overflow:hidden;">
          <div style="background:#061826;padding:32px 32px 20px;text-align:center;">
            <h1 style="color:#f5b942;font-size:22px;margin:0;">MissingCash</h1>
          </div>
          <div style="background:#0f2233;padding:28px 32px;border-top:3px solid #f5b942;">
            <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">Hi ${customerName}, your guide${isBundle ? "s are" : " is"} attached ✅</h2>
            <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
              ${isBundle
                ? "Your complete MissingCash Bundle is attached to this email — all 4 guides as PDF files. Open them on any device."
                : `Your ${GUIDE_TITLES[product] ?? "guide"} is attached to this email as a PDF. Open it on any device.`
              }
            </p>
            ${isBundle ? `<ul style="color:#94a3b8;padding-left:20px;margin:0 0 20px;">
              <li>💰 MissingCash Premium Guide — How to Find Your Unclaimed Money</li>
              <li>₿ MissingCrypto Recovery Guide</li>
              <li>📱 Cyber Security Guide</li>
              <li>🪪 Identity Theft Recovery Guide</li>
            </ul>` : ""}
            <p style="color:#94a3b8;line-height:1.6;margin:16px 0;">If you have any questions about your guide, ask <strong style="color:#f5b942;">Mia</strong> at <a href="${SITE_BASE}" style="color:#f5b942;">missingcash.com.au</a> — she can walk you through any step in detail.</p>
            <div style="background:#061826;border-radius:8px;padding:16px;margin:20px 0;border:1px solid #1a2a3a;">
              <p style="color:#f5b942;font-weight:bold;margin:0 0 8px;font-size:13px;">30-Day Money Back Guarantee</p>
              <p style="color:#6b7a8d;font-size:12px;margin:0;">Not happy? Email support@missingcash.com.au within 30 days for a full refund — no questions asked.</p>
            </div>
          </div>
          <div style="background:#061826;padding:20px 32px;text-align:center;border-top:1px solid #1a2a3a;">
            <p style="color:#6b7a8d;font-size:11px;margin:0;">© MissingCash | ABN 52 347 989 391 | support@missingcash.com.au</p>
          </div>
        </div>`,
      attachments,
    });

    req.log.info({ email, product, guides: guideKeys }, "Guide(s) emailed to customer");
  } catch (err) {
    req.log.error({ err, email, product }, "Failed to generate or email guide PDF(s)");
  }
});

export default router;
