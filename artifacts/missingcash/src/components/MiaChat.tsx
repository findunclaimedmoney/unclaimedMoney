import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Volume2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const AVATAR = `${import.meta.env.BASE_URL}mia-poster.jpg`;
const AVATAR_VIDEOS = [
  `${import.meta.env.BASE_URL}mia-talk.mp4`,
  `${import.meta.env.BASE_URL}mia.mp4`,
];

const WELCOME =
  "Hi, I'm Mia — your MissingCash assistant. I can help you search for unclaimed money, walk you through the claim process, or answer questions about finance with our partner Stratton Finance. What would you like to know?";

const SUGGESTIONS = [
  "How do I find unclaimed money?",
  "Is the search really free?",
  "Tell me about car loans",
  "How does claiming work?",
];

function renderMessage(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*|\[.*?\]\(.*?\)|https?:\/\/\S+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    const linkMatch = part.match(/^\[(.+?)\]\((https?:\/\/.+?)\)$/);
    if (linkMatch)
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          {linkMatch[1]}
        </a>
      );
    if (part.match(/^https?:\/\//))
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
          {part}
        </a>
      );
    return <span key={i}>{part}</span>;
  });
}

function MiaAvatar({
  size,
  active,
  showStatus = false,
}: {
  size: number;
  active: boolean;
  showStatus?: boolean;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <motion.span
        className="absolute inset-0 rounded-full bg-primary/40 blur-md"
        animate={
          active
            ? { scale: [1, 1.45, 1], opacity: [0.7, 0, 0.7] }
            : { scale: [1, 1.15, 1], opacity: [0.35, 0.1, 0.35] }
        }
        transition={{ duration: active ? 1.1 : 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute rounded-full"
        style={{
          inset: -2,
          background: "conic-gradient(from 0deg, hsl(var(--primary)), transparent 55%, hsl(var(--primary)))",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: active ? 2.5 : 9, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute rounded-full overflow-hidden bg-secondary ring-1 ring-white/10"
        style={{ inset: 2 }}
        animate={active ? { scale: [1, 1.04, 1] } : { y: [0, -2, 0] }}
        transition={{ duration: active ? 1.1 : 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/30 to-secondary font-bold text-primary"
          style={{ fontSize: size * 0.42, lineHeight: 1 }}
          aria-hidden
        >
          M
        </div>
        <img
          src={AVATAR}
          alt="Mia"
          className="relative w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </motion.div>
      {showStatus && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 ring-2 ring-card" />
      )}
    </div>
  );
}

function MiaWelcomeVideo({ onUnavailable }: { onUnavailable: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [srcIndex, setSrcIndex] = useState(0);

  const tryPlay = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      setMuted(true);
      v.play().catch(() => {});
    });
  }, []);

  useEffect(() => {
    tryPlay();
    const v = ref.current;
    return () => {
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
    };
  }, [tryPlay, srcIndex]);

  const handleError = () => {
    if (srcIndex < AVATAR_VIDEOS.length - 1) {
      setMuted(false);
      setSrcIndex((i) => i + 1);
    } else {
      onUnavailable();
    }
  };

  const enableSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    v.currentTime = 0;
    void v.play();
    setMuted(false);
  };

  return (
    <div className="relative" style={{ width: 168, height: 168 }}>
      <motion.span
        className="absolute inset-0 rounded-full bg-primary/35 blur-md"
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.2, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <video
        ref={ref}
        key={srcIndex}
        src={AVATAR_VIDEOS[srcIndex]}
        playsInline
        autoPlay
        aria-label="Mia greets you and explains how MissingCash helps find unclaimed money"
        onError={handleError}
        className="relative w-full h-full object-cover rounded-full ring-2 ring-primary/40"
      />
      {muted && (
        <button
          onClick={enableSound}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold px-2.5 py-1 shadow-lg shadow-primary/30"
        >
          <Volume2 size={12} /> Tap for sound
        </button>
      )}
    </div>
  );
}

export default function MiaChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [unread, setUnread] = useState(false);
  const [videoOk, setVideoOk] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleVideoUnavailable = useCallback(() => setVideoOk(false), []);

  const sendMessageRef = useRef<((text?: string) => void) | null>(null);

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || streaming) return;

      setInput("");
      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
      const history = [...messages, userMsg].filter((m) => m.id !== "welcome");
      setMessages((prev) => [...prev, userMsg]);

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${BASE}/api/mia/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) throw new Error("Stream failed");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const payload = JSON.parse(line.slice(6)) as { content?: string; done?: boolean; error?: string };
              if (payload.content) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + payload.content } : m)),
                );
              }
              if (payload.error) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: "Sorry, I'm having trouble right now. Please try again in a moment." } : m,
                  ),
                );
              }
              if (payload.done || payload.error) break;
            } catch {
              /* ignore partial JSON */
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: "Sorry, something went wrong. Please try again, or email admin@missingcash.com.au." }
                : m,
            ),
          );
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
        if (!open) setUnread(true);
      }
    },
    [input, streaming, messages, open],
  );

  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  useEffect(() => {
    const handler = (e: Event) => {
      setOpen(true);
      setUnread(false);
      const detail = (e as CustomEvent<{ message?: string; autoSend?: boolean }>).detail;
      const msg = detail?.message;
      if (msg && detail?.autoSend) {
        setTimeout(() => sendMessageRef.current?.(msg), 700);
      } else if (msg) {
        setTimeout(() => inputRef.current && (inputRef.current.value = msg), 150);
      }
    };
    window.addEventListener("mia:open", handler);
    return () => window.removeEventListener("mia:open", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const showSuggestions = messages.filter((m) => m.id !== "welcome").length === 0;

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onClick={() => { setOpen(true); setUnread(false); }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-card/90 backdrop-blur text-white rounded-full shadow-2xl shadow-primary/30 border border-primary/30 hover:border-primary/60 transition-colors pl-2 pr-5 py-2"
            aria-label="Chat with Mia"
          >
            <MiaAvatar size={40} active={false} />
            <span className="text-sm font-bold whitespace-nowrap">Ask Mia</span>
            {unread && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse ring-2 ring-card" />}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            style={{ height: "560px", transformOrigin: "bottom right" }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-border bg-card"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-secondary border-b border-border shrink-0">
              <MiaAvatar size={40} active={streaming} showStatus />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">Mia</p>
                <p className="text-[11px] text-primary flex items-center gap-1">
                  {streaming ? "typing…" : "MissingCash assistant"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {showSuggestions && (
                <div className="flex flex-col items-center text-center pt-2 pb-1">
                  {videoOk ? (
                    <MiaWelcomeVideo onUnavailable={handleVideoUnavailable} />
                  ) : (
                    <MiaAvatar size={84} active={streaming} />
                  )}
                  <p className="mt-3 text-base font-bold text-white">Hi, I'm Mia</p>
                  <p className="text-xs text-muted-foreground">Your personal MissingCash guide</p>
                </div>
              )}

              {messages.map((m) =>
                showSuggestions && m.id === "welcome" ? (
                  <div key={m.id} className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-secondary text-foreground border border-border">
                      {renderMessage(m.content)}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-secondary text-foreground rounded-bl-sm border border-border"
                      }`}
                    >
                      {m.content === "" && streaming ? (
                        <span className="inline-flex gap-1 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                        </span>
                      ) : (
                        renderMessage(m.content)
                      )}
                    </div>
                  </div>
                ),
              )}

              {showSuggestions && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => void sendMessage(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-white transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 shrink-0 bg-card">
              <div className="flex items-end gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Mia anything..."
                  className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
                <button
                  onClick={() => void sendMessage()}
                  disabled={!input.trim() || streaming}
                  className="shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Mia is an AI assistant and may occasionally be inaccurate.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
