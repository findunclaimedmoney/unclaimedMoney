import { Router } from "express";
import Stripe from "stripe";
import { db, companionSubscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

function stripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
}

const VOICE_LIMITS: Record<string, number | null> = {
  spark: 200,
  flame: null,
};

router.post("/companion/subscribe/checkout", async (req, res) => {
  const body = req.body as { tier?: string; email?: string; successUrl?: string; cancelUrl?: string };
  const { tier = "spark", email, successUrl, cancelUrl } = body;

  if (!["spark", "flame"].includes(tier)) {
    res.status(400).json({ error: "Invalid tier" });
    return;
  }

  const origin = req.headers.origin ?? `https://${process.env.REPLIT_DOMAINS?.split(",")[0] ?? "localhost"}`;
  const success = successUrl ?? `${origin}/companion/?session_id={CHECKOUT_SESSION_ID}`;
  const cancel = cancelUrl ?? `${origin}/companion/?cancelled=1`;

  try {
    const s = stripe();

    const products = await s.products.list({ active: true, limit: 100 });
    const product = products.data.find((p) => p.metadata["companion_tier"] === tier);
    if (!product) {
      res.status(404).json({ error: `No Stripe product found for tier: ${tier}. Run the seed script first.` });
      return;
    }

    const prices = await s.prices.list({ product: product.id, active: true, limit: 10 });
    const price = prices.data.find((p) => p.recurring?.interval === "month");
    if (!price) {
      res.status(404).json({ error: "No monthly price found for this tier" });
      return;
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: price.id, quantity: 1 }],
      success_url: success,
      cancel_url: cancel,
      metadata: { companion_tier: tier },
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await s.checkout.sessions.create(sessionParams);
    res.json({ checkoutUrl: session.url });
  } catch (err) {
    logger.error({ err }, "companion checkout error");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/companion/subscribe/verify", async (req, res) => {
  const body = req.body as { sessionId?: string };
  const { sessionId } = body;
  if (!sessionId) { res.status(400).json({ error: "sessionId required" }); return; }

  try {
    const s = stripe();
    const session = await s.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
    if (session.payment_status !== "paid") {
      res.status(402).json({ error: "Payment not completed" });
      return;
    }

    const email = session.customer_details?.email;
    const tier = session.metadata?.["companion_tier"] ?? "spark";

    if (!email) { res.status(400).json({ error: "No email on session" }); return; }

    const [existing] = await db.select().from(companionSubscribersTable).where(eq(companionSubscribersTable.email, email)).limit(1);
    if (!existing) {
      await db.insert(companionSubscribersTable).values({
        email,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
        stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null),
        tier,
        active: true,
        voiceMonthResetAt: new Date(),
      }).onConflictDoNothing();
    }

    res.json({ email, tier, active: true });
  } catch (err) {
    logger.error({ err }, "companion verify error");
    res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/companion/subscribe/status", async (req, res) => {
  const body = req.body as { email?: string };
  const { email } = body;
  if (!email) { res.status(400).json({ error: "email required" }); return; }

  try {
    const [subscriber] = await db.select().from(companionSubscribersTable).where(eq(companionSubscribersTable.email, email)).limit(1);

    if (!subscriber || !subscriber.active) {
      res.json({ tier: "free", active: false, voiceRemaining: 0, voiceLimit: 0 });
      return;
    }

    const limit = VOICE_LIMITS[subscriber.tier] ?? null;
    const now = new Date();
    const resetAt = subscriber.voiceMonthResetAt;
    const needsReset = !resetAt || (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear());

    let voiceUsed = subscriber.voiceMessagesThisMonth;
    if (needsReset) {
      await db.update(companionSubscribersTable).set({ voiceMessagesThisMonth: 0, voiceMonthResetAt: now }).where(eq(companionSubscribersTable.email, email));
      voiceUsed = 0;
    }

    const voiceRemaining = limit === null ? null : Math.max(0, limit - voiceUsed);
    res.json({ tier: subscriber.tier, active: true, voiceRemaining, voiceLimit: limit });
  } catch (err) {
    logger.error({ err }, "companion status error");
    res.status(500).json({ error: "Status check failed" });
  }
});

router.post("/companion/subscribe/portal", async (req, res) => {
  const body = req.body as { email?: string; returnUrl?: string };
  const { email, returnUrl } = body;
  if (!email) { res.status(400).json({ error: "email required" }); return; }

  const origin = req.headers.origin ?? `https://${process.env.REPLIT_DOMAINS?.split(",")[0] ?? "localhost"}`;

  try {
    const [subscriber] = await db.select().from(companionSubscribersTable).where(eq(companionSubscribersTable.email, email)).limit(1);
    if (!subscriber?.stripeCustomerId) { res.status(404).json({ error: "No subscription found" }); return; }

    const s = stripe();
    const portal = await s.billingPortal.sessions.create({
      customer: subscriber.stripeCustomerId,
      return_url: returnUrl ?? `${origin}/companion/`,
    });

    res.json({ portalUrl: portal.url });
  } catch (err) {
    logger.error({ err }, "companion portal error");
    res.status(500).json({ error: "Portal creation failed" });
  }
});

export async function handleCompanionSubscriptionWebhook(
  event: { type: string; data: { object: Record<string, unknown> } }
) {
  const sub = event.data.object as {
    id?: string;
    customer?: string;
    status?: string;
    metadata?: Record<string, string>;
    items?: { data?: Array<{ price?: { product?: { metadata?: Record<string, string> }; id?: string } }> };
  };

  if (!sub.id || !sub.customer) return;

  let tier = sub.metadata?.["companion_tier"];
  if (!tier && sub.items?.data?.[0]?.price?.product) {
    const productMeta = sub.items.data[0].price.product as { metadata?: Record<string, string> };
    tier = productMeta?.metadata?.["companion_tier"] ?? "spark";
  }
  if (!tier) tier = "spark";

  const active = sub.status === "active" || sub.status === "trialing";

  const s = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  const customer = await s.customers.retrieve(sub.customer as string) as Stripe.Customer;
  const email = customer.email;
  if (!email) return;

  await db.insert(companionSubscribersTable).values({
    email,
    stripeCustomerId: sub.customer as string,
    stripeSubscriptionId: sub.id,
    tier,
    active,
    voiceMonthResetAt: new Date(),
  }).onConflictDoUpdate({
    target: companionSubscribersTable.email,
    set: {
      stripeCustomerId: sub.customer as string,
      stripeSubscriptionId: sub.id,
      tier,
      active,
      updatedAt: new Date(),
    },
  });

  logger.info({ email, tier, active }, "companion subscription updated");
}

export async function recordVoiceMessage(email: string): Promise<boolean> {
  const [subscriber] = await db.select().from(companionSubscribersTable).where(eq(companionSubscribersTable.email, email)).limit(1);
  if (!subscriber || !subscriber.active) return false;

  const limit = VOICE_LIMITS[subscriber.tier];
  if (limit === null) return true;

  if (subscriber.voiceMessagesThisMonth >= limit) return false;

  await db.update(companionSubscribersTable).set({
    voiceMessagesThisMonth: subscriber.voiceMessagesThisMonth + 1,
    updatedAt: new Date(),
  }).where(eq(companionSubscribersTable.email, email));

  return true;
}

export default router;
