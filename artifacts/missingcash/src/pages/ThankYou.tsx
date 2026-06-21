import { Link, useRoute } from "wouter";
import { usePageSEO } from "@/hooks/use-page-seo";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Home } from "lucide-react";
import { useEffect } from "react";

type GuideConfig = {
  title: string;
  subtitle: string;
  note: string;
  downloads: { label: string; file: string; color: string }[];
  steps: string[];
};

const configs: Record<string, GuideConfig> = {
  missingcash: {
    title: "Your Guide is Ready to Download",
    subtitle: "Thank you for your purchase. Your MissingCash Premium Guide is waiting — click below to download it instantly.",
    note: "PDF · Instant download · No account needed",
    downloads: [
      { label: "Download Your Guide Now", file: "/MissingCash_Premium_Guide-2.pdf", color: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_24px_rgba(245,185,66,0.35)]" },
    ],
    steps: [
      "Download and save your guide using the button above",
      "Open the PDF and follow the step-by-step instructions",
      "Lodge your claim directly with the relevant agency — it's free",
    ],
  },
  crypto: {
    title: "Your Crypto Recovery Guide is Ready",
    subtitle: "Thank you for your purchase. Download your MissingCrypto Recovery Guide now and start recovering lost digital assets.",
    note: "PDF · Instant download · Save a copy to a safe location",
    downloads: [
      { label: "Download Your Recovery Guide", file: "/MissingCrypto_Recovery_Guide-4.pdf", color: "bg-[#00C1D5] hover:bg-[#00C1D5]/90 text-white shadow-[0_8px_24px_rgba(0,193,213,0.35)]" },
    ],
    steps: [
      "Download and save your guide — keep a copy in a secure, offline location",
      "Start with your specific exchange chapter",
      "Follow the identity verification steps exactly as described",
    ],
  },
  cyber: {
    title: "Your Cyber Security Guide is Ready!",
    subtitle: "Download your guide now and start protecting your phone, accounts and digital life immediately.",
    note: "PDF · 12 chapters · Instant download · Save to a safe location",
    downloads: [
      { label: "Download Cyber Security Guide", file: "/Cyber_Security_Guide.pdf", color: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_8px_24px_rgba(0,100,255,0.35)]" },
    ],
    steps: [
      "Download and save your guide",
      "Start with Chapter 1 — securing your phone and SIM",
      "Work through each chapter to lock down your digital life",
    ],
  },
  identity: {
    title: "Your Identity Recovery Guide is Ready!",
    subtitle: "Download your guide now. Follow Chapter 2 first — the 24-hour emergency response plan is the most important place to start.",
    note: "PDF · 10 chapters · Template letters included · Instant download",
    downloads: [
      { label: "Download Identity Recovery Guide", file: "/Identity_Theft_Recovery_Guide.pdf", color: "bg-red-600 hover:bg-red-500 text-white shadow-[0_8px_24px_rgba(200,0,0,0.35)]" },
    ],
    steps: [
      "Download your guide immediately",
      "Go straight to Chapter 2 — the 24-hour emergency response plan",
      "Use the included template letters to dispute fraudulent accounts",
    ],
  },
  bundle: {
    title: "All 4 Guides Ready to Download!",
    subtitle: "You now have the complete MissingCash library. Download each guide below — save them all to a safe location on your device.",
    note: "4 PDFs · Instant downloads · Save all to a secure location",
    downloads: [
      { label: "💰 Download MissingCash Premium Guide", file: "/MissingCash_Premium_Guide-2.pdf", color: "bg-primary hover:bg-primary/90 text-primary-foreground" },
      { label: "₿ Download Crypto Recovery Guide", file: "/MissingCrypto_Recovery_Guide-4.pdf", color: "bg-[#00C1D5] hover:bg-[#00C1D5]/90 text-white" },
      { label: "📱 Download Cyber Security Guide", file: "/Cyber_Security_Guide.pdf", color: "bg-blue-600 hover:bg-blue-500 text-white" },
      { label: "🪪 Download Identity Recovery Guide", file: "/Identity_Theft_Recovery_Guide.pdf", color: "bg-red-600 hover:bg-red-500 text-white" },
    ],
    steps: [
      "Download all 4 guides using the buttons above",
      "Save each PDF to a safe location on your device",
      "Start with whichever guide is most relevant to you right now",
    ],
  },
};

const MIA_GUIDANCE: Record<string, string> = {
  missingcash: "I can see you've purchased the MissingCash Premium Guide. I'm Mia and I'm here to guide you through the full claiming process right now. Tell me your full name and which state you're in — I'll walk you through every database step by step so you don't miss a dollar.",
  crypto: "Welcome! You've got the MissingCrypto Recovery Guide. I'm Mia and I'll guide you through recovering your lost crypto accounts personally. Which exchange are you trying to recover — CoinSpot, Binance, Coinbase, Swyftx, or something else?",
  cyber: "Great choice getting the Cyber Security Guide. I'm Mia — let's get your digital life locked down right now. Tell me: are you more concerned about your phone security, your bank accounts, or your email and passwords? I'll start there.",
  identity: "You've taken the right step getting the Identity Theft Recovery Guide. I'm Mia and I'm here to help you right now. Has the identity theft already happened, or are you trying to prevent it? I'll guide you through the exact steps based on your situation.",
  bundle: "You've got the complete MissingCash library — fantastic! I'm Mia and I'm here to help you use every guide. What's most urgent for you right now — finding unclaimed money, recovering crypto, protecting your phone, or dealing with identity theft? Let's start there.",
  "mia-recovery": "Welcome to your MissingCash Speed Recovery service! I'm Mia — your personal recovery guide. I'm going to walk you through finding and claiming every dollar of your unclaimed money right now, personally and step by step. To get started, what's your full name and which Australian state are you in?",
  "done-for-you": "Fantastic — your Done For You search is confirmed! I'm Mia. Our team will search all 8 Australian databases for you and email your full results within 48 hours. To make sure we search the right records, can I get your full legal name and which state you live in?",
};

export default function ThankYou() {
  const [, params] = useRoute("/thank-you/:guide");
  const guide = params?.guide ?? "missingcash";
  const isMiaRecovery = guide === "mia-recovery";
  const isDoneForYou = guide === "done-for-you";

  const config = isMiaRecovery
    ? {
        title: "Mia is Ready to Guide You!",
        subtitle: "Your Speed Recovery session is active. Mia will open in a moment and guide you through the full claim process personally — step by step.",
        note: "Powered by Mia AI · Personalised guidance · Unlimited questions",
        downloads: [] as { label: string; file: string; color: string }[],
        steps: [
          "Mia will open automatically in a few seconds",
          "Tell Mia your name and state — she'll guide you through every database",
          "Follow Mia's step-by-step instructions to complete your claim",
        ],
      }
    : isDoneForYou
    ? {
        title: "Your Done For You Search is Confirmed!",
        subtitle: "Our team will search all 8 Australian unclaimed money databases for you and email your full results report within 48 hours.",
        note: "Mia is opening now to collect your details · Results within 48 hours",
        downloads: [] as { label: string; file: string; color: string }[],
        steps: [
          "Tell Mia your full name and state so we search the right records",
          "Our team searches ATO, ASIC, all state registers, bonds, and lotteries",
          "You receive a full results report by email within 48 hours — with claim instructions for every dollar found",
        ],
      }
    : (configs[guide] ?? configs.missingcash);

  usePageSEO({
    title: `${isMiaRecovery ? "Mia Speed Recovery" : isDoneForYou ? "Done For You Search Confirmed" : config.title} — MissingCash`,
    description: config.subtitle,
  });

  useEffect(() => {
    const msg = MIA_GUIDANCE[guide] ?? MIA_GUIDANCE["missingcash"];
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("mia:open", { detail: { message: msg, autoSend: true } }));
    }, 1500);
    return () => clearTimeout(timer);
  }, [guide]);

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center py-16">
      <div className="container mx-auto px-4 max-w-xl">
        {/* Success indicator */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading tracking-wider text-white mb-3">
            {config.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed">{config.subtitle}</p>
        </div>

        {/* Download buttons — only for guide products */}
        {config.downloads.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-3">
            {config.downloads.map((dl) => (
              <a key={dl.file} href={dl.file} download>
                <Button className={`w-full h-14 text-base font-bold tracking-wider rounded-xl flex items-center gap-2 mb-2 ${dl.color}`}>
                  <Download className="w-5 h-5" />
                  {dl.label}
                </Button>
              </a>
            ))}
            <p className="text-center text-xs text-muted-foreground pt-1">{config.note}</p>
          </div>
        )}

        {/* Service confirmation card — for Mia Recovery and Done For You */}
        {(isMiaRecovery || isDoneForYou) && (
          <div className={`border rounded-2xl p-6 mb-6 text-center ${isDoneForYou ? "bg-primary/10 border-primary/30" : "bg-[#00C1D5]/10 border-[#00C1D5]/30"}`}>
            <p className="text-4xl mb-3">{isDoneForYou ? "🔍" : "🤖"}</p>
            <p className={`font-bold text-lg mb-1 ${isDoneForYou ? "text-primary" : "text-[#00C1D5]"}`}>
              {isDoneForYou ? "Our team is on it" : "Mia is activating now"}
            </p>
            <p className="text-xs text-muted-foreground">{config.note}</p>
          </div>
        )}

        {/* Next steps */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-white mb-4">Your Next Steps</h3>
          <div className="space-y-3">
            {config.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back home */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-white gap-2">
              <Home className="w-4 h-4" /> Back to MissingCash
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
