import { Bitcoin, Wallet, Search, AlertTriangle, ExternalLink, ShieldCheck, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { usePageSEO } from "@/hooks/use-page-seo";

export default function Crypto() {
  usePageSEO({
    title: "Recover Lost Cryptocurrency in Australia | MissingCash",
    description:
      "Lost access to old crypto, a forgotten exchange account or hardware wallet? MissingCash explains how Australians can safely trace and recover lost cryptocurrency — and how to avoid recovery scams.",
    keywords:
      "lost crypto recovery, recover cryptocurrency Australia, forgotten wallet, lost bitcoin, crypto recovery scam, dormant crypto, MissingCash crypto",
    canonical: "https://www.missingcash.com.au/crypto",
  });

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-border bg-secondary/50 px-4 py-1.5 mb-8">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground flex items-center gap-2">
              <Bitcoin className="w-3.5 h-3.5 text-primary" /> CRYPTO RECOVERY
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-heading tracking-wider mb-6 text-white">
            LOST <span className="text-primary">CRYPTO</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Millions in cryptocurrency sits in dormant wallets across Australia. Old exchange accounts, forgotten seed phrases, and inaccessible wallets could be holding your digital assets.
          </p>
        </div>
      </section>

      {/* What is lost crypto */}
      <section className="py-16 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-heading tracking-wider mb-6 text-white">WHERE DOES CRYPTO GET LOST?</h2>
              <div className="space-y-4">
                {[
                  { icon: <Wallet className="w-5 h-5 text-primary" />, title: "Old Exchange Accounts", desc: "Defunct or merged exchanges like Mt.Gox, BTC Markets, CoinJar may hold dormant balances." },
                  { icon: <Key className="w-5 h-5 text-primary" />, title: "Forgotten Seed Phrases", desc: "Wallets secured by a 12 or 24-word seed phrase that was misplaced, damaged, or forgotten." },
                  { icon: <Bitcoin className="w-5 h-5 text-primary" />, title: "Old Hardware Wallets", desc: "Trezor, Ledger, or paper wallets from early Bitcoin days with unrecovered funds." },
                  { icon: <AlertTriangle className="w-5 h-5 text-primary" />, title: "Deceased Estate Crypto", desc: "Digital assets left by a loved one, often without access instructions or recorded credentials." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                    <div className="mt-0.5 shrink-0">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">₿</div>
              <div className="text-5xl font-heading text-primary mb-2 tracking-wider">$4.5B+</div>
              <p className="text-muted-foreground mb-6">Estimated value of lost cryptocurrency in Australia alone</p>
              <div className="space-y-3 text-left">
                {["Bitcoin (BTC)", "Ethereum (ETH)", "Ripple (XRP)", "Litecoin (LTC)", "All other altcoins"].map((coin, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    {coin}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official resources */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-heading tracking-wider mb-4 text-white">OFFICIAL RECOVERY RESOURCES</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Use these official Australian resources to check for any dormant crypto-related funds or complaints.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "ASIC MoneySmart", url: "https://moneysmart.gov.au", desc: "Official financial guidance on crypto scams, fraud, and how to recover lost digital assets through legitimate channels." },
              { title: "AFCA", url: "https://www.afca.org.au", desc: "Australian Financial Complaints Authority — lodge a complaint if an exchange or platform is withholding your funds." },
              { title: "ATO Crypto", url: "https://www.ato.gov.au/individuals-and-families/investments-and-assets/crypto-asset-investments", desc: "The ATO's official guidance on crypto assets, including what to do if you've lost access to a wallet." },
            ].map((res, i) => (
              <Card key={i} className="bg-card border-border hover:border-primary/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{res.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{res.desc}</p>
                  <a href={res.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      Visit Site <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Warning */}
      <section className="py-16 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 mb-6">
            <ShieldCheck className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-3xl font-heading tracking-wider mb-4 text-white">BEWARE OF CRYPTO RECOVERY SCAMS</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Be extremely cautious of anyone claiming they can recover your crypto for an upfront fee. Most crypto recovery services are scams. Always verify through official Australian channels and consult ASIC's MoneySmart website before engaging any third party.
          </p>
          <Link href="/contact">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-wider rounded-full px-8">
              Contact Us for Legitimate Help
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA back to main search */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-4xl font-heading tracking-wider mb-4 text-white">DON'T FORGET TRADITIONAL UNCLAIMED MONEY</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            While you're here, check if the government is also holding any of your regular cash — unclaimed super, bank accounts, or share dividends.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-wider rounded-full px-10 h-14 text-lg shadow-[0_4px_14px_rgba(245,185,66,0.3)]">
              <Search className="w-5 h-5 mr-2" /> Search Unclaimed Money
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
