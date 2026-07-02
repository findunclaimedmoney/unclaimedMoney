import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

interface Props {
  onBack: () => void;
}

const TIERS = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    period: "",
    description: "Try it out",
    features: [
      "Text chat with Mia or Alex",
      "10 messages per day",
      "Session memory only",
    ],
    excluded: ["Voice replies", "Custom companion from photo", "Video calls"],
    cta: "Current plan",
    disabled: true,
  },
  {
    id: "spark" as const,
    name: "Spark",
    price: "$9.99",
    period: "/month",
    description: "The full experience",
    features: [
      "Unlimited text chat",
      "200 voice replies/month",
      "Custom companion from your photo",
      "30-day memory",
    ],
    excluded: ["Video calls (Flame only)"],
    cta: "Start Spark",
    disabled: false,
    highlighted: true,
  },
  {
    id: "flame" as const,
    name: "Flame",
    price: "$19.99",
    period: "/month",
    description: "Everything, no limits",
    features: [
      "Everything in Spark",
      "Unlimited voice replies",
      "Up to 3 custom companions",
      "Long-term memory",
      "HeyGen video calls",
    ],
    excluded: [],
    cta: "Start Flame",
    disabled: false,
  },
];

export function Pricing({ onBack }: Props) {
  const { status, checkout, activate } = useSubscription();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [showActivate, setShowActivate] = useState(false);
  const [activateEmail, setActivateEmail] = useState("");
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateError, setActivateError] = useState("");

  const handleCheckout = async (tier: "spark" | "flame") => {
    setLoadingTier(tier);
    try {
      await checkout(tier);
    } catch {
      setLoadingTier(null);
    }
  };

  const handleActivate = async () => {
    if (!activateEmail.trim()) return;
    setActivateLoading(true);
    setActivateError("");
    try {
      await activate(activateEmail.trim().toLowerCase());
      onBack();
    } catch {
      setActivateError("Could not find an active subscription for that email.");
    } finally {
      setActivateLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center p-6 w-full">
      <div className="w-full max-w-4xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-light">Choose your plan</h1>
          <p className="text-muted-foreground mt-3">
            {status.active
              ? `You're on ${status.tier === "spark" ? "Spark" : "Flame"} — subscribed as ${status.email}`
              : "Start free, upgrade when you're ready"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {TIERS.map((tier) => {
            const isCurrent = status.active && status.tier === tier.id;
            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-6 flex flex-col border transition-all ${
                  tier.highlighted && !status.active
                    ? "border-primary/60 bg-primary/5"
                    : "border-white/8 bg-card"
                }`}
              >
                {tier.highlighted && !status.active && (
                  <div className="text-xs font-semibold text-primary mb-3 uppercase tracking-widest">Most popular</div>
                )}
                <div className="mb-4">
                  <h3 className="text-2xl font-medium">{tier.name}</h3>
                  <div className="mt-1">
                    <span className="text-3xl font-light">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {tier.excluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground/50">
                      <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-center text-xs">—</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${tier.highlighted && !status.active ? "" : "variant-outline"}`}
                  variant={tier.highlighted && !status.active ? "default" : "outline"}
                  disabled={tier.disabled || isCurrent || loadingTier !== null}
                  onClick={() => !tier.disabled && !isCurrent && handleCheckout(tier.id as "spark" | "flame")}
                >
                  {loadingTier === tier.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    "Current plan"
                  ) : (
                    tier.cta
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {!showActivate ? (
          <p className="text-center text-sm text-muted-foreground">
            Already subscribed?{" "}
            <button
              className="text-primary hover:underline"
              onClick={() => setShowActivate(true)}
            >
              Enter your email to activate
            </button>
          </p>
        ) : (
          <div className="max-w-sm mx-auto space-y-3">
            <p className="text-center text-sm text-muted-foreground">Enter the email you subscribed with</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={activateEmail}
                onChange={(e) => setActivateEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-secondary/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                onKeyDown={(e) => e.key === "Enter" && handleActivate()}
              />
              <Button size="sm" onClick={handleActivate} disabled={activateLoading || !activateEmail.trim()}>
                {activateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activate"}
              </Button>
            </div>
            {activateError && <p className="text-destructive text-xs text-center">{activateError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
