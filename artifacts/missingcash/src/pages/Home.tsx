import UnclaimedTicker from "@/components/UnclaimedTicker";
import EmailAlertSignup from "@/components/EmailAlertSignup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronRight, Bell, Zap, BookOpen, Gift } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePageSEO } from "@/hooks/use-page-seo";

export default function Home() {
  usePageSEO({
    title: "MissingCash | Find Your Unclaimed Money in Australia — Free Search",
    description:
      "Search billions in unclaimed money held by the ATO, ASIC, banks and state registers. MissingCash helps Australians find and claim lost super, shares, dividends and dormant accounts.",
    keywords:
      "unclaimed money Australia, missing money, lost super, ASIC unclaimed money, ATO unclaimed super, find lost money, dormant bank accounts, unclaimed dividends, MissingCash",
    canonical: "https://www.missingcash.com.au/",
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const firstName = (formData.get("firstName") as string ?? "").trim();
    const lastName = (formData.get("lastName") as string ?? "").trim();
    if (!firstName || !lastName) return;
    const params = new URLSearchParams({ firstName, lastName });
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center rounded-full border border-border bg-secondary/50 backdrop-blur-sm px-4 py-1.5 mb-8 shadow-sm">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground flex items-center gap-2">
                <span role="img" aria-label="au">🇦🇺</span> TRUSTED · SECURE · OFFICIAL SOURCES
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl mb-6 flex flex-col md:block">
              <span className="text-white drop-shadow-sm">FIND YOUR </span>
              <span className="text-primary drop-shadow-[0_0_15px_rgba(245,185,66,0.3)]">MISSING CASH</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Australians have <strong className="text-white font-semibold">billions sitting unclaimed</strong> with the government.
              Banks, the ATO &amp; ASIC are holding your money — waiting for you to claim it.
            </p>

            <div className="inline-flex flex-col items-center gap-1 bg-secondary border border-border px-6 py-3 rounded-2xl mb-12 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Live — Total Unclaimed in Australia</span>
              </div>
              <UnclaimedTicker />
            </div>

            {/* Search Card */}
            <Card className="bg-card border-border shadow-2xl max-w-3xl mx-auto backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <CardHeader className="text-center pb-4 border-b border-border/50 bg-secondary/30">
                <CardTitle className="text-2xl font-heading tracking-wider flex items-center justify-center gap-2">
                  <Search className="w-5 h-5 text-primary" /> SEARCH YOUR NAME NOW
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="firstName" className="text-muted-foreground">First Name *</Label>
                      <Input id="firstName" name="firstName" placeholder="e.g. John" required className="bg-background h-12 text-base" data-testid="input-first-name" />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="lastName" className="text-muted-foreground">Last Name *</Label>
                      <Input id="lastName" name="lastName" placeholder="e.g. Smith" required className="bg-background h-12 text-base" data-testid="input-last-name" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="state" className="text-muted-foreground">State (Optional)</Label>
                      <Select name="state" defaultValue="all">
                        <SelectTrigger id="state" className="bg-background h-12 text-base">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All States</SelectItem>
                          <SelectItem value="nsw">NSW</SelectItem>
                          <SelectItem value="vic">VIC</SelectItem>
                          <SelectItem value="qld">QLD</SelectItem>
                          <SelectItem value="wa">WA</SelectItem>
                          <SelectItem value="sa">SA</SelectItem>
                          <SelectItem value="tas">TAS</SelectItem>
                          <SelectItem value="nt">NT</SelectItem>
                          <SelectItem value="act">ACT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="birthYear" className="text-muted-foreground">Birth Year (Optional)</Label>
                      <Input id="birthYear" name="birthYear" type="number" placeholder="YYYY" min="1900" max={new Date().getFullYear()} className="bg-background h-12 text-base" data-testid="input-birth-year" />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_rgba(245,185,66,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0" data-testid="button-search-submit">
                    <Search className="w-5 h-5 mr-2" /> SEARCH ALL DATABASES NOW
                  </Button>

                  <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1.5 mt-4">
                    <span role="img" aria-label="lock">🔒</span> Free via a Stratton Finance quote, or $99.99 direct · ATO, ASIC, myGov, State Registers &amp; more
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* REFERRAL PROGRAM — top priority placement */}
      {/* ══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent border-y border-primary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-bold mb-6 shadow-lg shadow-primary/30">
              <Gift className="w-4 h-4" /> REFER & EARN — NO CAP
            </div>
            <h2 className="text-4xl md:text-6xl font-heading tracking-wider mb-4 text-white">
              REFER A FRIEND<br /><span className="text-primary">EARN 2% OF THEIR LOAN</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Know someone who needs a car, personal, or business loan? Send
              them your link. If their loan is approved for $5,000 or more
              through Stratton Finance, <strong className="text-white">you earn 2% of the loan amount</strong> —
              cash or a Visa card. No cap. The bigger the loan, the bigger the reward.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            {[
              { amount: "$5,000", reward: "$100" },
              { amount: "$10,000", reward: "$200" },
              { amount: "$50,000", reward: "$1,000" },
            ].map((tier) => (
              <div
                key={tier.amount}
                className="rounded-2xl border-2 border-primary/30 bg-card p-6 text-center shadow-lg hover:border-primary/60 transition-colors"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Loan approved for
                </p>
                <p className="text-2xl font-bold text-white mb-3">{tier.amount}</p>
                <div className="w-full h-px bg-primary/30 mb-3" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  You earn
                </p>
                <p className="text-4xl font-black text-primary">{tier.reward}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a href="/refer">
              <Button className="h-16 px-12 text-xl font-bold tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_8px_30px_rgba(245,185,66,0.4)] hover:-translate-y-0.5 transition-all">
                <Gift className="w-6 h-6 mr-2" /> Get My Referral Link
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-4">
              Free to join · No account fees · Paid once your friend's loan is confirmed with Stratton
            </p>
          </div>
        </div>
      </section>

      {/* Stratton Finance Partner Banner */}
      <section className="py-6 border-b border-border/50">
        <div className="container mx-auto px-4">
          <a href="/finance" className="block max-w-3xl mx-auto">
            <div className="rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all p-5 flex flex-col sm:flex-row items-center gap-5 group cursor-pointer">
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="bg-white rounded-xl px-5 py-3 shadow-sm">
                  <img src="/stratton-logo.png" alt="Stratton Finance" className="h-8 w-auto" />
                </div>
                <div className="bg-white rounded-2xl px-8 py-5 flex flex-col items-center gap-3 shadow-xl border-2 border-primary min-w-[160px]">
                  <span className="text-5xl">🔍</span>
                  <span className="font-black text-primary text-3xl leading-none">FREE</span>
                  <div className="w-full h-px bg-primary/30" />
                  <span className="font-bold text-primary text-xs tracking-[0.2em] uppercase">SEARCH INCLUDED</span>
                </div>
              </div>
              <div className="text-center sm:text-left flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-0.5">Finance Partner</p>
                <p className="text-white font-bold text-base leading-snug">Need a car, personal or business loan?</p>
                <p className="text-muted-foreground text-sm">Get a no-obligation quote from our trusted broker — fast approvals, competitive rates.</p>
                <p className="text-xs font-semibold text-primary mt-1">⚡ Get a quote and your unclaimed-money search is free, as a thank-you.</p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-full text-sm group-hover:bg-primary/90 transition-colors">
                  Get Finance <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading tracking-wider mb-4 text-white">HOW IT WORKS</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Two simple paths — Mia searches every Australian database in under a minute either way.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "1", title: "Get a Free Quote", desc: "Answer a few quick questions for a no-obligation Stratton Finance quote — you're never signed up for anything just by asking." },
              { step: "2", title: "Search Included, Free", desc: "As a thank-you, Mia runs your unclaimed-money search across 8 government databases at no cost." },
              { step: "3", title: "Or Skip It — $99.99", desc: "Not interested in a quote? Pay a flat $99.99 and Mia searches immediately — results emailed within minutes, found or not." },
            ].map((item, i) => (
              <div key={i} className="relative p-6 rounded-2xl bg-card border border-border text-center flex flex-col items-center group hover:border-primary/50 transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-heading text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-10 text-border">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a href="/finance">
              <Button className="h-14 px-10 text-lg font-bold tracking-wider rounded-xl bg-[#00C1D5] hover:bg-[#00C1D5]/90 text-white shadow-[0_4px_20px_rgba(0,193,213,0.3)]">
                <Zap className="w-5 h-5 mr-2" /> Get a Free Quote — Free Search Included
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-3">No obligation to take the quote — search runs free either way</p>
          </div>
        </div>
      </section>

      {/* Two options */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading tracking-wider mb-4 text-white">TWO WAYS TO FIND YOUR MONEY</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Choose the option that works for you.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Option 1: DIY */}
            <div className="border border-border rounded-2xl p-6 flex flex-col text-center hover:border-primary/40 transition-colors bg-card">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/30 mx-auto mb-4">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <h4 className="font-heading text-lg text-white mb-2">DO IT YOURSELF</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-5 flex-1">
                Step-by-step PDF guide to search every database yourself — ATO, ASIC, all state offices, share registries, Fair Work &amp; more.
              </p>
              <a href="https://buy.stripe.com/6oUbJ0eCE4FDbAFaYo4c800" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full font-bold tracking-wider border-primary/40 text-primary hover:bg-primary/10">
                  GET THE GUIDE — $4.99
                </Button>
              </a>
              <p className="text-[10px] text-muted-foreground mt-2">📄 Instant PDF · Search at your own pace</p>
            </div>

            {/* Option 2: Mia */}
            <div className="relative border-2 border-[#00C1D5]/60 rounded-2xl p-6 flex flex-col text-center bg-gradient-to-b from-[#00C1D5]/10 to-transparent overflow-hidden">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00C1D5] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider whitespace-nowrap">⭐ FREE VIA A QUOTE</div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#00C1D5]/20 border border-[#00C1D5]/40 mx-auto mb-4 mt-2">
                <Zap className="w-7 h-7 text-[#00C1D5]" />
              </div>
              <h4 className="font-heading text-lg text-white mb-2">MIA DOES THE SEARCH</h4>
              <ul className="text-left text-xs text-muted-foreground space-y-2 mb-5 flex-1">
                <li className="flex items-start gap-2"><span className="text-[#00C1D5] mt-0.5">⚡</span><span>Searches <strong className="text-white">8 government databases</strong> automatically</span></li>
                <li className="flex items-start gap-2"><span className="text-[#00C1D5] mt-0.5">📧</span><span>Results <strong className="text-white">emailed to you</strong> within minutes</span></li>
                <li className="flex items-start gap-2"><span className="text-[#00C1D5] mt-0.5">💰</span><span><strong className="text-white">Free</strong> with a Stratton quote, or <strong className="text-white">$99.99</strong> direct</span></li>
              </ul>
              <a href="/finance">
                <Button className="w-full font-bold tracking-wider bg-[#00C1D5] hover:bg-[#00C1D5]/90 text-white shadow-[0_4px_14px_rgba(0,193,213,0.35)]">
                  GET A FREE QUOTE
                </Button>
              </a>
              <p className="text-[10px] text-muted-foreground mt-2">🔒 No obligation · Or skip to /search for $99.99</p>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Program */}
<section className="py-20 bg-secondary/30 border-y border-border">
  <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-5">
        🎁 Refer & Earn
      </div>
      <h2 className="text-4xl md:text-5xl font-heading tracking-wider mb-4 text-white">
        REFER A FRIEND, EARN 2%
      </h2>
      <p className="text-muted-foreground max-w-xl mx-auto">
        Know someone who could use a car, personal, or business loan? Send
        them your link — if their loan is approved for $5,000 or more, you
        earn 2% of the loan amount. No cap.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
      {[
        { amount: "$5,000", reward: "$100" },
        { amount: "$10,000", reward: "$200" },
        { amount: "$50,000", reward: "$1,000" },
      ].map((tier) => (
        <div
          key={tier.amount}
          className="rounded-2xl border border-border bg-card p-6 text-center"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Loan approved for
          </p>
          <p className="text-2xl font-bold text-white mb-3">{tier.amount}</p>
          <div className="w-full h-px bg-primary/20 mb-3" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            You earn
          </p>
          <p className="text-3xl font-black text-primary">{tier.reward}</p>
        </div>
      ))}
    </div>

    <div className="text-center">
      <a href="/refer">
        <Button className="h-14 px-10 text-lg font-bold tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_20px_rgba(245,185,66,0.3)]">
          <Zap className="w-5 h-5 mr-2" /> Get My Referral Link
        </Button>
      </a>
      <p className="text-xs text-muted-foreground mt-3">
        Cash or a Visa card — paid once your friend's loan is confirmed with Stratton
      </p>
    </div>
  </div>
</section>
      
      {/* Marketing Video */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Meet Mia — Australia's First AI Avatar
            </div>
            <h2 className="text-4xl md:text-5xl font-heading tracking-wider mb-4 text-white">SEE HOW IT WORKS</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Watch Mia walk you through how MissingCash helps Australians find and reclaim what's theirs.</p>
          </div>
          <div className="relative max-w-sm mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-2xl aspect-[9/16]">
              <video src="/missingcash-hero.mp4" controls playsInline className="w-full h-full object-cover" />
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4 tracking-widest uppercase">
              Watch Mia explain how <span className="text-primary">MissingCash</span> works
            </p>
          </div>
        </div>
      </section>

      {/* Databases */}
      <section className="py-20 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading tracking-wider mb-4 text-white">DATABASES WE SEARCH</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Mia searches every official Australian unclaimed money register.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { title: "MoneySmart (ASIC)", desc: "The national unclaimed money register — shares, investments, and life insurance held by ASIC." },
              { title: "ATO", desc: "Australian Taxation Office — lost superannuation and unclaimed tax refunds via myGov." },
              { title: "All State Registers", desc: "NSW, VIC, QLD, WA, SA, TAS state revenue offices and territory unclaimed money registers." },
              { title: "Computershare", desc: "Share registry — unclaimed dividends and share holdings from Australian companies." },
              { title: "AFCA Life Insurance", desc: "Australian Financial Complaints Authority — life insurance and superannuation register." },
              { title: "Fair Work", desc: "Unpaid wages and entitlements from former employers lodged with the Fair Work Ombudsman." },
            ].map((db, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 hover:border-[#00C1D5]/40 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#00C1D5]" />
                  <h3 className="text-base font-bold text-white">{db.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{db.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Alert Signup */}
      <section id="alerts" className="py-16 border-t border-border">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-5">
            <Bell className="w-4 h-4" /> Weekly Money Alerts
          </div>
          <h2 className="text-3xl font-heading tracking-wider text-white mb-3">GET ALERTED WHEN<br /><span className="text-primary">NEW MONEY IS FOUND</span></h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            New unclaimed money is added to government databases every week. Get a free weekly alert when names matching yours appear in your state's registers.
          </p>
          <div className="bg-card border border-border rounded-2xl p-6">
            <EmailAlertSignup />
          </div>
        </div>
      </section>

      {/* Trust factors */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center max-w-6xl mx-auto">
            {[
              { title: "Official Sources Only", icon: "🏛️" },
              { title: "100% Australian Owned", icon: "🇦🇺" },
              { title: "Free to Search", icon: "⚡" },
              { title: "ATO · ASIC · myGov", icon: "✅" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading tracking-wider mb-4 text-white">FREQUENTLY ASKED QUESTIONS</h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-referral" className="bg-card border border-primary/30 rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary">How does the referral program work?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Get your referral link at <a href="/refer" className="underline text-primary">missingcash.com.au/refer</a> — it's free, just create an account with your name, mobile, and email. Share your link with friends or family. If someone you refer submits a Stratton Finance enquiry through your link and their loan is approved for $5,000 or more, you earn 2% of the loan amount — cash or a Visa card. There's no cap, so bigger loans mean bigger rewards.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-1" className="bg-card border border-border rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary">How does the search work?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                There are two ways to search. Get a free, no-obligation Stratton Finance quote and Mia runs your unclaimed-money search across 8 Australian government databases as a thank-you — completely free. Or skip the quote and pay a flat $99.99 for Mia to search immediately. Either way, results are emailed to you within minutes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="bg-card border border-border rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary">What happens if Mia finds money?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Mia emails you directly with what was found and a full personalised claim report — exact institution names, account references, claim form links, and step-by-step instructions. There's no extra fee on top of your search — the $99.99 (or free-via-quote) search already covers the full report.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="bg-card border border-border rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary">Is this service really free?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                The search is free if you get a Stratton Finance quote first — no obligation to take the loan, just answer a few questions. If you'd rather not, it's a flat $99.99 to search directly, no finance questions involved.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="bg-card border border-border rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary">Are you a government agency?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                No, MissingCash is a private Australian service. We search publicly available government registers and provide tools and guides to help Australians navigate the claims process.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="bg-card border border-border rounded-lg px-4">
              <AccordionTrigger className="text-left font-medium hover:no-underline hover:text-primary">Is my personal information secure?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                Yes. Your details are only used to search unclaimed money databases and deliver your results. We do not sell or share your data with third parties. See our <a href="/privacy" className="underline text-primary">Privacy Policy</a>.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
