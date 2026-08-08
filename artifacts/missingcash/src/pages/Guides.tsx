import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import { Shield, Search, HandCoins, ArrowRight, CheckCircle2 } from "lucide-react";

const STRIPE = {
  missingcash: "https://buy.stripe.com/6oUbJ0eCE4FDbAFaYo4c800",
  miaRecovery: "https://buy.stripe.com/5kQdR82TWdc9eMR2rS4c80i",
};

const guide = {
  title: "MissingCash Premium Guide",
  subtitle: "The DIY route",
  price: 4.99,
  stripeUrl: STRIPE.missingcash,
  features: [
    "Complete ATO, ASIC & bank claim instructions",
    "Exact forms and supporting documents required",
    "Step-by-step lodgement for each agency",
    "How to speed up slow claims",
    "Common rejection reasons — and how to avoid them",
  ],
};

export default function Guides() {
  usePageSEO({
    title: "How It Works | MissingCash — Find & Claim Unclaimed Money",
    description:
      "Get a free finance quote and receive a free search, or pay $9.99 and Mia searches for your money right now. Step-by-step guides available too.",
    keywords: "unclaimed money guide Australia, MissingCash how it works, claim unclaimed money",
    canonical: "https://www.missingcash.com.au/guides",
  });

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-primary text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" /> Two ways in, one goal
          </div>
          <h1 className="text-5xl md:text-6xl font-heading tracking-wider text-white mb-6">
            HOW IT <span className="text-primary">WORKS</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Get a free finance quote and receive a free search — or skip
            straight to a $9.99 search and Mia looks for your money right
            now.
          </p>
        </div>
      </section>

      {/* The fork: two paths, side by side */}
      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Path A — free via quote */}
            <div className="rounded-2xl border border-primary/30 bg-card p-7 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                <HandCoins className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Get a quote, search free
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                Answer a few quick questions for a no-obligation Stratton
                Finance quote — you're never signed up for anything just by
                asking. As a thank-you, Mia runs your unclaimed-money search
                at no cost.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                {["No obligation to take the quote", "Search included, free", "Takes about 2 minutes"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/finance">
                <Button className="w-full h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                  Get My Quote <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>

            {/* Path B — flat $9.99 */}
            <div className="rounded-2xl border border-border bg-card p-7 flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center mb-5">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Skip it, search now
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                Not interested in a finance quote? No problem. Pay a flat
                $9.99 and Mia starts searching immediately — results emailed
                to you within minutes, found or not.
              </p>
              <ul className="space-y-2 mb-6 text-sm">
                {["No forms, no finance questions", "Flat $9.99, one time", "Results emailed within minutes"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="/search">
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-white/20 text-white hover:bg-white/5">
                  Search for $9.99 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mia Speed Recovery — premium tier */}
      <section className="pb-6">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="relative rounded-2xl border-2 border-[#00C1D5]/50 p-8 bg-gradient-to-br from-[#00C1D5]/10 via-background to-primary/5 shadow-[0_0_60px_rgba(0,193,213,0.12)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00C1D5] via-primary to-[#00C1D5]" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00C1D5] text-white text-xs font-bold px-5 py-1.5 rounded-full tracking-wider">
              ⚡ WANT IT DONE FOR YOU?
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 mt-2">
              <div className="text-7xl shrink-0">🤖</div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-heading tracking-wider text-white mb-1">MIA SPEED RECOVERY</h2>
                <p className="text-lg font-semibold text-[#00C1D5] mb-3">
                  What takes months on your own — Mia does in minutes.
                </p>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Searching 8 Australian databases yourself takes weeks — ATO
                  portals, ASIC registers, state offices, share registries.
                  Mia does it all for you and emails a full personalised
                  report, with claim instructions for every dollar found.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div>
                    <span className="text-4xl font-bold text-primary">$99</span>
                    <span className="text-sm text-muted-foreground ml-2">one-time · report in minutes</span>
                  </div>
                  <a href={STRIPE.miaRecovery} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button className="w-full h-14 px-8 text-lg font-bold tracking-wider rounded-xl bg-[#00C1D5] hover:bg-[#00C1D5]/90 text-white shadow-[0_4px_20px_rgba(0,193,213,0.4)]">
                      Get Mia Speed Recovery — $99
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIY guide */}
      <section className="py-4 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold text-white mb-1">{guide.title}</h2>
            <p className="text-sm text-muted-foreground mb-5">{guide.subtitle} — prefer to claim it yourself?</p>
            <ul className="space-y-2 mb-6">
              {guide.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-primary">${guide.price.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">one-time · instant PDF</span>
            </div>
            <a href={guide.stripeUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full font-bold tracking-wider rounded-xl h-12 bg-primary text-primary-foreground hover:bg-primary/90">
                Get Instant Access — ${guide.price.toFixed(2)}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: "🔒", label: "Secure via Stripe" },
              { icon: "⚡", label: "Results in minutes" },
              { icon: "🇦🇺", label: "100% Australian" },
              { icon: "🤝", label: "No obligation quote" },
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
