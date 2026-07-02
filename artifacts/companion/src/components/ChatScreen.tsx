import { useState, useEffect, useRef } from "react";
import { useCompanionChat, useGetCompanionMemory, useSaveCompanionMemory, useGetPersonas, CompanionMessage } from "@workspace/api-client-react";
import { useVoice } from "@/hooks/use-voice";
import { useAudio } from "@/hooks/use-audio";
import { Waveform } from "@/components/Waveform";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, X, Crown, Video, Loader2, Gamepad2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { useSubscription } from "@/hooks/use-subscription";

const base = import.meta.env.BASE_URL;
const apiBase = base.replace(/\/companion\/?$/, "");
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

interface Props {
  personaId: string;
  customPersona?: CustomPersona;
  subscription: ReturnType<typeof useSubscription>;
  initialMessage?: string;
  onEnd: () => void;
  onUpgrade: () => void;
  onActivities: () => void;
}

export function ChatScreen({ personaId, customPersona, subscription, initialMessage, onEnd, onUpgrade, onActivities }: Props) {
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
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
    return id;
  };

  const sessionId = getSessionId();
  const { data: memory } = useGetCompanionMemory(sessionId);
  const saveMemory = useSaveCompanionMemory();
  const chatMutation = useCompanionChat();

  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

  const { isPlaying, playBase64, initAudio } = useAudio();
  const handleVoiceResult = (text: string) => { if (text.trim()) handleSend(text); };
  const { isListening, startListening, stopListening, hasSupport } = useVoice(handleVoiceResult);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (initialMessage && !initialSent.current) {
      initialSent.current = true;
      handleSend(initialMessage);
    }
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    initAudio();
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText("");
    setVideoUrl(null);

    try {
      const reply = await chatMutation.mutateAsync({
        data: { sessionId, persona: personaId, messages: newMessages, voice: subscription.canUseVoice }
      });
      setMessages([...newMessages, { role: "assistant", content: reply.responseText }]);
      if (reply.audioBase64 && subscription.canUseVoice) playBase64(reply.audioBase64);
      if (newMessages.length >= 10 && newMessages.length % 5 === 0) triggerSaveMemory(newMessages);
    } catch {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    }
  };

  const triggerSaveMemory = (msgs: CompanionMessage[]) => {
    saveMemory.mutate({ data: { sessionId, persona: personaId, messages: msgs } });
  };

  const handleEndSession = () => {
    if (messages.length > 0) triggerSaveMemory(messages);
    onEnd();
  };

  const handleMicClick = () => {
    if (!subscription.canUseVoice) { setShowPaywall(true); return; }
    if (isListening) stopListening(); else startListening();
  };

  const handleVideoCall = async () => {
    if (!subscription.canUseVideoCall) { setShowPaywall(true); return; }
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    const text = lastAssistant?.content ?? `Hi, I'm ${displayName}. It's so good to see you.`;
    setVideoLoading(true); setVideoUrl(null);
    try {
      const res = await fetch(`${apiBase}/api/companion/video`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, personaId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { videoUrl: string };
      setVideoUrl(data.videoUrl);
    } catch {
      toast({ title: "Video unavailable", description: "Could not generate video. Try again.", variant: "destructive" });
    } finally { setVideoLoading(false); }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-2xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary flex-shrink-0">
            <img src={portraitSrc} alt={displayName} className="w-full h-full object-cover" />
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
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={onActivities} title="Activities">
            <Gamepad2 className="w-5 h-5" />
          </Button>
          {subscription.canUseVideoCall && (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={handleVideoCall} disabled={videoLoading} title="Video call">
              {videoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleEndSession} className="text-muted-foreground hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Video overlay */}
      {videoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
          <div className="relative max-w-sm w-full">
            <Button variant="ghost" size="icon" className="absolute -top-12 right-0 text-white" onClick={() => setVideoUrl(null)}>
              <X className="w-5 h-5" />
            </Button>
            <div className="rounded-2xl overflow-hidden border border-white/10 aspect-square">
              <video src={videoUrl} autoPlay controls className="w-full h-full object-cover" />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">{displayName} · Live</p>
          </div>
        </div>
      )}

      {/* Paywall modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-card border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Crown className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-medium">Upgrade to unlock</h3>
              <p className="text-muted-foreground text-sm mt-2">
                {!subscription.status.active
                  ? "Voice, custom companions, and video calls are part of the Spark and Flame plans."
                  : subscription.status.tier === "spark"
                  ? "Video calls are available on the Flame plan."
                  : "You've used your voice messages for this month."}
              </p>
            </div>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => { setShowPaywall(false); onUpgrade(); }}>View plans</Button>
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setShowPaywall(false)}>Continue with text only</Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 py-6 pr-4" ref={scrollRef}>
        <div className="space-y-6">
          {messages.length === 0 && !chatMutation.isPending && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground mt-20 space-y-4">
              <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center pulse-animation">
                <Mic className="w-8 h-8 text-primary/50" />
              </div>
              <p>Say hello to {displayName}...</p>
              {!subscription.canUseVoice && (
                <button className="text-xs text-primary hover:text-primary/80 underline underline-offset-4 transition-colors" onClick={() => setShowPaywall(true)}>
                  Upgrade for voice replies ↗
                </button>
              )}
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

      {/* Input */}
      <div className="pt-6">
        <div className="flex justify-center mb-6 h-20">
          {isPlaying ? (
            <Waveform active={isPlaying} />
          ) : (
            <div className="relative">
              <Button
                size="lg"
                className={`rounded-full w-20 h-20 flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-destructive hover:bg-destructive/90 scale-110 shadow-lg shadow-destructive/20 pulse-animation'
                    : subscription.canUseVoice
                    ? 'bg-primary hover:bg-primary/90 hover:scale-105'
                    : 'bg-secondary/50 hover:bg-secondary/70'
                }`}
                onClick={handleMicClick}
                disabled={(!hasSupport && subscription.canUseVoice) || chatMutation.isPending}
              >
                {isListening ? <MicOff className="w-8 h-8 text-white" /> :
                  subscription.canUseVoice ? <Mic className="w-8 h-8 text-primary-foreground" /> :
                  <Crown className="w-6 h-6 text-primary/50" />}
              </Button>
              {!subscription.canUseVoice && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[10px] text-muted-foreground/60">Voice · Spark+</span>
                </div>
              )}
            </div>
          )}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }} className="flex items-center space-x-2">
          <Input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-secondary/50 border-white/5 rounded-full px-6 py-6 h-14"
            disabled={isListening || chatMutation.isPending}
          />
          <Button type="submit" size="icon" disabled={!inputText.trim() || chatMutation.isPending} className="w-14 h-14 rounded-full">
            <Send className="w-5 h-5" />
          </Button>
        </form>
        {subscription.status.active && subscription.status.voiceRemaining !== null && (
          <p className="text-center text-[10px] text-muted-foreground/40 mt-3">
            {subscription.status.voiceRemaining} voice messages remaining this month
          </p>
        )}
      </div>
    </div>
  );
}
