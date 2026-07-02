import { Camera, Crown, GamepadIcon, HelpCircle, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";

const ACTIVITIES = [
  {
    id: "photobooth",
    icon: Camera,
    title: "Photo Booth",
    description: "Take photos together with your companion in the same frame",
    tier: null,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    id: "chess",
    icon: GamepadIcon,
    title: "Chess",
    description: "Play chess against your companion — they talk trash the whole time",
    tier: null,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    id: "tictactoe",
    icon: GamepadIcon,
    title: "Tic-Tac-Toe",
    description: "Quick rounds against your companion",
    tier: null,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    id: "20q",
    icon: HelpCircle,
    title: "20 Questions",
    description: "Your companion thinks of something — you have 20 questions to guess it",
    tier: null,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

interface Props {
  companionName: string;
  onSelect: (activityId: string) => void;
  onBack: () => void;
}

export function Activities({ companionName, onSelect, onBack }: Props) {
  return (
    <div className="flex flex-col min-h-[100dvh] p-4 md:p-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-medium">Activities</h2>
          <p className="text-sm text-muted-foreground">with {companionName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACTIVITIES.map((a) => {
          const Icon = a.icon;
          return (
            <Card
              key={a.id}
              className="p-5 cursor-pointer hover:border-white/20 border-white/8 transition-all hover-elevate bg-card flex flex-col gap-3"
              onClick={() => onSelect(a.id)}
            >
              <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${a.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{a.title}</h3>
                  {a.tier && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />{a.tier}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
