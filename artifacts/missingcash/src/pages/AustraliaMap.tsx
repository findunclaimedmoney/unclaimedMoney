import { useState } from "react";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, DollarSign, Search } from "lucide-react";

const STATES = [
  {
    id: "NSW",
    name: "New South Wales",
    estimated: "$820M+",
    population: "8.2M",
    topSources: ["NSW Revenue (unclaimed trust money)", "ASIC MoneySmart", "Rental Bond Board NSW", "ATO Lost Super"],
    color: "#1e40af",
    hoverColor: "#3b82f6",
    searchUrl: "https://moneysmart.gov.au/find-unclaimed-money",
    fact: "NSW holds the largest share of Australia's unclaimed money due to its population size.",
  },
  {
    id: "VIC",
    name: "Victoria",
    estimated: "$650M+",
    population: "6.7M",
    topSources: ["State Revenue Office VIC", "ASIC MoneySmart", "Residential Tenancies Bond Authority", "ATO Lost Super"],
    color: "#7c3aed",
    hoverColor: "#8b5cf6",
    searchUrl: "https://moneysmart.gov.au/find-unclaimed-money",
    fact: "Victoria's RTBA holds millions in unreturned rental bonds from closed or moved tenancies.",
  },
  {
    id: "QLD",
    name: "Queensland",
    estimated: "$380M+",
    population: "5.4M",
    topSources: ["Queensland Treasury (unclaimed money)", "ASIC MoneySmart", "RTA QLD (rental bonds)", "ATO Lost Super"],
    color: "#b45309",
    hoverColor: "#d97706",
    searchUrl: "https://moneysmart.gov.au/find-unclaimed-money",
    fact: "QLD's rapid population growth means many people move interstate leaving accounts behind.",
  },
  {
    id: "WA",
    name: "Western Australia",
    estimated: "$290M+",
    population: "2.9M",
    topSources: ["WA Department of Treasury", "ASIC MoneySmart", "Bond Administrator WA", "ATO Lost Super"],
    color: "#065f46",
    hoverColor: "#10b981",
    searchUrl: "https://moneysmart.gov.au/find-unclaimed-money",
    fact: "Mining boom workers often left superannuation and accounts behind when moving back east.",
  },
  {
    id: "SA",
    name: "South Australia",
    estimated: "$140M+",
    population: "1.8M",
    topSources: ["SA Revenue (unclaimed money)", "ASIC MoneySmart", "Consumer & Business Services SA", "ATO Lost Super"],
    color: "#9f1239",
    hoverColor: "#f43f5e",
    searchUrl: "https://moneysmart.gov.au/find-unclaimed-money",
    fact: "SA has a high proportion of unclaimed life insurance policies relative to its population.",
  },
  {
    id: "TAS",
    name: "Tasmania",
    estimated: "$45M+",
    population: "570K",
    topSources: ["Tasmanian Treasury", "ASIC MoneySmart", "Consumer, Building & Occupational Services TAS", "ATO Lost Super"],
    color: "#0e7490",
    hoverColor: "#06b6d4",
    searchUrl: "https://moneysmart.gov.au/find-unclaimed-money",
    fact: "Many Tasmanians moved to the mainland for work in the 1980s–2000s, leaving accounts behind.",
  },
  {
    id: "ACT",
    name: "Australian Capital Territory",
    estimated: "$28M+",
    population: "460K",
    topSources: ["ACT Revenue Office", "ASIC MoneySmart", "Access Canberra (bonds)", "ATO Lost Super"],
    color: "#4338ca",
    hoverColor: "#6366f1",
    searchUrl: "https://moneysmart.gov.au/find-unclaimed-money",
    fact: "ACT has a highly transient public service population — people move frequently, leaving accounts.",
  },
  {
    id: "NT",
    name: "Northern Territory",
    estimated: "$22M+",
    population: "250K",
    topSources: ["NT Treasury", "ASIC MoneySmart", "NT Consumer Affairs (bonds)", "ATO Lost Super"],
    color: "#92400e",
    hoverColor: "#f59e0b",
    searchUrl: "https://moneysmart.gov.au/find-unclaimed-money",
    fact: "FIFO workers and Defence personnel who were stationed in the NT often leave accounts dormant.",
  },
];

export default function AustraliaMap() {
  usePageSEO({
    title: "Unclaimed Money by State — Australia Map | MissingCash",
    description: "See how much unclaimed money is held in each Australian state and territory. Click your state to see which databases to search and start your free claim.",
    keywords: "unclaimed money NSW, unclaimed money VIC, unclaimed money QLD, unclaimed money WA, lost super by state, Australia unclaimed money map",
  });

  const [selected, setSelected] = useState<typeof STATES[0] | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full py-16">
      <div className="container mx-auto px-4">

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-6">
            <MapPin className="w-4 h-4" /> Unclaimed by State
          </div>
          <h1 className="text-4xl md:text-5xl font-heading tracking-wider text-white mb-4">
            WHERE IS<br /><span className="text-primary">YOUR MONEY?</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Over $2.6 billion sits unclaimed across all states and territories. Click your state to see exactly where to search and how much is estimated to be held.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">

          {/* State grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {STATES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  onMouseEnter={() => setHovered(s.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all duration-200 cursor-pointer ${
                    selected?.id === s.id
                      ? "border-primary bg-primary/10 scale-[1.03] shadow-[0_0_20px_rgba(245,185,66,0.2)]"
                      : hovered === s.id
                      ? "border-border/80 bg-secondary/60 scale-[1.02]"
                      : "border-border bg-card hover:border-border/80"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.id}
                  </div>
                  <p className="text-xs font-medium text-white leading-tight mb-1">{s.name}</p>
                  <p className="text-xs font-bold text-primary">{s.estimated}</p>
                </button>
              ))}
            </div>

            {/* Total bar */}
            <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total estimated nationally</p>
                  <p className="text-xl font-bold text-primary">$2,600,000,000+</p>
                </div>
              </div>
              <Link href="/find-my-money">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-5">
                  Search All States
                </Button>
              </Link>
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: selected.color }}
                  >
                    {selected.id}
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground">Pop. {selected.population}</p>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Estimated unclaimed</p>
                  <p className="text-3xl font-bold text-primary">{selected.estimated}</p>
                </div>

                <h3 className="text-sm font-bold text-white mb-3">Top databases to search:</h3>
                <ul className="space-y-2 mb-4">
                  {selected.topSources.map((src) => (
                    <li key={src} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5 shrink-0">✓</span> {src}
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-muted-foreground italic mb-5 leading-relaxed border-l-2 border-primary/30 pl-3">
                  {selected.fact}
                </p>

                <Link href="/find-my-money">
                  <Button className="w-full bg-[#00C1D5] hover:bg-[#00C1D5]/90 text-white font-bold rounded-xl h-12">
                    <Search className="w-4 h-4 mr-2" /> Search {selected.id} Databases
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center gap-4">
                <MapPin className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">Click any state to see how much unclaimed money is estimated there and which databases to search.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO content */}
        <div className="max-w-3xl mx-auto mt-16 space-y-4">
          <h2 className="text-2xl font-heading tracking-wider text-white text-center mb-6">Unclaimed Money by State — What You Need to Know</h2>
          {STATES.map((s) => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-bold text-white mb-1">{s.name} ({s.id}) — Unclaimed Money</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An estimated <strong className="text-white">{s.estimated}</strong> is held unclaimed in {s.name}. Key databases to search include {s.topSources.slice(0, 3).join(", ")}. {s.fact} Use our free search tool or let Mia guide you through every {s.id} database personally.
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
