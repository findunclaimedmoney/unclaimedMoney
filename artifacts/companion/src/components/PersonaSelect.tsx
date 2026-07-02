import { useGetPersonas } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Sparkles } from "lucide-react";

export function PersonaSelect({ onSelect }: { onSelect: (personaId: string) => void }) {
  const { data: personas, isLoading } = useGetPersonas();

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 space-y-12">
      <div className="text-center space-y-4 max-w-md mx-auto">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-light tracking-tight">Choose your companion</h1>
        <p className="text-muted-foreground text-lg">A deeply personal, voice-driven presence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {isLoading ? (
          <>
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </>
        ) : (
          personas?.map((persona) => (
            <Card 
              key={persona.id} 
              className="p-6 cursor-pointer hover:border-primary/50 transition-all hover-elevate bg-card flex flex-col items-center text-center space-y-4 border-white/5"
              onClick={() => onSelect(persona.id)}
            >
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-medium">{persona.name}</h3>
                <p className="text-primary/80 font-medium text-sm mt-1">{persona.tagline}</p>
                <p className="text-muted-foreground text-sm mt-3 line-clamp-3">{persona.description}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
