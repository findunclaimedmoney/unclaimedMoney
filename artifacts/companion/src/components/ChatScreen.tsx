import { useState, useEffect, useRef } from "react";
import { useCompanionChat, useGetCompanionMemory, useSaveCompanionMemory, useGetPersonas, CompanionMessage } from "@workspace/api-client-react";
import { useVoice } from "@/hooks/use-voice";
import { useAudio } from "@/hooks/use-audio";
import { Waveform } from "@/components/Waveform";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

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

export function ChatScreen({
  personaId,
  customPersona,
  onEnd,
}: {
  personaId: string;
  customPersona?: CustomPersona;
  onEnd: () => void;
}) {
  const { data: personas } = useGetPersonas();
  const persona = personas?.find(p => p.id === personaId);

  const displayName = customPersona?.name ?? persona?.name ?? "";
  const portraitSrc = customPersona
    ? `data:image/png;base64,${customPersona.portraitBase64}`
    : (PORTRAITS[personaId] ?? "");

  const { toast } = useToast();

  const getSessionId = () => {
    const key = `companion_session_${customPersona ? "custom" : personaId}`;
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  };
  
  const sessionId = getSessionId();
  const { data: memory } = useGetCompanionMemory(sessionId);
  const saveMemory = useSaveCompanionMemory();
  const chatMutation = useCompanionChat();
  
  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { isPlaying, playBase64, initAudio } = useAudio();
  
  const handleVoiceResult = (text: string) => {
    if (text.trim()) {
      handleSend(text);
    }
  };
  
  const { isListening, startListening, stopListening, hasSupport } = useVoice(handleVoiceResult);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    initAudio(); // Need user interaction to initialize audio context
    
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText("");

    try {
      const reply = await chatMutation.mutateAsync({
        data: {
          sessionId,
          persona: personaId,
          messages: newMessages,
          voice: true
        }
      });

      setMessages([...newMessages, { role: "assistant", content: reply.responseText }]);
      
      if (reply.audioBase64) {
        playBase64(reply.audioBase64);
      }

      if (newMessages.length >= 10 && newMessages.length % 5 === 0) {
        triggerSaveMemory(newMessages);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
    }
  };

  const triggerSaveMemory = (msgs: CompanionMessage[]) => {
    saveMemory.mutate({
      data: {
        sessionId,
        persona: personaId,
        messages: msgs
      }
    });
  };

  const handleEndSession = () => {
    if (messages.length > 0) {
      triggerSaveMemory(messages);
    }
    onEnd();
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-2xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary flex-shrink-0">
            <img
              src={portraitSrc}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-medium">{displayName}</h2>
            {memory?.summary && (
              <p className="text-xs text-muted-foreground truncate max-w-xs" title={memory.summary}>
                Remembers: {memory.summary}
              </p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleEndSession} className="text-muted-foreground hover:text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 py-6 pr-4" ref={scrollRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground mt-20 space-y-4">
              <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center pulse-animation">
                <Mic className="w-8 h-8 text-primary/50" />
              </div>
              <p>Say hello to {displayName}...</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-br-sm' 
                  : 'bg-secondary text-secondary-foreground rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex items-start">
              <div className="px-4 py-3 rounded-2xl max-w-[85%] bg-secondary text-secondary-foreground rounded-bl-sm flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="pt-6">
        <div className="flex justify-center mb-6 h-12">
          {isPlaying ? (
            <Waveform active={isPlaying} />
          ) : (
            <Button
              size="lg"
              className={`rounded-full w-20 h-20 flex items-center justify-center transition-all ${
                isListening ? 'bg-destructive hover:bg-destructive/90 scale-110 shadow-lg shadow-destructive/20 pulse-animation' : 'bg-primary hover:bg-primary/90 hover:scale-105'
              }`}
              onClick={isListening ? stopListening : startListening}
              disabled={!hasSupport || chatMutation.isPending}
            >
              {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-primary-foreground" />}
            </Button>
          )}
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
          className="flex items-center space-x-2"
        >
          <Input 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Or type a message..."
            className="flex-1 bg-secondary/50 border-white/5 rounded-full px-6 py-6 h-14"
            disabled={isListening || chatMutation.isPending}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputText.trim() || chatMutation.isPending}
            className="w-14 h-14 rounded-full"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
