import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

async function seed() {
  const tiers = [
    {
      companion_tier: "spark",
      name: "Companion Spark",
      description: "Voice chat with Mia or Alex, custom persona from photo, 200 voice messages/month",
      unitAmount: 999,
    },
    {
      companion_tier: "flame",
      name: "Companion Flame",
      description: "Everything in Spark + unlimited voice, 3 custom personas, long-term memory, HeyGen video calls",
      unitAmount: 1999,
    },
  ];

  for (const tier of tiers) {
    const existing = await stripe.products.search({ query: `metadata['companion_tier']:'${tier.companion_tier}'`, limit: 1 });

    if (existing.data.length > 0) {
      console.log(`${tier.name} already exists: ${existing.data[0]!.id}`);
      const prices = await stripe.prices.list({ product: existing.data[0]!.id, limit: 5 });
      console.log(`  Prices: ${prices.data.map(p => `${p.id} ($${(p.unit_amount ?? 0) / 100}/mo)`).join(", ")}`);
      continue;
    }

    const product = await stripe.products.create({
      name: tier.name,
      description: tier.description,
      metadata: { companion_tier: tier.companion_tier },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.unitAmount,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { companion_tier: tier.companion_tier },
    });

    console.log(`Created ${tier.name}: product=${product.id}, price=${price.id} ($${tier.unitAmount / 100}/mo)`);
  }
}

seed().then(() => { console.log("Done."); process.exit(0); }).catch((err) => { console.error(err); process.exit(1); });
