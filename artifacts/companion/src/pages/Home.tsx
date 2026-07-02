import { useState } from "react";
import { PersonaSelect } from "@/components/PersonaSelect";
import { ChatScreen } from "@/components/ChatScreen";

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

export default function Home() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const handleSelect = (personaId: string) => {
    setSelectedPersona(personaId);
  };

  if (selectedPersona) {
    const customPersona = selectedPersona === "custom" ? loadCustomPersona() : null;
    return (
      <ChatScreen
        personaId={selectedPersona === "custom" ? "mia" : selectedPersona}
        customPersona={customPersona ?? undefined}
        onEnd={() => setSelectedPersona(null)}
      />
    );
  }

  return <PersonaSelect onSelect={handleSelect} />;
}
