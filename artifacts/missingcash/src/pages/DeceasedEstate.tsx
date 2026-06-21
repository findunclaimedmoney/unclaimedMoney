import { useState } from "react";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Search, Shield, FileText, ChevronRight, CheckCircle2 } from "lucide-react";

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const RESOURCES = [
  { icon: "🏛️", title: "ASIC MoneySmart", desc: "Search unclaimed money by the deceased's name — works the same as a living person search.", url: "https://moneysmart.gov.au/find-unclaimed-money" },
  { icon: "📋", title: "ATO Deceased Estates", desc: "Contact the ATO to identify lost super and tax refunds owed to the deceased estate.", url: "https://www.ato.gov.au/individuals-and-families/deceased-estates" },
  { icon: "🏠", title: "State Revenue Offices", desc: "Each state holds unclaimed trust money — searchable by the deceased's name.", url: "https://moneysmart.gov.au/find-unclaimed-money" },
  { icon: "📈", title: "Computershare / Link (Shares)", desc: "Search share registries for unclaimed dividends and holdings in the deceased's name.", url: "https://www.computershare.com/au" },
  { icon: "🛡️", title: "Life Insurance (AFCA)", desc: "Many life insurance policies go unclaimed — AFCA maintains a register of lost policies.", url: "https://www.afca.org.au" },
  { icon: "🎰", title: "Unclaimed Lottery Prizes", desc: "Each state lottery holds unclaimed prizes — searchable by ticket number or name.", url: "https://www.thelott.com/unclaimed-prizes" },
];

const STEPS = [
  { n: "1", title: "Gather documentation", body: "You'll need the deceased's full name, date of birth, date of death, and your Grant of Probate or Letters of Administration — these prove your authority to act on behalf of the estate." },
  { n: "2", title: "Search all databases", body: "Use the free search tool below or let Mia guide you through every database. Search ASIC MoneySmart, all state registers, share registries, and the ATO using the deceased's exact name." },
  { n: "3", title: "Lodge claims with agencies", body: "Each agency has its own claim form. You'll submit the grant of probate, death certificate, and proof of your identity. Mia can walk you through each one step by step." },
  { n: "4", title: "Funds paid to estate", body: "Once verified, funds are paid into the estate account. The timeline varies — ASIC typically takes 4–8 weeks; state registers can be faster." },
];

export default function DeceasedEstate() {
  usePageSEO({
    title: "Deceased Estate Unclaimed Money Search — MissingCash",
    description: "Search for unclaimed money belonging to a deceased estate in Australia. Find lost super, bank accounts, shares, dividends and unclaimed funds across all government databases.",
    keywords: "deceased estate unclaimed money, deceased estate Australia, probate unclaimed money, lost super deceased, deceased estate bank accounts, unclaimed money after death Australia",
  });

  const [form, setForm] = useState({ firstName: "", lastName: "", state: "", yearOfDeath: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("mia:open", {
        detail: {
          message: `I'm looking for unclaimed money for a deceased estate. The person's name was ${form.firstName} ${form.lastName}${form.state ? `, they lived in ${form.state}` : ""}${form.yearOfDeath ? ` and passed away around ${form.yearOfDeath}` : ""}. Can you guide me through which databases to search and what documents I'll need to make claims?`,
          autoSend: true,
        },
      }));
    }, 1000);
  }

  return (
    <div className="w-full py-16">
      <div className="container mx-auto px-4">

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-full px-4 py-1.5 text-sm text-rose-400 font-medium mb-6">
            <Heart className="w-4 h-4" /> Deceased Estate Search
          </div>
          <h1 className="text-4xl md:text-5xl font-heading tracking-wider text-white mb-4">
            FIND MONEY FOR A<br /><span className="text-primary">DECEASED ESTATE</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            Billions in unclaimed money belongs to deceased Australians whose estates were never fully settled. Bank accounts, super, shares, dividends, rental bonds — we help you find and claim every dollar.
          </p>
          <p className="text-sm text-muted-foreground bg-card border border-border rounded-xl px-4 py-3 inline-block">
            🔒 You'll need a Grant of Probate or Letters of Administration to claim — but searching is free and takes 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto mb-16">

          {/* Search form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-2">Search Deceased Estate</h2>
              <p className="text-sm text-muted-foreground mb-6">Enter the details of the person who passed away. Mia will guide you through every database.</p>

              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Mia Is Guiding You</h3>
                  <p className="text-muted-foreground text-sm">Mia has opened below with a personalised guide for the {form.firstName} {form.lastName} estate. She'll walk you through every database and what documents you need.</p>
                </div>
              ) : (
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">Deceased First Name *</Label>
                      <Input value={form.firstName} onChange={set("firstName")} placeholder="John" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">Deceased Last Name *</Label>
                      <Input value={form.lastName} onChange={set("lastName")} placeholder="Smith" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">State They Lived In</Label>
                      <Select value={form.state} onValueChange={(v) => setForm((f) => ({ ...f, state: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                        <SelectContent>
                          {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">Approximate Year of Death</Label>
                      <Input value={form.yearOfDeath} onChange={set("yearOfDeath")} placeholder="e.g. 2021" maxLength={4} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-13 text-base font-bold tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_rgba(245,185,66,0.3)]">
                    <Search className="w-4 h-4 mr-2" /> Search With Mia's Guidance — Free
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">Mia will open and guide you step by step through every database</p>
                </form>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> What You Can Claim
              </h3>
              <ul className="space-y-2">
                {["Dormant bank accounts", "Lost superannuation", "Unclaimed shares & dividends", "Rental bond refunds", "Life insurance payouts", "Unclaimed lottery prizes", "Tax refunds (ATO)", "Trust money (state registers)"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary shrink-0">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
              <p className="text-xs text-rose-300 leading-relaxed">
                <strong>Legal note:</strong> To claim on behalf of a deceased estate you'll need a Grant of Probate or Letters of Administration from the Supreme Court of your state. Mia can explain this process in detail.
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-heading tracking-wider text-white text-center mb-8">How Deceased Estate Claims Work</h2>
          <div className="space-y-4">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-card border border-border rounded-xl p-5 flex gap-4">
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shrink-0">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database links */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-heading tracking-wider text-white text-center mb-6">Key Databases to Search</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RESOURCES.map((r) => (
              <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                className="bg-card border border-border hover:border-primary/40 rounded-xl p-4 flex gap-3 group transition-colors">
                <span className="text-2xl shrink-0">{r.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors flex items-center gap-1">
                    {r.title} <ChevronRight className="w-3 h-3" />
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{r.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
