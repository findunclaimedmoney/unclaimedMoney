import { useState } from "react";
import { PersonaSelect } from "@/components/PersonaSelect";
import { ChatScreen } from "@/components/ChatScreen";
import { Pricing } from "@/components/Pricing";
import { Activities } from "@/components/Activities";
import { PhotoBooth } from "@/components/activities/PhotoBooth";
import { ChessGame } from "@/components/activities/ChessGame";
import { TicTacToe } from "@/components/activities/TicTacToe";
import { useSubscription } from "@/hooks/use-subscription";

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

function getSessionId(personaId: string) {
  const key = `companion_session_${personaId}`;
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}

type Screen =
  | "select"
  | "chat"
  | "pricing"
  | "activities"
  | "photobooth"
  | "chess"
  | "tictactoe"
  | "20q";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("select");
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [gameStartMessage, setGameStartMessage] = useState<string | undefined>(undefined);
  const sub = useSubscription();

  const customPersona = selectedPersonaId === "custom" ? loadCustomPersona() : null;
  const effectivePersonaId = selectedPersonaId === "custom" ? "mia" : (selectedPersonaId ?? "mia");
  const displayName = customPersona?.name ?? (selectedPersonaId === "mia" ? "Mia" : selectedPersonaId === "alex" ? "Alex" : "Mia");
  const portraitSrc = customPersona
    ? `data:image/png;base64,${customPersona.portraitBase64}`
    : (PORTRAITS[effectivePersonaId] ?? PORTRAITS.mia!);

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersonaId(personaId);
    setGameStartMessage(undefined);
    setScreen("chat");
  };

  const handleActivity = (activityId: string) => {
    if (activityId === "20q") {
      setGameStartMessage(
        `Let's play 20 Questions! You secretly think of a famous person, place, or thing — don't tell me what it is. I'll ask yes/no questions to try to guess it. Ready? Go ahead and think of something!`
      );
      setScreen("chat");
    } else {
      setScreen(activityId as Screen);
    }
  };

  const sessionId = getSessionId(effectivePersonaId);

  if (screen === "pricing") {
    return <Pricing onBack={() => setScreen(selectedPersonaId ? "chat" : "select")} />;
  }

  if (screen === "activities") {
    return (
      <Activities
        companionName={displayName}
        onSelect={handleActivity}
        onBack={() => setScreen("chat")}
      />
    );
  }

  if (screen === "photobooth") {
    return (
      <PhotoBooth
        companionPortrait={portraitSrc}
        companionName={displayName}
        onBack={() => setScreen("activities")}
      />
    );
  }

  if (screen === "chess") {
    return (
      <ChessGame
        personaId={effectivePersonaId}
        companionName={displayName}
        sessionId={sessionId}
        onBack={() => setScreen("activities")}
      />
    );
  }

  if (screen === "tictactoe") {
    return (
      <TicTacToe
        companionName={displayName}
        onBack={() => setScreen("activities")}
      />
    );
  }

  if (screen === "chat" && selectedPersonaId) {
    return (
      <ChatScreen
        personaId={effectivePersonaId}
        customPersona={customPersona ?? undefined}
        subscription={sub}
        initialMessage={gameStartMessage}
        onEnd={() => { setSelectedPersonaId(null); setGameStartMessage(undefined); setScreen("select"); }}
        onUpgrade={() => setScreen("pricing")}
        onActivities={() => setScreen("activities")}
      />
    );
  }

  return (
    <PersonaSelect
      onSelect={handlePersonaSelect}
      subscription={sub}
      onUpgrade={() => setScreen("pricing")}
    />
  );
}
