import { Router, type IRouter } from "express";
import Stripe from "stripe";
import { db } from "@workspace/db";
import { prospectsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function parseAmountDollars(amount: string | null): number {
  if (!amount) return 0;
  const m = amount.match(/[\d,]+(\.\d+)?/);
  return m ? parseFloat(m[0].replace(/,/g, "")) : 0;
}

function calcFee(dollars: number): { pct: number; feeStr: string } {
  const pct = dollars <= 1000 ? 5 : dollars <= 5000 ? 10 : dollars <= 30000 ? 15 : dollars <= 100000 ? 20 : 33;
  const fee = Math.max(Math.round(dollars * pct), 100);
  return { pct, feeStr: `$${(fee / 100).toLocaleString("en-AU", { maximumFractionDigits: 0 })}` };
}

function buildClaimInstructions(name: string, amount: string, holder: string | null, state: string | null): string[] {
  const holderName = holder ?? "the registered holder";
  const steps: string[] = [
    `Go to **moneysmart.gov.au/find-unclaimed-money** and search your full name: **${name}**`,
    `Locate the record showing **${amount}** held by **${holderName}**${state ? ` (${state})` : ""}`,
    `Click the **"How to claim"** button next to your entry`,
    `Complete the ASIC online claim form — you will need to provide proof of identity (driver's licence, passport, or Medicare card) and proof of address`,
    `ASIC will verify your identity and contact **${holderName}** on your behalf to confirm the funds`,
    `Once verified, **${holderName}** is legally required to release the funds to ASIC, who will transfer them directly to your nominated bank account`,
    `Typical processing time is **4 to 8 weeks** from lodgement of your claim`,
  ];
  return steps;
}

// GET /api/claim-report?pid=<id>&session_id=<stripeSessionId>
// Returns prospect teaser always; verifies payment + returns full instructions if session_id provided
router.get("/claim-report", async (req, res): Promise<void> => {
  const pid = parseInt(req.query["pid"] as string ?? "", 10);
  const sessionId = req.query["session_id"] as string | undefined;

  if (isNaN(pid)) {
    res.status(400).json({ error: "Invalid prospect ID" });
    return;
  }

  const [prospect] = await db.select().from(prospectsTable).where(eq(prospectsTable.id, pid)).limit(1);
  if (!prospect) {
    res.status(404).json({ error: "Record not found" });
    return;
  }

  const dollars = parseAmountDollars(prospect.amount);
  const { pct, feeStr } = calcFee(dollars);

  const teaser = {
    name: prospect.name,
    amount: prospect.amount ?? "Amount on file",
    holder: prospect.holder ?? null,
    state: prospect.state ?? null,
    feePct: pct,
    feeStr,
  };

  // No session — return teaser only
  if (!sessionId) {
    res.json({ paid: false, teaser });
    return;
  }

  // Verify Stripe session
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    res.status(500).json({ error: "Stripe not configured" });
    return;
  }

  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      res.json({ paid: false, teaser });
      return;
    }

    // Verify the session is actually for this prospect
    if (session.metadata?.["prospectId"] !== String(pid)) {
      logger.warn({ pid, sessionId }, "claim-report: session prospectId mismatch");
      res.status(403).json({ error: "Session does not match this record" });
      return;
    }

    const steps = buildClaimInstructions(prospect.name, prospect.amount ?? "", prospect.holder, prospect.state);

    res.json({
      paid: true,
      teaser,
      report: {
        steps,
        officialUrl: "https://moneysmart.gov.au/find-unclaimed-money",
        dataSource: "ASIC MoneySmart public unclaimed money register",
        preparedAt: new Date().toISOString(),
        supportEmail: "support@missingcash.com.au",
      },
    });

    logger.info({ pid, sessionId }, "claim-report: full instructions returned");
  } catch (err) {
    logger.error({ err, pid, sessionId }, "claim-report: stripe verification failed");
    res.status(500).json({ error: "Could not verify payment" });
  }
});

export { buildClaimInstructions };
export default router;
