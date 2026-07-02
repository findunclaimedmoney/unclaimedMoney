import { useState } from "react";
import { PersonaSelect } from "@/components/PersonaSelect";
import { ChatScreen } from "@/components/ChatScreen";
import { Pricing } from "@/components/Pricing";
import { useSubscription } from "@/hooks/use-subscription";

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

type Screen = "select" | "chat" | "pricing";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("select");
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const sub = useSubscription();

  const handleSelect = (personaId: string) => {
    setSelectedPersona(personaId);
    setScreen("chat");
  };

  if (screen === "pricing") {
    return <Pricing onBack={() => setScreen("select")} />;
  }

  if (screen === "chat" && selectedPersona) {
    const customPersona = selectedPersona === "custom" ? loadCustomPersona() : null;
    return (
      <ChatScreen
        personaId={selectedPersona === "custom" ? "mia" : selectedPersona}
        customPersona={customPersona ?? undefined}
        subscription={sub}
        onEnd={() => { setSelectedPersona(null); setScreen("select"); }}
        onUpgrade={() => setScreen("pricing")}
      />
    );
  }

  return (
    <PersonaSelect
      onSelect={handleSelect}
      subscription={sub}
      onUpgrade={() => setScreen("pricing")}
    />
  );
}
