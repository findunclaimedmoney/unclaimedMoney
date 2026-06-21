import { useState } from "react";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Trophy, Ticket, Search, ChevronRight, AlertCircle } from "lucide-react";

const LOTTERIES = [
  {
    name: "The Lott (Tatts / Golden Casket / SA Lotteries / Interlotto)",
    states: "QLD, VIC, SA, TAS, NT, ACT",
    logo: "🎰",
    url: "https://www.thelott.com/unclaimed-prizes",
    checkMethod: "Search by ticket number or date on their official unclaimed prizes page.",
    biggestRecent: "$2.4M unclaimed — Powerball Div 1, Brisbane 2023",
    tipText: "The Lott covers most eastern states — this is where the biggest unclaimed prizes tend to sit.",
  },
  {
    name: "Lotterywest",
    states: "WA only",
    logo: "🏆",
    url: "https://www.lotterywest.wa.gov.au/prizes/claiming-your-prize",
    checkMethod: "WA residents check via Lotterywest's prize claim page. Prizes must be claimed within 12 months.",
    biggestRecent: "$1.8M unclaimed — Saturday Lotto, Perth 2022",
    tipText: "WA is the only state with its own lottery operator — if you're in WA, check here first.",
  },
  {
    name: "NSW Lotteries (The Lott NSW)",
    states: "NSW",
    logo: "🎟️",
    url: "https://www.thelott.com/unclaimed-prizes",
    checkMethod: "NSW falls under The Lott brand — use the same unclaimed prizes search tool.",
    biggestRecent: "$3.1M unclaimed — OzLotto Div 1, Sydney 2023",
    tipText: "NSW has the highest volume of lottery ticket sales — and the highest volume of unclaimed prizes.",
  },
  {
    name: "Oz Lotteries (online)",
    states: "All states",
    logo: "💻",
    url: "https://www.ozlotteries.com",
    checkMethod: "Online purchases are tracked to your account — log in to see any unclaimed wins.",
    biggestRecent: "Millions in online wins go unchecked each year when players forget to log in.",
    tipText: "If you've ever bought a lotto ticket online, log in and check your account — wins are waiting.",
  },
];

const TIPS = [
  "Check tickets from up to 12 months ago — most lotteries give you 12 months to claim.",
  "If you can't find an old physical ticket, try contacting the lottery provider with your payment receipt or bank record.",
  "Syndicate wins are common — if you were in a work or family syndicate, check with the organiser.",
  "Oz Lotteries and The Lott online accounts store all your ticket history — wins don't always notify you.",
  "Deceased estate lottery prizes can also be claimed — you'll need probate documents.",
];

export default function LotteryChecker() {
  usePageSEO({
    title: "Unclaimed Lottery Prize Checker Australia — MissingCash",
    description: "Check if you have unclaimed lottery prizes in Australia. Search The Lott, Lotterywest, OzLotteries and all state lotteries for prizes you may have missed.",
    keywords: "unclaimed lottery prize Australia, check lotto win, unclaimed lotto prize, The Lott unclaimed, Lotterywest unclaimed, OzLotteries unclaimed prize, missed lotto win",
  });

  const [name, setName] = useState("");
  const [searched, setSearched] = useState(false);

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setSearched(true);
    window.dispatchEvent(new CustomEvent("mia:open", {
      detail: {
        message: `I want to check if I have any unclaimed lottery prizes. My name is ${name || "not provided"}. Can you guide me through how to check The Lott, Lotterywest, and any other Australian lottery providers for unclaimed prizes I might have missed?`,
        autoSend: true,
      },
    }));
  }

  return (
    <div className="w-full py-16">
      <div className="container mx-auto px-4">

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 text-sm text-yellow-400 font-medium mb-6">
            <Trophy className="w-4 h-4" /> Unclaimed Prize Checker
          </div>
          <h1 className="text-4xl md:text-5xl font-heading tracking-wider text-white mb-4">
            UNCLAIMED<br /><span className="text-primary">LOTTERY PRIZES</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            Millions of dollars in lottery prizes go unclaimed every year in Australia. Old tickets, forgotten online accounts, syndicate wins — Mia guides you through every lottery to check.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Most lotteries only hold prizes for 12 months — check now before time runs out.
          </div>
        </div>

        {/* Quick check */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 text-center">
            <Ticket className="w-10 h-10 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Check With Mia — Free</h2>
            <p className="text-sm text-muted-foreground mb-5">Enter your name and Mia will guide you through every Australian lottery database to check for unclaimed prizes.</p>
            <form onSubmit={handleCheck} className="flex gap-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="flex-1"
              />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 rounded-xl shrink-0">
                <Search className="w-4 h-4 mr-2" /> Check
              </Button>
            </form>
            {searched && (
              <p className="text-sm text-[#00C1D5] mt-3 animate-pulse">Mia is opening below to guide you through every lottery check…</p>
            )}
          </div>
        </div>

        {/* Lottery cards */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-heading tracking-wider text-white text-center mb-6">Australian Lottery Providers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {LOTTERIES.map((l) => (
              <div key={l.name} className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{l.logo}</span>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight">{l.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{l.states}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{l.checkMethod}</p>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                  <p className="text-xs text-yellow-300">💡 {l.tipText}</p>
                </div>

                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10 rounded-xl text-sm font-bold gap-2">
                    Check Unclaimed Prizes <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-heading tracking-wider text-white text-center mb-6">Tips for Checking Old Tickets</h2>
          <div className="space-y-3">
            {TIPS.map((tip, i) => (
              <div key={i} className="bg-card border border-border rounded-xl px-5 py-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#00C1D5]/10 to-primary/10 border-2 border-[#00C1D5]/30 rounded-2xl p-8">
            <h3 className="text-2xl font-heading text-white mb-2">Want Mia to Check Everything?</h3>
            <p className="text-muted-foreground mb-5 text-sm">Lottery prizes are just one source. Mia can search all 8 Australian databases — unclaimed money, super, shares, bonds and more.</p>
            <a href="/find-my-money">
              <Button className="bg-[#00C1D5] hover:bg-[#00C1D5]/90 text-white font-bold rounded-xl h-13 px-8 text-base">
                ⚡ Let Mia Find All My Money
              </Button>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
