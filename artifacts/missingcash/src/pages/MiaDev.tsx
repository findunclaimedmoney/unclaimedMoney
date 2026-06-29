import { useState, useEffect, useRef, useCallback } from "react";

const BASE = import.meta.env.BASE_URL;
const PASS = "missingcash2024";

function authHeaders() {
  return { "Content-Type": "application/json", "x-admin-password": PASS };
}

type Tab = "live" | "knowledge" | "script" | "voice" | "tasks";
type Msg = { role: "user" | "assistant"; content: string };
type Task = { id: number; title: string; description: string | null; status: string; priority: string; created_at: string };

export default function MiaDev() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<Tab>("live");

  function login() {
    if (pw === PASS) setAuthed(true);
    else alert("Wrong password");
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#061826" }}>
        <div className="rounded-2xl border border-white/10 p-10 w-full max-w-sm" style={{ background: "#0a2236" }}>
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🤖</div>
            <h1 className="text-2xl font-bold text-white">MIA-Development</h1>
            <p className="text-white/50 text-sm mt-1">Restricted access</p>
          </div>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            placeholder="Enter admin password"
            className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 text-sm mb-4 outline-none focus:border-yellow-400"
          />
          <button
            onClick={login}
            className="w-full rounded-xl py-3 font-semibold text-sm text-black"
            style={{ background: "#f5b942" }}
          >
            Enter Lab
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "live", label: "Live Session", icon: "🎥" },
    { id: "knowledge", label: "Knowledge", icon: "🧠" },
    { id: "script", label: "Script", icon: "📝" },
    { id: "voice", label: "Voice & Avatar", icon: "🎤" },
    { id: "tasks", label: "Tasks", icon: "✅" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#061826", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4" style={{ background: "#0a2236" }}>
        <span className="text-2xl">🤖</span>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">MIA-Development Lab</h1>
          <p className="text-white/40 text-xs mt-0.5">missingcash.com.au — internal</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-medium">Mia Online</span>
        </div>
      </div>

      {/* Tab nav */}
      <div className="border-b border-white/10 px-6 flex gap-1 overflow-x-auto" style={{ background: "#0a2236" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors"
            style={{
              color: tab === t.id ? "#f5b942" : "rgba(255,255,255,0.5)",
              borderBottom: tab === t.id ? "2px solid #f5b942" : "2px solid transparent",
              background: "none",
              borderLeft: "none",
              borderRight: "none",
              borderTop: "none",
              cursor: "pointer",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {tab === "live" && <LiveSession />}
        {tab === "knowledge" && <KnowledgeTab />}
        {tab === "script" && <ScriptTab />}
        {tab === "voice" && <VoiceAvatarTab />}
        {tab === "tasks" && <TasksTab />}
      </div>
    </div>
  );
}

// ─── LIVE SESSION ─────────────────────────────────────────────────────────────

function LiveSession() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [miaStatus, setMiaStatus] = useState<string>("Loading...");
  const [camOn, setCamOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [heygenSessionId, setHeygenSessionId] = useState<string | null>(null);
  const [heygenReady, setHeygenReady] = useState(false);
  const [heygenError, setHeygenError] = useState<string | null>(null);
  const [heygenConnecting, setHeygenConnecting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heygenVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetch(`${BASE}api/admin/mia/status`, { headers: authHeaders() })
      .then(r => r.json())
      .then((d: { lifecycle?: { phase?: string }; emotional?: { label?: string; score?: number } }) => {
        setMiaStatus(`${d.lifecycle?.phase ?? "active"} · ${d.emotional?.label ?? "focused"} (${d.emotional?.score ?? 0}/100)`);
      })
      .catch(() => setMiaStatus("Status unavailable"));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function toggleCam() {
    if (camOn) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCamOn(false);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }).catch(() => null);
      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCamOn(true);
      }
    }
  }

  async function startHeyGen() {
    setHeygenConnecting(true);
    setHeygenError(null);
    try {
      const r = await fetch(`${BASE}api/admin/mia/heygen/session`, { method: "POST", headers: authHeaders() });
      const d = await r.json() as { data?: { session_id?: string; sdp?: { sdp: string; type: string }; ice_servers2?: RTCIceServer[] } };
      const sessionData = d.data;
      if (!sessionData?.session_id || !sessionData?.sdp) {
        setHeygenError("HeyGen session failed — check HEYGEN_API_KEY");
        setHeygenConnecting(false);
        return;
      }
      const pc = new RTCPeerConnection({ iceServers: sessionData.ice_servers2 ?? [] });
      peerRef.current = pc;

      pc.ontrack = (e) => {
        if (heygenVideoRef.current && e.streams[0]) {
          heygenVideoRef.current.srcObject = e.streams[0];
        }
      };

      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          await fetch(`${BASE}api/admin/mia/heygen/ice`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ session_id: sessionData.session_id, candidate: e.candidate }),
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(sessionData.sdp as RTCSessionDescriptionInit));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await fetch(`${BASE}api/admin/mia/heygen/start`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ session_id: sessionData.session_id, sdp: { sdp: answer.sdp, type: "answer" } }),
      });

      setHeygenSessionId(sessionData.session_id ?? null);
      setHeygenReady(true);
      setHeygenConnecting(false);
    } catch (e) {
      setHeygenError(String(e));
      setHeygenConnecting(false);
    }
  }

  async function stopHeyGen() {
    if (heygenSessionId) {
      await fetch(`${BASE}api/admin/mia/heygen/stop`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ session_id: heygenSessionId }),
      }).catch(() => {});
    }
    peerRef.current?.close();
    peerRef.current = null;
    if (heygenVideoRef.current) heygenVideoRef.current.srcObject = null;
    setHeygenSessionId(null);
    setHeygenReady(false);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    let reply = "";
    const aIdx = newMessages.length;

    try {
      const resp = await fetch(`${BASE}api/admin/mia/chat`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ messages: newMessages }),
      });

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const d = JSON.parse(line.slice(6)) as { content?: string; done?: boolean };
              if (d.content) {
                reply += d.content;
                setMessages(prev => {
                  const arr = [...prev];
                  if (arr[aIdx]) arr[aIdx] = { role: "assistant", content: reply };
                  return arr;
                });
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }

      if (reply && heygenSessionId) {
        const clean = reply.replace(/\*\*/g, "").replace(/\*/g, "").replace(/#{1,6}\s/g, "").slice(0, 500);
        await fetch(`${BASE}api/admin/mia/heygen/speak`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ session_id: heygenSessionId, text: clean }),
        }).catch(() => {});
      }

      if (reply && !heygenSessionId) {
        const clean = reply.replace(/\*\*/g, "").replace(/\*/g, "").replace(/#{1,6}\s/g, "").slice(0, 300);
        const ttsResp = await fetch(`${BASE}api/mia/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: clean }),
        });
        if (ttsResp.ok) {
          const audio = new Audio(URL.createObjectURL(await ttsResp.blob()));
          audio.play().catch(() => {});
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${String(e)}` }]);
    } finally {
      setStreaming(false);
    }
  }

  function toggleListen() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser. Use Chrome."); return; }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rec = new SR() as any;
      rec.lang = "en-AU";
      rec.continuous = false;
      rec.interimResults = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (e: any) => {
        const t = (e.results[0]?.[0]?.transcript as string) ?? "";
        if (t) void sendMessage(t);
      };
      rec.onend = () => setListening(false);
      rec.start();
      recognitionRef.current = rec;
      setListening(true);
    }
  }

  return (
    <div className="flex h-full" style={{ minHeight: "calc(100vh - 110px)" }}>
      {/* Mia's status sidebar */}
      <div className="w-48 border-r border-white/10 p-4 flex flex-col gap-3" style={{ background: "#071d2d" }}>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Mia State</p>
        <div className="rounded-xl border border-white/10 p-3 bg-white/5">
          <p className="text-white/60 text-xs">Lifecycle</p>
          <p className="text-yellow-400 text-xs font-medium mt-1 break-all">{miaStatus}</p>
        </div>
        <div className="mt-auto space-y-2">
          <button
            onClick={toggleCam}
            className="w-full rounded-lg py-2 text-xs font-semibold transition-all"
            style={{ background: camOn ? "#ef4444" : "#1a3a52", color: "white" }}
          >
            {camOn ? "📷 Cam Off" : "📷 Cam On"}
          </button>
          {!heygenReady ? (
            <button
              onClick={startHeyGen}
              disabled={heygenConnecting}
              className="w-full rounded-lg py-2 text-xs font-semibold"
              style={{ background: heygenConnecting ? "#555" : "#f5b942", color: "black" }}
            >
              {heygenConnecting ? "Connecting…" : "🎭 Start Avatar"}
            </button>
          ) : (
            <button
              onClick={stopHeyGen}
              className="w-full rounded-lg py-2 text-xs font-semibold"
              style={{ background: "#ef4444", color: "white" }}
            >
              🛑 Stop Avatar
            </button>
          )}
          {heygenError && <p className="text-red-400 text-xs break-all">{heygenError}</p>}
        </div>
      </div>

      {/* Video panels */}
      <div className="flex flex-col flex-1" style={{ maxWidth: "380px", background: "#071d2d", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        {/* HeyGen avatar */}
        <div className="flex-1 flex items-center justify-center relative" style={{ minHeight: "260px", background: "#05161f" }}>
          <video
            ref={heygenVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ display: heygenReady ? "block" : "none" }}
          />
          {!heygenReady && (
            <div className="text-center">
              <div className="text-5xl mb-3">🤖</div>
              <p className="text-white/30 text-sm">Mia's avatar will appear here</p>
              <p className="text-white/20 text-xs mt-1">Click "Start Avatar" to begin</p>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/60 rounded px-2 py-1 text-xs text-white/60">Mia</div>
        </div>

        {/* Your webcam */}
        <div className="flex items-center justify-center relative" style={{ height: "180px", background: "#061826", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ display: camOn ? "block" : "none", transform: "scaleX(-1)" }}
          />
          {!camOn && (
            <div className="text-center">
              <div className="text-3xl mb-1">👤</div>
              <p className="text-white/30 text-xs">Your camera is off</p>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/60 rounded px-2 py-1 text-xs text-white/60">You</div>
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-white/30 text-sm">Start talking with Mia</p>
              <p className="text-white/20 text-xs mt-1">She has full agent capabilities — pipeline stats, goals, leads, reflections</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className="text-xl flex-shrink-0">{m.role === "user" ? "👤" : "🤖"}</div>
              <div
                className="rounded-2xl px-4 py-3 text-sm max-w-xs whitespace-pre-wrap"
                style={{
                  background: m.role === "user" ? "#f5b942" : "#1a3a52",
                  color: m.role === "user" ? "#061826" : "white",
                  maxWidth: "75%",
                }}
              >
                {m.content || <span className="opacity-50 animate-pulse">●●●</span>}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-4 flex gap-2">
          <button
            onClick={toggleListen}
            className="rounded-xl px-3 py-2 text-lg transition-all flex-shrink-0"
            style={{ background: listening ? "#ef4444" : "#1a3a52" }}
            title={listening ? "Stop listening" : "Voice input"}
          >
            {listening ? "🔴" : "🎙️"}
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
            placeholder="Talk to Mia… (boss mode, full agent)"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 text-white px-4 py-2 text-sm outline-none focus:border-yellow-400"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            className="rounded-xl px-4 py-2 text-sm font-semibold flex-shrink-0"
            style={{ background: streaming ? "#555" : "#f5b942", color: streaming ? "white" : "black" }}
          >
            {streaming ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── KNOWLEDGE TAB ────────────────────────────────────────────────────────────

function KnowledgeTab() {
  const [addendum, setAddendum] = useState("");
  const [newText, setNewText] = useState("");
  const [mode, setMode] = useState<"append" | "replace">("append");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${BASE}api/admin/mia/knowledge`, { headers: authHeaders() })
      .then(r => r.json())
      .then((d: { addendum?: string }) => setAddendum(d.addendum ?? ""))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!newText.trim()) return;
    setSaving(true);
    await fetch(`${BASE}api/admin/mia/knowledge`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ text: newText, replace: mode === "replace" }),
    });
    const r = await fetch(`${BASE}api/admin/mia/knowledge`, { headers: authHeaders() });
    const d = await r.json() as { addendum?: string };
    setAddendum(d.addendum ?? "");
    setNewText("");
    setSaving(false);
  }

  async function clear() {
    if (!confirm("Clear all knowledge addendums?")) return;
    await fetch(`${BASE}api/admin/mia/knowledge`, { method: "DELETE", headers: authHeaders() });
    setAddendum("");
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setNewText(ev.target?.result as string);
    reader.readAsText(file);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-white font-bold text-xl mb-1">Knowledge Upload</h2>
        <p className="text-white/40 text-sm">Upload files or type text to expand Mia's knowledge. Added content is injected into her system prompt at runtime — no rebuild needed.</p>
      </div>

      <div className="rounded-2xl border border-white/10 p-5" style={{ background: "#0a2236" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Add Knowledge</h3>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {(["append", "replace"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-3 py-1.5 text-xs font-medium"
                style={{ background: mode === m ? "#f5b942" : "transparent", color: mode === m ? "black" : "rgba(255,255,255,0.5)" }}
              >
                {m === "append" ? "Append" : "Replace All"}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder="Paste knowledge text here, or upload a file below…"
          rows={8}
          className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 text-sm outline-none focus:border-yellow-400 font-mono resize-none"
        />

        <div className="flex gap-3 mt-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-xl px-4 py-2 text-sm font-semibold border border-white/20 text-white/70 hover:text-white"
            style={{ background: "#1a3a52" }}
          >
            📁 Upload File
          </button>
          <input ref={fileRef} type="file" accept=".txt,.md,.pdf,.csv,.json" className="hidden" onChange={handleFile} />
          <button
            onClick={save}
            disabled={saving || !newText.trim()}
            className="rounded-xl px-6 py-2 text-sm font-semibold"
            style={{ background: saving ? "#555" : "#f5b942", color: saving ? "white" : "black" }}
          >
            {saving ? "Saving…" : `${mode === "append" ? "Append" : "Replace"} Knowledge`}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-5" style={{ background: "#0a2236" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Current Addendum</h3>
          <div className="flex gap-2">
            <span className="text-white/40 text-xs">{addendum.length} chars</span>
            {addendum && (
              <button onClick={clear} className="text-red-400 text-xs hover:text-red-300">Clear All</button>
            )}
          </div>
        </div>
        {loading ? (
          <p className="text-white/30 text-sm">Loading…</p>
        ) : addendum ? (
          <pre className="text-white/70 text-xs font-mono whitespace-pre-wrap bg-white/5 rounded-xl p-4 max-h-64 overflow-y-auto">{addendum}</pre>
        ) : (
          <p className="text-white/30 text-sm italic">No addendum set — using base system prompt only.</p>
        )}
      </div>
    </div>
  );
}

// ─── SCRIPT TAB ───────────────────────────────────────────────────────────────

function ScriptTab() {
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState("");
  const [testResult, setTestResult] = useState("");

  useEffect(() => {
    fetch(`${BASE}api/admin/mia/prompts`, { headers: authHeaders() })
      .then(r => r.json())
      .then((d: { boss?: string; customer?: string }) => setScript(d.customer ?? ""))
      .finally(() => setLoading(false));
  }, []);

  function download() {
    const a = document.createElement("a");
    a.href = `${BASE}api/admin/mia/script`;
    a.click();
  }

  async function testPrompt() {
    if (!testMsg.trim()) return;
    setTesting(true);
    setTestResult("");
    const resp = await fetch(`${BASE}api/admin/mia/test`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ systemPrompt: script, message: testMsg }),
    });
    const reader = resp.body?.getReader();
    const decoder = new TextDecoder();
    let out = "";
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const d = JSON.parse(line.slice(6)) as { content?: string; done?: boolean };
            if (d.content) { out += d.content; setTestResult(out); }
          } catch { /* ignore */ }
        }
      }
    }
    setTesting(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-white font-bold text-xl mb-1">System Prompt / Script</h2>
          <p className="text-white/40 text-sm">View and test Mia's current customer-facing system prompt. Upload a new version via the Knowledge tab to override it.</p>
        </div>
        <button
          onClick={download}
          className="rounded-xl px-5 py-2 text-sm font-semibold flex-shrink-0"
          style={{ background: "#f5b942", color: "black" }}
        >
          ⬇️ Download .txt
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 p-5" style={{ background: "#0a2236" }}>
        <h3 className="text-white font-semibold mb-3">Current Script ({script.length} chars)</h3>
        {loading ? (
          <p className="text-white/30 text-sm">Loading…</p>
        ) : (
          <pre className="text-white/70 text-xs font-mono whitespace-pre-wrap bg-white/5 rounded-xl p-4 max-h-96 overflow-y-auto">{script}</pre>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 p-5" style={{ background: "#0a2236" }}>
        <h3 className="text-white font-semibold mb-3">🧪 Test Script</h3>
        <p className="text-white/40 text-sm mb-3">Send a test message using the current script to preview how Mia responds.</p>
        <input
          value={testMsg}
          onChange={e => setTestMsg(e.target.value)}
          onKeyDown={e => e.key === "Enter" && testPrompt()}
          placeholder="Type a test message…"
          className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-3 text-sm outline-none focus:border-yellow-400 mb-3"
        />
        <button
          onClick={testPrompt}
          disabled={testing || !testMsg.trim()}
          className="rounded-xl px-6 py-2 text-sm font-semibold"
          style={{ background: testing ? "#555" : "#f5b942", color: testing ? "white" : "black" }}
        >
          {testing ? "Testing…" : "Run Test"}
        </button>
        {testResult && (
          <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-white/40 text-xs mb-2">Mia's response:</p>
            <p className="text-white text-sm whitespace-pre-wrap">{testResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VOICE & AVATAR TAB ───────────────────────────────────────────────────────

function VoiceAvatarTab() {
  const [voiceId, setVoiceId] = useState("");
  const [model, setModel] = useState("eleven_turbo_v2_5");
  const [avatarId, setAvatarId] = useState("");
  const [testText, setTestText] = useState("Hi Zac, I'm Mia. Voice check complete.");
  const [playing, setPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${BASE}api/admin/mia/voice`, { headers: authHeaders() })
      .then(r => r.json())
      .then((d: { voiceId?: string; model?: string; avatarId?: string }) => {
        setVoiceId(d.voiceId ?? "");
        setModel(d.model ?? "eleven_turbo_v2_5");
        setAvatarId(d.avatarId ?? "");
      });
  }, []);

  async function playVoice() {
    if (!testText.trim()) return;
    setPlaying(true);
    const r = await fetch(`${BASE}api/mia/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: testText }),
    });
    if (r.ok) {
      const audio = new Audio(URL.createObjectURL(await r.blob()));
      audio.onended = () => setPlaying(false);
      audio.play().catch(() => setPlaying(false));
    } else {
      setPlaying(false);
    }
  }

  async function saveConfig() {
    setSaving(true);
    await fetch(`${BASE}api/admin/mia/voice`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ voiceId, model, avatarId }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const models = ["eleven_turbo_v2_5", "eleven_turbo_v2", "eleven_multilingual_v2", "eleven_monolingual_v1"];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-white font-bold text-xl mb-1">Voice & Avatar</h2>
        <p className="text-white/40 text-sm">Configure Mia's ElevenLabs voice and HeyGen avatar settings.</p>
      </div>

      <div className="rounded-2xl border border-white/10 p-5 space-y-4" style={{ background: "#0a2236" }}>
        <h3 className="text-white font-semibold">🎤 ElevenLabs Voice</h3>

        <div>
          <label className="text-white/50 text-xs mb-1.5 block">Voice ID</label>
          <input
            value={voiceId}
            onChange={e => setVoiceId(e.target.value)}
            placeholder="ElevenLabs voice ID"
            className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-2.5 text-sm outline-none focus:border-yellow-400 font-mono"
          />
          <p className="text-white/30 text-xs mt-1">Current Mia voice: x3PfG9wL6FOEApZ1VJ9H (category: generated)</p>
        </div>

        <div>
          <label className="text-white/50 text-xs mb-1.5 block">Model</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-2.5 text-sm outline-none focus:border-yellow-400"
            style={{ background: "#1a3a52" }}
          >
            {models.map(m => (
              <option key={m} value={m} style={{ background: "#061826" }}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-white/50 text-xs mb-1.5 block">Test Voice</label>
          <div className="flex gap-2">
            <input
              value={testText}
              onChange={e => setTestText(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 text-white px-4 py-2.5 text-sm outline-none focus:border-yellow-400"
            />
            <button
              onClick={playVoice}
              disabled={playing}
              className="rounded-xl px-4 py-2 text-sm font-semibold flex-shrink-0"
              style={{ background: playing ? "#555" : "#f5b942", color: "black" }}
            >
              {playing ? "▶ Playing…" : "▶ Play"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-5 space-y-4" style={{ background: "#0a2236" }}>
        <h3 className="text-white font-semibold">🎭 HeyGen Avatar</h3>

        <div>
          <label className="text-white/50 text-xs mb-1.5 block">Avatar ID</label>
          <input
            value={avatarId}
            onChange={e => setAvatarId(e.target.value)}
            placeholder="HeyGen avatar ID"
            className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-2.5 text-sm outline-none focus:border-yellow-400 font-mono"
          />
          <p className="text-white/30 text-xs mt-1">Current: 05f1da4dc12744c087dace9e0651a6e0</p>
        </div>

        <div className="rounded-xl bg-white/5 p-4 border border-white/10">
          <p className="text-white/50 text-xs">To find avatar IDs, use the HeyGen dashboard → Avatars. Paste the avatar ID above and save. The Live Session tab will use this when you click "Start Avatar".</p>
        </div>
      </div>

      <button
        onClick={saveConfig}
        disabled={saving}
        className="rounded-xl px-8 py-3 text-sm font-semibold w-full"
        style={{ background: saved ? "#22c55e" : saving ? "#555" : "#f5b942", color: saved || saving ? "white" : "black" }}
      >
        {saved ? "✓ Saved!" : saving ? "Saving…" : "Save Configuration"}
      </button>
    </div>
  );
}

// ─── TASKS TAB ─────────────────────────────────────────────────────────────────

function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<"urgent" | "high" | "normal" | "low">("normal");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadTasks = useCallback(async () => {
    const r = await fetch(`${BASE}api/admin/mia/tasks`, { headers: authHeaders() });
    const d = await r.json() as { tasks?: Task[] };
    setTasks(d.tasks ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  async function addTask() {
    if (!title.trim()) return;
    setAdding(true);
    await fetch(`${BASE}api/admin/mia/tasks`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ title, description: desc || undefined, priority }),
    });
    setTitle("");
    setDesc("");
    setPriority("normal");
    setAdding(false);
    await loadTasks();
  }

  async function setStatus(id: number, status: string) {
    await fetch(`${BASE}api/admin/mia/tasks/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    await loadTasks();
  }

  async function deleteTask(id: number) {
    await fetch(`${BASE}api/admin/mia/tasks/${id}`, { method: "DELETE", headers: authHeaders() });
    await loadTasks();
  }

  const priorityColor: Record<string, string> = { urgent: "#ef4444", high: "#f97316", normal: "#f5b942", low: "#6b7280" };
  const statusGroups = ["pending", "in_progress", "done"];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-white font-bold text-xl mb-1">Tasks for Mia</h2>
        <p className="text-white/40 text-sm">Set tasks and objectives for Mia to work through. She can see these in her agent context.</p>
      </div>

      <div className="rounded-2xl border border-white/10 p-5 space-y-3" style={{ background: "#0a2236" }}>
        <h3 className="text-white font-semibold">Add Task</h3>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTask()}
          placeholder="Task title…"
          className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-2.5 text-sm outline-none focus:border-yellow-400"
        />
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Description / instructions (optional)"
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/5 text-white px-4 py-2.5 text-sm outline-none focus:border-yellow-400 resize-none"
        />
        <div className="flex gap-3 items-center">
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as typeof priority)}
            className="rounded-xl border border-white/10 px-3 py-2 text-sm"
            style={{ background: "#1a3a52", color: priorityColor[priority] }}
          >
            <option value="urgent" style={{ background: "#061826" }}>🔴 Urgent</option>
            <option value="high" style={{ background: "#061826" }}>🟠 High</option>
            <option value="normal" style={{ background: "#061826" }}>🟡 Normal</option>
            <option value="low" style={{ background: "#061826" }}>⚫ Low</option>
          </select>
          <button
            onClick={addTask}
            disabled={adding || !title.trim()}
            className="rounded-xl px-6 py-2 text-sm font-semibold"
            style={{ background: adding ? "#555" : "#f5b942", color: adding ? "white" : "black" }}
          >
            {adding ? "Adding…" : "Add Task"}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-white/30 text-sm text-center py-8">Loading tasks…</p>
      ) : tasks.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-8">No tasks yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {statusGroups.map(group => {
            const groupTasks = tasks.filter(t => t.status === group);
            if (groupTasks.length === 0) return null;
            return (
              <div key={group}>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                  {group === "pending" ? "⏳ Pending" : group === "in_progress" ? "🔄 In Progress" : "✅ Done"}
                </p>
                <div className="space-y-2">
                  {groupTasks.map(task => (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-white/10 p-4 flex gap-4 items-start"
                      style={{ background: "#0a2236", opacity: task.status === "done" ? 0.6 : 1 }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                        style={{ background: priorityColor[task.priority] ?? "#f5b942" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm" style={{ textDecoration: task.status === "done" ? "line-through" : "none" }}>
                          {task.title}
                        </p>
                        {task.description && <p className="text-white/50 text-xs mt-1">{task.description}</p>}
                        <p className="text-white/25 text-xs mt-1">{new Date(task.created_at).toLocaleDateString("en-AU")}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {task.status !== "in_progress" && task.status !== "done" && (
                          <button
                            onClick={() => setStatus(task.id, "in_progress")}
                            className="rounded-lg px-2 py-1 text-xs"
                            style={{ background: "#1a3a52", color: "#60a5fa" }}
                          >
                            Start
                          </button>
                        )}
                        {task.status !== "done" && (
                          <button
                            onClick={() => setStatus(task.id, "done")}
                            className="rounded-lg px-2 py-1 text-xs"
                            style={{ background: "#1a3a52", color: "#4ade80" }}
                          >
                            Done
                          </button>
                        )}
                        {task.status === "done" && (
                          <button
                            onClick={() => setStatus(task.id, "pending")}
                            className="rounded-lg px-2 py-1 text-xs"
                            style={{ background: "#1a3a52", color: "#f5b942" }}
                          >
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="rounded-lg px-2 py-1 text-xs"
                          style={{ background: "#1a3a52", color: "#f87171" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
