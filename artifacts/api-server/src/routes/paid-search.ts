import { Router, type IRouter } from "express";
import Stripe from "stripe";
import { Resend } from "resend";
import { db, paidSearchesTable, prospectsTable } from "@workspace/db";
import { eq, and, ilike } from "drizzle-orm";
const router: IRouter = Router();

const FROM_ADDRESS =
  process.env.MISSINGCASH_DOMAIN_VERIFIED === "true"
    ? "MissingCash <leads@missingcash.com.au>"
    : "MissingCash <leads@lensflow.com.au>";

const SITE_BASE = "https://missingcash.com.au";

// POST /api/paid-search/initiate
router.post("/paid-search/initiate", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  const firstName = typeof body["firstName"] === "string" ? body["firstName"].trim().slice(0, 60) : "";
  const lastName = typeof body["lastName"] === "string" ? body["lastName"].trim().slice(0, 60) : "";
  const email = typeof body["email"] === "string" ? body["email"].trim().slice(0, 200) : "";
  const state = typeof body["state"] === "string" ? body["state"].trim().slice(0, 10) : undefined;
  const source = typeof body["source"] === "string" ? body["source"].trim().slice(0, 100) : undefined;

  if (!firstName || !lastName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    res.status(500).json({ error: "Payment not configured" });
    return;
  }

  const [record] = await db
    .insert(paidSearchesTable)
    .values({ firstName, lastName, email, state: state ?? null, source: source ?? null, status: "pending" })
    .returning({ id: paidSearchesTable.id });

  if (!record) {
    res.status(500).json({ error: "Failed to create search record" });
    return;
  }

  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "aud",
          unit_amount: 999,
          product_data: {
            name: "Mia Name Search",
            description: `Full search of Australian unclaimed money registers for ${firstName} ${lastName}. Results emailed within minutes.`,
          },
        },
        quantity: 1,
      }],
      metadata: { product: "paid-search", searchId: String(record.id) },
      success_url: `${SITE_BASE}/search/done?sid=${record.id}`,
      cancel_url: `${SITE_BASE}/search`,
    });

    await db
      .update(paidSearchesTable)
      .set({ stripeSessionId: session.id })
      .where(eq(paidSearchesTable.id, record.id));

    res.json({ checkoutUrl: session.url });
  } catch (err) {
    req.log.error({ err }, "paid-search: Stripe session creation failed");
    res.status(500).json({ error: "Failed to create payment session" });
  }
});

export async function runPaidSearch(searchId: number): Promise<void> {
  const [record] = await db
    .select()
    .from(paidSearchesTable)
    .where(eq(paidSearchesTable.id, searchId))
    .limit(1);

  if (!record) return;

  const { firstName, lastName, email, state } = record;

  // Search prospects table for name matches
  const firstParts = firstName.toUpperCase().split(/\s+/);
  const lastParts = lastName.toUpperCase().split(/\s+/);

  const allMatches = await db
    .select()
    .from(prospectsTable)
    .where(
      and(
        ilike(prospectsTable.name, `%${lastParts[0] ?? lastName}%`),
        ilike(prospectsTable.name, `%${firstParts[0] ?? firstName}%`),
      ),
    )
    .limit(20);

  const stateMatches = state
    ? allMatches.filter(
        (m) => !m.state || m.state.toUpperCase() === state.toUpperCase(),
      )
    : allMatches;

  const hits = stateMatches.length > 0 ? stateMatches : allMatches;
  const found = hits.length > 0;

  await db
    .update(paidSearchesTable)
    .set({ status: "searched", resultsFound: hits.length, searchedAt: new Date() })
    .where(eq(paidSearchesTable.id, searchId));

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const resend = new Resend(resendKey);
  const subject = found
    ? `✅ Mia found potential matches for ${firstName} ${lastName}`
    : `🔍 Mia's search complete — ${firstName} ${lastName}`;

  const financeUrl = `${SITE_BASE}/finance?fn=${encodeURIComponent(firstName)}&ln=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}&source=paid-search`;

  const hitRows = hits
    .slice(0, 5)
    .map(
      (h) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">${h.amount}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;">${h.holder ?? h.source}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;">${h.state ?? "AU"}</td>
        </tr>`,
    )
    .join("");

  const registersChecked = [
    "ATO Lost Member Register",
    "ASIC MoneySmart",
    "WA Unclaimed Monies",
    "QLD Unclaimed Money",
    "NSW Fair Trading",
    "VIC Consumer Affairs",
    "SA Government",
  ].join(", ");

  const html = `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;">
  <div style="background:#061826;padding:24px 32px;text-align:center;">
    <span style="color:#f5b942;font-size:20px;font-weight:bold;letter-spacing:2px;">MissingCash</span>
    <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;font-family:sans-serif;">Mia Name Search Results</p>
  </div>
  <div style="padding:36px 40px;">
    <p style="font-size:15px;color:#111827;margin:0 0 16px;">Hi ${firstName},</p>

    ${found ? `
    <div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px 20px;margin:0 0 24px;">
      <p style="font-size:14px;font-weight:bold;color:#15803d;margin:0 0 4px;">✅ We found ${hits.length} potential match${hits.length > 1 ? "es" : ""}</p>
      <p style="font-size:13px;color:#166534;margin:0;">Your name appears on Australian unclaimed money registers.</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;font-family:sans-serif;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Amount</th>
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">Held by</th>
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;border-bottom:2px solid #e5e7eb;">State</th>
        </tr>
      </thead>
      <tbody>${hitRows}</tbody>
    </table>
    <div style="text-align:center;margin:24px 0;">
      <p style="font-size:14px;color:#374151;margin:0 0 16px;font-family:sans-serif;">Want us to handle the claim paperwork for you?</p>
      <a href="${SITE_BASE}/guides" style="background:#f5b942;color:#061826;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;font-family:sans-serif;">
        View Claim Options
      </a>
    </div>` : `
    <div style="background:#fafafa;border-left:4px solid #d1d5db;padding:16px 20px;margin:0 0 24px;">
      <p style="font-size:14px;font-weight:bold;color:#374151;margin:0 0 4px;">🔍 Search complete — no matches found</p>
      <p style="font-size:13px;color:#6b7280;margin:0;">We searched all major Australian registers and found no unclaimed money listed under your name.</p>
    </div>
    <p style="font-size:14px;color:#374151;line-height:1.7;font-family:sans-serif;margin:0 0 16px;">
      This doesn't necessarily mean money doesn't exist — some registers are updated quarterly and names are sometimes recorded differently (maiden names, initials, etc.). We recommend checking again in 3 months.
    </p>`}

    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px 20px;margin:0 0 24px;font-family:sans-serif;">
      <p style="font-size:12px;color:#6b7280;margin:0 0 6px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Registers searched</p>
      <p style="font-size:12px;color:#374151;margin:0;line-height:1.7;">${registersChecked}</p>
    </div>

    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;padding:16px 20px;font-family:sans-serif;">
      <p style="font-size:13px;color:#92400e;margin:0 0 8px;"><strong>💡 Looking for finance instead?</strong></p>
      <p style="font-size:12px;color:#78350f;margin:0 0 10px;">Stratton Finance (ACL 364340) can help with car loans, personal loans, and more.</p>
      <a href="${financeUrl}" style="color:#92400e;font-weight:bold;font-size:13px;">Enquire with Stratton Finance →</a>
    </div>

    <p style="font-size:13px;color:#9ca3af;margin:24px 0 0;font-family:sans-serif;">
      Search ID: #${searchId} · Searched on ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
    </p>
  </div>
  <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:10px;margin:0;font-family:sans-serif;">© MissingCash | ABN 52 347 989 391 | This is not financial or legal advice.</p>
  </div>
</div>`;

  try {
    await resend.emails.send({ from: FROM_ADDRESS, to: email, subject, html });
    await db
      .update(paidSearchesTable)
      .set({ status: "emailed", emailedAt: new Date() })
      .where(eq(paidSearchesTable.id, searchId));
  } catch {
    // email failure is non-fatal — search result is still saved
  }
}

export default router;
