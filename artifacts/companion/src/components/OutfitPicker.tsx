import { useState } from "react";
import { ArrowLeft, Crown, Check, Loader2, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { useSubscription } from "@/hooks/use-subscription";

const base = import.meta.env.BASE_URL;
const apiBase = base.replace(/\/companion\/?$/, "");

const PORTRAITS: Record<string, string> = {
  mia: `${base}mia-portrait.png`,
  alex: `${base}alex-portrait.png`,
};

const MIA_FACE = "a young woman in her late 20s with long flowing blonde wavy hair, warm brown eyes, high cheekbones, soft features, and a naturally warm expression";
const ALEX_FACE = "a man in his early 30s with short dark brown hair, a strong jawline, defined features, calm and steady expression";

export const OUTFITS = [
  { id: "default",          name: "Default",           emoji: "✨", desc: "" },
  { id: "lawyer",           name: "Lawyer",             emoji: "⚖️", desc: "wearing a sharp tailored black blazer and crisp white blouse, courtroom professional attire, confident" },
  { id: "doctor",           name: "Doctor",             emoji: "🩺", desc: "wearing a white medical coat with a stethoscope around neck, warm and professional, clinical setting" },
  { id: "flight-attendant", name: "Flight Attendant",   emoji: "✈️", desc: "wearing an elegant navy blue airline uniform with a silk neck scarf, polished professional" },
  { id: "chef",             name: "Chef",               emoji: "🧑‍🍳", desc: "wearing a white chef's coat and apron, warm kitchen ambiance, culinary professional" },
  { id: "date-night",       name: "Date Night",         emoji: "🌹", desc: "wearing an elegant black cocktail dress, minimal gold jewellery, romantic evening out" },
  { id: "gym",              name: "Gym Wear",           emoji: "💪", desc: "wearing athletic gym wear, sporty and confident, fitness studio setting" },
  { id: "cozy",             name: "Cozy Night In",      emoji: "☕", desc: "wearing an oversized cozy knit sweater, warm home setting, relaxed evening look" },
  { id: "formal-gown",      name: "Formal Gown",        emoji: "👗", desc: "wearing a floor-length elegant evening gown, formal black-tie event, glamorous" },
  { id: "artist",           name: "Artist",             emoji: "🎨", desc: "wearing paint-stained denim overalls over a white shirt, creative studio setting" },
  { id: "business",         name: "Business",           emoji: "💼", desc: "wearing smart business casual attire, confident modern office setting" },
  { id: "beach",            name: "Beach Day",          emoji: "🏖️", desc: "wearing a casual summer beach outfit, relaxed sun-kissed tropical setting" },
  { id: "loungewear",       name: "Loungewear",         emoji: "🌙", desc: "wearing soft comfortable loungewear, cozy home evening setting, relaxed" },
  { id: "college",          name: "College Casual",     emoji: "📚", desc: "wearing casual university student style, campus background, youthful energy" },
  { id: "pilot",            name: "Pilot",              emoji: "🛫", desc: "wearing an airline pilot uniform with epaulettes, authoritative and professional" },
  { id: "scientist",        name: "Scientist",          emoji: "🔬", desc: "wearing a white lab coat and safety glasses, modern research laboratory setting" },
];

interface Props {
  sessionId: string;
  personaId: string;
  customPersona?: { name: string; faceDescription: string; portraitBase64: string } | null;
  activeOutfitId: string;
  onSelect: (outfitId: string, portraitBase64: string | null) => void;
  onBack: () => void;
  onUpgrade: () => void;
  subscription: ReturnType<typeof useSubscription>;
}

export function OutfitPicker({ sessionId, personaId, customPersona, activeOutfitId, onSelect, onBack, onUpgrade, subscription }: Props) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFlame = subscription.status.active && subscription.status.tier === "flame";

  const defaultPortrait = customPersona
    ? `data:image/png;base64,${customPersona.portraitBase64}`
    : (PORTRAITS[personaId] ?? "");

  const getFaceDescription = () => {
    if (customPersona?.faceDescription) return customPersona.faceDescription;
    if (personaId === "alex") return ALEX_FACE;
    return MIA_FACE;
  };

  const handleSelect = async (outfit: typeof OUTFITS[number]) => {
    if (outfit.id === "default") {
      onSelect("default", null);
      return;
    }

    if (!isFlame) {
      onUpgrade();
      return;
    }

    const cacheKey = `companion_outfit_${sessionId}_${outfit.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      onSelect(outfit.id, cached);
      return;
    }

    setGenerating(outfit.id);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/api/companion/outfit/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          personaId,
          outfitId: outfit.id,
          outfitDescription: outfit.desc,
          faceDescription: getFaceDescription(),
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const data = await res.json() as { portraitBase64: string };
      localStorage.setItem(cacheKey, data.portraitBase64);
      onSelect(outfit.id, data.portraitBase64);
    } catch {
      setError(`Couldn't generate ${outfit.name}. Try again.`);
    } finally {
      setGenerating(null);
    }
  };

  const displayName = customPersona?.name ?? (personaId === "alex" ? "Alex" : "Mia");

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-2xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-white/5">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-white flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Shirt className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-medium">{displayName}'s Wardrobe</h2>
        </div>
        {!isFlame && (
          <button
            onClick={onUpgrade}
            className="ml-auto flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 hover:bg-primary/20 transition-colors"
          >
            <Crown className="w-3 h-3" />
            Flame required
          </button>
        )}
      </div>

      {/* Subtitle */}
      <p className="text-sm text-muted-foreground mt-4 mb-6">
        Choose an outfit for {displayName}. Each look is generated with AI — takes ~20 seconds the first time, instant after that.
      </p>

      {error && (
        <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3 pb-6">
          {OUTFITS.map((outfit) => {
            const isDefault = outfit.id === "default";
            const isActive = activeOutfitId === outfit.id;
            const isGenerating = generating === outfit.id;
            const locked = !isFlame && !isDefault;

            return (
              <button
                key={outfit.id}
                onClick={() => !isGenerating && handleSelect(outfit)}
                disabled={isGenerating || (generating !== null && !isGenerating)}
                className={`relative rounded-2xl border p-4 text-center transition-all flex flex-col items-center gap-2 ${
                  isActive
                    ? "border-primary bg-primary/10"
                    : locked
                    ? "border-white/5 bg-secondary/20 opacity-60"
                    : "border-white/8 bg-secondary/30 hover:border-white/20 hover:bg-secondary/50"
                } ${isGenerating ? "opacity-70" : ""}`}
              >
                {isDefault ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary/50 flex-shrink-0">
                    <img src={defaultPortrait} alt="Default" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="text-3xl leading-none">{outfit.emoji}</span>
                )}

                <span className="text-xs font-medium text-white/80 leading-tight">{outfit.name}</span>

                {isActive && !isGenerating && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                {isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-[10px] text-white/60">Generating…</span>
                  </div>
                )}
                {locked && !isGenerating && (
                  <div className="absolute top-2 right-2">
                    <Crown className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
