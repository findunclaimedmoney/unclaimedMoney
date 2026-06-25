import { Router, type IRouter } from "express";
import Stripe from "stripe";
import { Resend } from "resend";
import { db, miaFreeSearchesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { searchAllSources } from "../lib/multi-scraper";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SITE_BASE = process.env.REPLIT_DOMAINS
  ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
  : "https://missingcash.com.au";

const FROM_ADDRESS = process.env.MISSINGCASH_DOMAIN_VERIFIED === "true"
  ? "MissingCash <leads@missingcash.com.au>"
  : "MissingCash <leads@lensflow.com.au>";

function fmtAUD(cents: number) {
  return (cents / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
}

function parseAmountCents(amountStr: string): number {
  const match = amountStr.match(/\$?([\d,]+(?:\.\d{1,2})?)/);
  if (!match || !match[1]) return 0;
  const dollars = parseFloat(match[1].replace(/,/g, ""));
  return isNaN(dollars) ? 0 : Math.round(dollars * 100);
}

function calcFeePercent(totalDollars: number): number {
  if (totalDollars <= 1000) return 5;
  if (totalDollars <= 5000) return 10;
  if (totalDollars <= 30000) return 15;
  if (totalDollars <= 100000) return 20;
  return 33;
}

function calcFeeCents(totalAmountCents: number): number {
  const totalDollars = totalAmountCents / 100;
  const pct = calcFeePercent(totalDollars);
  const fee = Math.round(totalAmountCents * pct / 100);
  return Math.max(fee, 100);
}

async function sendFoundEmail(opts: {
  searchId: number;
  email: string;
  firstName: string;
  lastName: string;
  totalAmountCents: number;
  teaserMatches: { name: string; holder: string; state: string; amount: string; source?: string }[];
}) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!stripeKey || !resendKey) {
    logger.warn({ searchId: opts.searchId }, "Skipping found-email: missing STRIPE_SECRET_KEY or RESEND_API_KEY");
    return;
  }

  const { searchId, email, firstName, lastName, totalAmountCents, teaserMatches } = opts;
  const feePercent = calcFeePercent(totalAmountCents / 100);
  const feeCents = calcFeeCents(totalAmountCents);
  const totalStr = fmtAUD(totalAmountCents);
  const feeStr = fmtAUD(feeCents);

  let checkoutUrl: string;
  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "aud",
            unit_amount: feeCents,
            product_data: {
              name: `Mia Full Claim Report — ${feePercent}% success fee`,
              description: `Mia found ${totalStr} in your name. Pay ${feeStr} (${feePercent}%) to unlock your personalised step-by-step claim report.`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        product: "mia-free-search",
        searchId: String(searchId),
      },
      success_url: `${SITE_BASE}/mia-search/paid?id=${searchId}`,
      cancel_url: `${SITE_BASE}/mia-search/results?id=${searchId}`,
    });
    checkoutUrl = session.url!;
  } catch (err) {
    logger.error({ err, searchId }, "Failed to create Stripe checkout session for found-email");
    return;
  }

  const matchRows = teaserMatches.slice(0, 3).map((m) => {
    const label = m.source || m.holder || "Institution on file";
    const loc = m.state ? ` · ${m.state}` : "";
    const amt = m.amount ? `<strong style="color:#00C1D5;">${m.amount}</strong>` : `<em style="color:#6b7a8d;">Amount on file</em>`;
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #1a2a3a;">
          <div style="color:#ffffff;font-size:14px;font-weight:bold;">${m.name}</div>
          <div style="color:#6b7a8d;font-size:12px;">${label}${loc}</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #1a2a3a;text-align:right;">
          ${amt}
          <div style="color:#6b7a8d;font-size:10px;margin-top:2px;">🔒 Claim steps locked</div>
        </td>
      </tr>`;
  }).join("");

  const extraNote = teaserMatches.length > 3
    ? `<p style="color:#6b7a8d;font-size:12px;text-align:center;margin:8px 0 0;">+ ${teaserMatches.length - 3} more match${teaserMatches.length - 3 !== 1 ? "es" : ""} in your full report</p>`
    : "";

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#061826;padding:0;border-radius:12px;overflow:hidden;">
  <div style="background:#061826;padding:32px 32px 20px;text-align:center;">
    <h1 style="color:#f5b942;font-size:24px;margin:0;letter-spacing:2px;">MissingCash</h1>
    <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Mia Free Search — Results Ready</p>
  </div>
  <div style="background:#0f2233;padding:28px 32px;border-top:3px solid #00C1D5;">
    <h2 style="color:#00C1D5;font-size:22px;margin:0 0 8px;">⚡ Mia found unclaimed money in your name!</h2>
    <p style="color:#ffffff;font-size:28px;font-weight:900;margin:0 0 4px;">${totalStr} found</p>
    <p style="color:#94a3b8;font-size:13px;margin:0 0 24px;">across ${teaserMatches.length} match${teaserMatches.length !== 1 ? "es" : ""} in Australian government databases</p>

    <table style="width:100%;border-collapse:collapse;background:#061826;border-radius:8px;overflow:hidden;margin-bottom:8px;">
      <thead>
        <tr style="background:#0a1f30;">
          <th style="padding:10px 12px;text-align:left;color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Match</th>
          <th style="padding:10px 12px;text-align:right;color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Amount</th>
        </tr>
      </thead>
      <tbody>${matchRows}</tbody>
    </table>
    ${extraNote}

    <div style="background:#00C1D5/10;border:1px solid #00C1D5;border-radius:8px;padding:14px;margin:20px 0;text-align:center;">
      <p style="color:#94a3b8;font-size:12px;margin:0 0 6px;">🔒 Exact institution names, account references, claim form links and step-by-step instructions are in your full report</p>
    </div>

    <div style="text-align:center;margin:28px 0;">
      <a href="${checkoutUrl}" style="background:#00C1D5;color:#ffffff;padding:18px 40px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:17px;display:inline-block;letter-spacing:1px;">
        🔓 Unlock My Full Report — ${feeStr}
      </a>
      <p style="color:#6b7a8d;font-size:11px;margin:12px 0 0;">${feePercent}% of ${totalStr} found · Secure payment via Stripe · Report emailed instantly</p>
    </div>

    <div style="background:#061826;border-radius:8px;padding:14px;margin:16px 0;border:1px solid #1a2a3a;">
      <p style="color:#94a3b8;font-weight:bold;margin:0 0 8px;font-size:13px;">📋 Your full report includes:</p>
      <ul style="color:#94a3b8;padding-left:18px;margin:0;font-size:12px;line-height:1.9;">
        <li>Exact institution names &amp; account references for every match</li>
        <li>Direct claim form links — no searching required</li>
        <li>Step-by-step claim instructions personalised to your details</li>
        <li>ATO myGov — Lost super &amp; tax refunds</li>
        <li>All 8 state &amp; territory revenue registers</li>
        <li>Computershare &amp; Link share registries</li>
        <li>Fair Work unpaid wages</li>
      </ul>
    </div>

    <p style="color:#6b7a8d;font-size:11px;margin:16px 0 0;text-align:center;">No charge has been made. You only pay if you choose to unlock your report.<br>Questions? Ask <a href="${SITE_BASE}" style="color:#00C1D5;">Mia</a> or email support@missingcash.com.au</p>
  </div>
  <div style="background:#061826;padding:20px 32px;text-align:center;border-top:1px solid #1a2a3a;">
    <p style="color:#6b7a8d;font-size:11px;margin:0;">© MissingCash | ABN 52 347 989 391 | support@missingcash.com.au</p>
  </div>
</div>`;

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: `⚡ Mia found ${totalStr} in your name, ${firstName} — unlock your report`,
      html,
    });
    logger.info({ searchId, email, totalAmountCents }, "Found-email with payment link sent");
  } catch (err) {
    logger.error({ err, searchId, email }, "Failed to send found-email");
  }
}

router.post("/mia/search/start", async (req, res) => {
  const b = (req.body ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const email = str(b["email"]);
  const firstName = str(b["firstName"]);
  const lastName = str(b["lastName"]);
  const dob = str(b["dob"]);
  const currentAddress = str(b["currentAddress"]);
  const previousAddresses = str(b["previousAddresses"]);
  const previousSurnames = str(b["previousSurnames"]);

  if (!email || !firstName || !lastName || !dob || !currentAddress) {
    res.status(400).json({ error: "Missing required fields: email, firstName, lastName, dob, currentAddress" });
    return;
  }

  let searchId: number;
  try {
    const [row] = await db.insert(miaFreeSearchesTable).values({
      email, firstName, lastName, dob, currentAddress,
      previousAddresses: previousAddresses || null,
      previousSurnames: previousSurnames || null,
      status: "searching",
    }).returning({ id: miaFreeSearchesTable.id });
    searchId = row!.id;
  } catch (err) {
    req.log.error({ err }, "Failed to create free search record");
    res.status(500).json({ error: "Failed to start search. Please try again." });
    return;
  }

  res.status(201).json({ searchId });

  (async () => {
    try {
      req.log.info({ searchId, firstName, lastName }, "Starting multi-source search (8 databases)");

      const results = await searchAllSources({
        firstName,
        lastName,
        previousSurnames: previousSurnames || undefined,
      });

      const validMatches = results.matches.filter((m) => m.name && m.holder !== undefined);

      let totalAmountCents = 0;
      for (const m of validMatches) {
        totalAmountCents += parseAmountCents(m.amount);
      }

      const teaserMatches = validMatches.map((m) => ({
        name: m.name,
        holder: m.holder,
        state: m.state,
        amount: m.amount,
        source: (m as { source?: string }).source ?? "",
      }));

      const hasMatches = validMatches.length > 0;
      const status = hasMatches ? "found" : "not_found";

      await db.update(miaFreeSearchesTable).set({
        status,
        totalAmountCents: hasMatches ? totalAmountCents : 0,
        teaserMatchesJson: JSON.stringify(teaserMatches),
      }).where(eq(miaFreeSearchesTable.id, searchId));

      req.log.info({ searchId, status, matchCount: validMatches.length, totalAmountCents, sourcesSearched: results.sourceResults.length }, "Multi-source search complete");

      if (hasMatches) {
        await sendFoundEmail({ searchId, email, firstName, lastName, totalAmountCents, teaserMatches });
      }
    } catch (err) {
      req.log.error({ err, searchId }, "Free search failed");
      try {
        await db.update(miaFreeSearchesTable).set({ status: "error" }).where(eq(miaFreeSearchesTable.id, searchId));
      } catch (_) {}
    }
  })();
});

router.get("/mia/search/:id", async (req, res) => {
  const id = parseInt(req.params["id"] ?? "", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid search ID" });
    return;
  }

  try {
    const [row] = await db.select().from(miaFreeSearchesTable).where(eq(miaFreeSearchesTable.id, id)).limit(1);
    if (!row) {
      res.status(404).json({ error: "Search not found" });
      return;
    }

    const teaserMatches = row.teaserMatchesJson ? (JSON.parse(row.teaserMatchesJson) as { name: string; holder: string; state: string; amount: string }[]) : [];
    const totalAmountCents = row.totalAmountCents ?? 0;
    const feeCents = totalAmountCents > 0 ? calcFeeCents(totalAmountCents) : 0;
    const feePercent = totalAmountCents > 0 ? calcFeePercent(totalAmountCents / 100) : 0;

    res.json({
      status: row.status,
      totalAmountCents,
      feeCents,
      feePercent,
      matchCount: teaserMatches.length,
      teaserMatches,
      email: row.email,
      firstName: row.firstName,
    });
  } catch (err) {
    req.log.error({ err, id }, "Failed to fetch search status");
    res.status(500).json({ error: "Failed to fetch search status" });
  }
});

router.post("/mia/search/checkout", async (req, res) => {
  const b = (req.body ?? {}) as Record<string, unknown>;
  const searchId = parseInt(String(b["searchId"] ?? ""), 10);

  if (isNaN(searchId)) {
    res.status(400).json({ error: "Invalid searchId" });
    return;
  }

  let row: typeof miaFreeSearchesTable.$inferSelect | undefined;
  try {
    const rows = await db.select().from(miaFreeSearchesTable).where(eq(miaFreeSearchesTable.id, searchId)).limit(1);
    row = rows[0];
  } catch (err) {
    req.log.error({ err, searchId }, "Failed to fetch search for checkout");
    res.status(500).json({ error: "Failed to process request" });
    return;
  }

  if (!row) {
    res.status(404).json({ error: "Search not found" });
    return;
  }

  if (row.status !== "found") {
    res.status(400).json({ error: "Search results not ready or no money found" });
    return;
  }

  const totalAmountCents = row.totalAmountCents ?? 0;
  const feeCents = totalAmountCents > 0 ? calcFeeCents(totalAmountCents) : 100;
  const feePercent = calcFeePercent(totalAmountCents / 100);
  const totalStr = fmtAUD(totalAmountCents);
  const feeStr = fmtAUD(feeCents);

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    res.status(500).json({ error: "Payment not configured" });
    return;
  }

  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: row.email,
      line_items: [
        {
          price_data: {
            currency: "aud",
            unit_amount: feeCents,
            product_data: {
              name: `Mia Full Claim Report — ${feePercent}% success fee`,
              description: `Mia found ${totalStr} in your name. Pay ${feeStr} (${feePercent}%) to unlock your full personalised claim report with step-by-step instructions for every database.`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        product: "mia-free-search",
        searchId: String(searchId),
      },
      success_url: `${SITE_BASE}/mia-search/paid?id=${searchId}`,
      cancel_url: `${SITE_BASE}/mia-search/results?id=${searchId}`,
    });

    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err, searchId }, "Failed to create Stripe checkout session");
    res.status(500).json({ error: "Failed to create payment session. Please try again." });
  }
});

export default router;
