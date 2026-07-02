import { useState } from "react";
import { useGetPersonas } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Sparkles, Plus } from "lucide-react";
import { CreatePersona } from "@/components/CreatePersona";

const base = import.meta.env.BASE_URL;
const PORTRAITS: Record<string, string> = {
  mia: `${base}mia-portrait.png`,
  alex: `${base}alex-portrait.png`,
};

interface CustomPersona {
  id: "custom";
  name: string;
  portraitBase64: string;
  faceDescription: string;
}

function loadCustomPersona(): CustomPersona | null {
  try {
    const raw = localStorage.getItem("companion_custom_persona");
    return raw ? (JSON.parse(raw) as CustomPersona) : null;
  } catch {
    return null;
  }
}

export function PersonaSelect({ onSelect }: { onSelect: (personaId: string) => void }) {
  const { data: personas, isLoading } = useGetPersonas();
  const [showCreate, setShowCreate] = useState(false);
  const [customPersona, setCustomPersona] = useState<CustomPersona | null>(loadCustomPersona);

  if (showCreate) {
    return (
      <CreatePersona
        onComplete={(p) => {
          setCustomPersona(p);
          setShowCreate(false);
          onSelect("custom");
        }}
        onBack={() => setShowCreate(false)}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 space-y-12">
      <div className="text-center space-y-4 max-w-md mx-auto">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-light tracking-tight">Choose your companion</h1>
        <p className="text-muted-foreground text-lg">A deeply personal, voice-driven presence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {isLoading ? (
          <>
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </>
        ) : (
          <>
            {personas?.map((persona) => (
              <Card
                key={persona.id}
                className="p-6 cursor-pointer hover:border-primary/50 transition-all hover-elevate bg-card flex flex-col items-center text-center space-y-4 border-white/5"
                onClick={() => onSelect(persona.id)}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary">
                  <img
                    src={PORTRAITS[persona.id] ?? ""}
                    alt={persona.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-medium">{persona.name}</h3>
                  <p className="text-primary/80 font-medium text-sm mt-1">{persona.tagline}</p>
                  <p className="text-muted-foreground text-sm mt-3 line-clamp-3">{persona.description}</p>
                </div>
              </Card>
            ))}

            {customPersona ? (
              <Card
                className="p-6 cursor-pointer hover:border-primary/50 transition-all hover-elevate bg-card flex flex-col items-center text-center space-y-4 border-white/5 relative"
                onClick={() => onSelect("custom")}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary">
                  <img
                    src={`data:image/png;base64,${customPersona.portraitBase64}`}
                    alt={customPersona.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-medium">{customPersona.name}</h3>
                  <p className="text-primary/80 font-medium text-sm mt-1">Your companion</p>
                  <button
                    className="text-xs text-muted-foreground hover:text-white transition-colors mt-3 underline underline-offset-2"
                    onClick={(e) => { e.stopPropagation(); setShowCreate(true); }}
                  >
                    Recreate
                  </button>
                </div>
              </Card>
            ) : (
              <Card
                className="p-6 cursor-pointer hover:border-primary/50 transition-all hover-elevate bg-card/50 flex flex-col items-center text-center space-y-4 border-white/5 border-dashed"
                onClick={() => setShowCreate(true)}
              >
                <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Plus className="w-10 h-10 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-muted-foreground">Create yours</h3>
                  <p className="text-muted-foreground/60 font-medium text-sm mt-1">Upload a photo</p>
                  <p className="text-muted-foreground/40 text-sm mt-3">Bring someone to life as your AI companion</p>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
