import { useState } from "react";
import { PersonaSelect } from "@/components/PersonaSelect";
import { ChatScreen } from "@/components/ChatScreen";

export default function Home() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  if (selectedPersona) {
    return <ChatScreen personaId={selectedPersona} onEnd={() => setSelectedPersona(null)} />;
  }

  return <PersonaSelect onSelect={setSelectedPersona} />;
}
