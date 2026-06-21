import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import { Shield, Star } from "lucide-react";

const STRIPE = {
  missingcash: "https://buy.stripe.com/6oUbJ0eCE4FDbAFaYo4c800",
  crypto: "https://buy.stripe.com/9B600iamo3Bz48d6I84c801",
  cyber: "https://buy.stripe.com/5kQbJ0eCEgolgUZ6I84c80d",
  identity: "https://buy.stripe.com/28EcN46686NLdIN8Qg4c80e",
  bundle: "https://buy.stripe.com/cNi14m9ikdc93492rS4c80g",
  miaRecovery: "https://buy.stripe.com/PLACEHOLDER_MIA_RECOVERY",
  doneForYou: "https://buy.stripe.com/PLACEHOLDER_DONE_FOR_YOU",
};

const guides = [
  {
    emoji: "💰",
    title: "MissingCash Premium Guide",
    subtitle: "Step-by-step claim guide",
    price: 4.99,
    stripeUrl: STRIPE.missingcash,
    features: [
      "Complete ATO, ASIC & bank claim instructions",
      "Exact forms and supporting documents required",
      "Step-by-step lodgement for each agency",
      "How to speed up slow claims",
      "Common rejection reasons — and how to avoid them",
      "Instant PDF · Lifetime access",
    ],
    highlight: false,
    badge: null,
  },
  {
    emoji: "₿",
    title: "MissingCrypto Recovery Guide",
    subtitle: "Recover lost exchange accounts",
    price: 29.90,
    stripeUrl: STRIPE.crypto,
    features: [
      "CoinSpot, Binance, Coinbase, Swyftx & Independent Reserve",
      "Hardware wallet & seed phrase recovery (Ledger & Trezor)",
      "What to do if your exchange has closed down",
      "ATO tax implications of recovered cryptocurrency",
      "Scam warning — avoid fake recovery services",
      "Printable crypto asset tracker · Lifetime access",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    emoji: "📱",
    title: "Cyber Security Guide",
    subtitle: "Protect your digital life",
    price: 4.99,
    stripeUrl: STRIPE.cyber,
    features: [
      "Phone & SIM-swap attack prevention",
      "Secure your online banking and email accounts",
      "How to detect if you've already been hacked",
      "Two-factor authentication setup guide",
      "Password manager best practices",
      "Instant PDF · Lifetime access",
    ],
    highlight: false,
    badge: null,
  },
  {
    emoji: "🪪",
    title: "Identity Theft Recovery Guide",
    subtitle: "Reclaim your identity",
    price: 4.99,
    stripeUrl: STRIPE.identity,
    features: [
      "How to place fraud alerts with Australian credit bureaus",
      "Step-by-step dispute process with Equifax, Experian & illion",
      "What to do if someone has opened accounts in your name",
      "Reporting to ACCC Scamwatch and AFCA",
      "Template letters included",
      "Instant PDF · Lifetime access",
    ],
    highlight: false,
    badge: null,
  },
];

export default function Guides() {
  usePageSEO({
    title: "Recovery Guides | MissingCash — Unclaimed Money, Crypto & Identity Protection",
    description:
      "Get step-by-step Australian recovery guides for unclaimed money claims, lost crypto, cyber security, and identity theft. From $4.99. Instant PDF downloads.",
    keywords:
      "unclaimed money guide Australia, crypto recovery guide, identity theft Australia, cyber security guide, MissingCash guides",
    canonical: "https://www.missingcash.com.au/guides",
  });

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-primary text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" /> Instant PDF Downloads
          </div>
          <h1 className="text-5xl md:text-6xl font-heading tracking-wider text-white mb-6">
            RECOVERY <span className="text-primary">GUIDES</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Step-by-step guides to help Australians find lost money, recover inaccessible crypto, and protect their digital identity.
          </p>
          <p className="text-sm text-muted-foreground">🔒 Secure via Stripe · Instant PDF download · 30-day money-back guarantee</p>
        </div>
      </section>

      {/* Done For You — top-tier hero product */}
      <section className="pb-4">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="relative rounded-2xl border-2 border-primary/60 p-8 bg-gradient-to-br from-primary/10 via-background to-primary/5 shadow-[0_0_60px_rgba(245,185,66,0.12)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-[#00C1D5] to-primary" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full tracking-wider">
              ⭐ BEST VALUE · DONE FOR YOU
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 mt-2">
              <div className="text-7xl shrink-0">🔍</div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-heading tracking-wider text-white mb-1">DONE FOR YOU SEARCH</h2>
                <p className="text-lg font-semibold text-primary mb-3">You pay once. We search everything. You get the results.</p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Our team searches all 8 Australian unclaimed money databases on your behalf and emails you a full results report within 48 hours. You don't have to click anything, navigate any government site, or spend a single minute searching.
                </p>
                <ul className="space-y-1.5 mb-6 text-sm text-left">
                  {[
                    "We search ATO, ASIC/MoneySmart, all 6 state revenue offices",
                    "We check rental bond authorities, share registries, and lotteries",
                    "Full results report emailed to you within 48 hours",
                    "Includes claim instructions for every dollar we find",
                    "Mia available for unlimited follow-up questions",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-0.5 shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div>
                    <span className="text-4xl font-bold text-primary">$149</span>
                    <span className="text-sm text-muted-foreground ml-2">one-time · results within 48 hours</span>
                  </div>
                  <a href={STRIPE.doneForYou} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button className="w-full h-14 px-8 text-lg font-bold tracking-wider rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_20px_rgba(245,185,66,0.4)]">
                      ⭐ Do It For Me — $149
                    </Button>
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-3">🔒 Secure via Stripe · You'll be asked for your details after payment · 48-hour turnaround guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mia Speed Recovery — guided hero product */}
      <section className="pb-6">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="relative rounded-2xl border-2 border-[#00C1D5]/50 p-8 bg-gradient-to-br from-[#00C1D5]/10 via-background to-primary/5 shadow-[0_0_60px_rgba(0,193,213,0.12)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00C1D5] via-primary to-[#00C1D5]" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00C1D5] text-white text-xs font-bold px-5 py-1.5 rounded-full tracking-wider">
              ⚡ INSTANT · GUIDED BY MIA
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 mt-2">
              <div className="text-7xl shrink-0">🤖</div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-heading tracking-wider text-white mb-1">MIA SPEED RECOVERY</h2>
                <p className="text-lg font-semibold text-[#00C1D5] mb-3">What takes months on your own — Mia does in minutes.</p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Finding unclaimed money yourself means months of navigating ATO portals, ASIC registers, state databases, and bank systems — most people give up. With Mia, you're guided through every single database in one conversation, right now.
                </p>
                <ul className="space-y-1.5 mb-6 text-sm text-left">
                  {[
                    "Mia activates the second your payment clears",
                    "Guides you live through ATO, ASIC, myGov & all state registers",
                    "No forms to navigate, no phone queues, no months of waiting",
                    "Covers crypto recovery, cyber security & identity protection too",
                    "Ask unlimited questions — Mia stays with you until it's done",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-[#00C1D5] mt-0.5 shrink-0">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div>
                    <span className="text-4xl font-bold text-primary">$99</span>
                    <span className="text-sm text-muted-foreground ml-2">one-time · Mia activates instantly</span>
                  </div>
                  <a href={STRIPE.miaRecovery} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button className="w-full h-14 px-8 text-lg font-bold tracking-wider rounded-xl bg-[#00C1D5] hover:bg-[#00C1D5]/90 text-white shadow-[0_4px_20px_rgba(0,193,213,0.4)]">
                      ⚡ Get Mia Speed Recovery — $99
                    </Button>
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mt-3">🔒 Secure via Stripe · 30-day money-back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Guides */}
      <section className="py-4 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {guides.map((guide) => (
              <div
                key={guide.title}
                className={`relative rounded-2xl border p-6 flex flex-col transition-all hover:border-primary/50 ${
                  guide.highlight
                    ? "bg-gradient-to-br from-[#00C1D5]/10 to-primary/10 border-[#00C1D5]/40 shadow-[0_0_30px_rgba(0,193,213,0.1)]"
                    : "bg-card border-border"
                }`}
              >
                {guide.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00C1D5] text-white text-xs font-bold px-4 py-1 rounded-full tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> {guide.badge}
                  </div>
                )}

                <div className="flex items-start gap-4 mb-5">
                  <div className="text-4xl">{guide.emoji}</div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-snug">{guide.title}</h2>
                    <p className="text-sm text-muted-foreground">{guide.subtitle}</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {guide.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-primary">${guide.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">one-time · instant PDF</span>
                  </div>
                  <a href={guide.stripeUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      className={`w-full font-bold tracking-wider rounded-xl h-12 ${
                        guide.highlight
                          ? "bg-[#00C1D5] hover:bg-[#00C1D5]/90 text-white shadow-[0_4px_14px_rgba(0,193,213,0.3)]"
                          : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_rgba(245,185,66,0.3)]"
                      }`}
                    >
                      Get Instant Access — ${guide.price.toFixed(2)}
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle */}
      <section className="py-16 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-heading tracking-wider text-white mb-3">
              🏆 THE BUNDLE
            </h2>
            <p className="text-muted-foreground">Get all 4 guides and save $5</p>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/40 rounded-2xl p-8 shadow-[0_0_40px_rgba(245,185,66,0.1)]">
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              {[
                { label: "💰 MissingCash Premium Guide", price: "$4.99" },
                { label: "₿ Crypto Recovery Guide", price: "$29.90" },
                { label: "📱 Cyber Security Guide", price: "$4.99" },
                { label: "🪪 Identity Theft Recovery Guide", price: "$4.99" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2 border border-border">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-white font-semibold ml-2 shrink-0">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-primary/20 pt-4 mb-6">
              <span className="text-muted-foreground">Total if bought separately</span>
              <span className="text-muted-foreground line-through">$44.87</span>
            </div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-white font-bold text-lg">🏆 Bundle Price</span>
              <span className="text-primary font-bold text-3xl">$39.90</span>
            </div>

            <a href={STRIPE.bundle} target="_blank" rel="noopener noreferrer">
              <Button className="w-full h-14 text-lg font-bold tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_20px_rgba(245,185,66,0.4)]">
                🏆 Get All 4 Guides — $39.90
              </Button>
            </a>
            <p className="text-center text-xs text-muted-foreground mt-4">
              🔒 Secure via Stripe · Instant PDF downloads · 30-day money-back guarantee
            </p>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: "🔒", label: "Secure via Stripe" },
              { icon: "⚡", label: "Instant PDF Download" },
              { icon: "🔄", label: "30-Day Money Back" },
              { icon: "♾️", label: "Lifetime Access" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="text-3xl">{item.icon}</div>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
