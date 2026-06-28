import { useState, useEffect, useCallback } from "react";

const BASE = import.meta.env.BASE_URL;

interface EmotionalVector {
  valence: number;
  arousal: number;
  curiosity: number;
  focus: number;
  confidence: number;
  concern: number;
}

interface MiaStatus {
  lifecycle: { phase: string; phaseStartedAt: string; todayGoalsSet: boolean };
  emotional: { vector: EmotionalVector; label: string; score: number; description: string; activityScore: number };
  todayStats: { completed: number; failed: number; running: number; total: number };
  memoryStats: { totalSessions: number; totalEntries: number; recentActivity: number };
  learningRate: number;
  todayGoals: { id: number; goal: string; priority: number; status: string; reasoning: string | null }[];
  recentTasks: { id: number; type: string; status: string; output: string | null; createdAt: string; durationMs: number | null }[];
  todayReflection: string | null;
}

const PHASES: { key: string; label: string; time: string }[] = [
  { key: "sleeping",     label: "Sleep",    time: "12am–6am" },
  { key: "waking",       label: "Wake",     time: "6:00" },
  { key: "reviewing",    label: "Review",   time: "6:05" },
  { key: "goal-setting", label: "Goals",    time: "6:30" },
  { key: "active",       label: "Active",   time: "7am–11pm" },
  { key: "logging",      label: "Log",      time: "11pm" },
  { key: "maintenance",  label: "Maint.",   time: "12am" },
];

const MOOD_COLORS: Record<string, string> = {
  Satisfied: "text-green-400", Curious: "text-blue-400", Focused: "text-yellow-400",
  Energised: "text-orange-400", Reflective: "text-purple-400", Concerned: "text-red-400", Determined: "text-cyan-400",
};

const TASK_LABELS: Record<string, string> = {
  lead_search: "Lead Search", contact_find: "Contact Find", reflection: "Reflection",
  outreach: "Outreach", pipeline_check: "Pipeline Check", memory_save: "Memory Save",
  search: "Search", report: "Report",
};

function ActivityRing({ score }: { score: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const fill = (score / 10) * circ;
  return (
    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(245,185,66,0.12)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f5b942" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={`${fill} ${circ - fill}`} className="transition-all duration-1000" />
      </svg>
      <div className="text-center z-10">
        <p className="text-2xl font-bold text-primary leading-none">{score.toFixed(1)}</p>
        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Φ Score</p>
      </div>
    </div>
  );
}

function VectorBar({ label, value, lo = 0, hi = 1, invert = false }: {
  label: string; value: number; lo?: number; hi?: number; invert?: boolean;
}) {
  const pct = ((value - lo) / (hi - lo)) * 100;
  const display = invert ? 100 - pct : pct;
  const color = display > 75 ? "bg-green-400" : display > 45 ? "bg-primary" : "bg-red-400";
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-white/50 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.max(2, display)}%` }} />
      </div>
      <span className="text-[11px] text-white/40 w-8 text-right">{Math.round(display)}%</span>
    </div>
  );
}

function LifecycleBar({ phase }: { phase: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">Daily Lifecycle</p>
      <div className="flex items-stretch gap-1">
        {PHASES.map((p) => {
          const active = p.key === phase;
          return (
            <div key={p.key} className={`flex-1 text-center rounded-lg py-2 px-1 transition-all ${
              active ? "bg-primary text-black" : "bg-white/5 text-white/30"
            }`}>
              <p className={`text-[10px] font-bold ${active ? "text-black" : ""}`}>{p.label}</p>
              <p className={`text-[9px] mt-0.5 ${active ? "text-black/60" : "text-white/20"}`}>{p.time}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GoalList({ goals, onComplete, adminPassword }: {
  goals: MiaStatus["todayGoals"];
  onComplete: (id: number) => void;
  adminPassword: string;
}) {
  const [completing, setCompleting] = useState<number | null>(null);

  const complete = async (id: number) => {
    setCompleting(id);
    try {
      await fetch(`${BASE}api/admin/mia/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
        body: JSON.stringify({ task: "complete_goal", goalId: id }),
      });
      onComplete(id);
    } finally {
      setCompleting(null);
    }
  };

  if (goals.length === 0) {
    return <p className="text-sm text-white/30 italic px-1">No goals set yet. They'll appear at 6:30am or click Generate.</p>;
  }

  return (
    <div className="space-y-2">
      {goals.map((g) => (
        <div key={g.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
          g.status === "completed"
            ? "border-green-400/20 bg-green-400/5"
            : "border-white/10 bg-white/3 hover:bg-white/5"
        }`}>
          <button
            onClick={() => g.status !== "completed" && void complete(g.id)}
            disabled={g.status === "completed" || completing === g.id}
            className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
              g.status === "completed"
                ? "border-green-400 bg-green-400/20 text-green-400"
                : "border-white/30 hover:border-primary"
            }`}
          >
            {g.status === "completed" && <span className="text-[10px]">✓</span>}
            {completing === g.id && <span className="text-[10px] animate-pulse">…</span>}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${g.status === "completed" ? "line-through text-white/30" : "text-white/80"}`}>
              {g.goal}
            </p>
            {g.reasoning && (
              <p className="text-[11px] text-white/30 mt-0.5">{g.reasoning}</p>
            )}
          </div>
          <span className={`text-[10px] font-bold shrink-0 mt-1 ${
            g.priority === 1 ? "text-red-400" : g.priority === 2 ? "text-orange-400" : "text-white/30"
          }`}>P{g.priority}</span>
        </div>
      ))}
    </div>
  );
}

export default function MiaConsciousnessUI({ adminPassword }: { adminPassword: string }) {
  const [status, setStatus] = useState<MiaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reflectRunning, setReflectRunning] = useState(false);
  const [goalsRunning, setGoalsRunning] = useState(false);
  const [leadProf, setLeadProf] = useState("");
  const [leadLoc, setLeadLoc] = useState("");
  const [leadRunning, setLeadRunning] = useState(false);
  const [leadResult, setLeadResult] = useState<{
    leads: { name: string; email: string | null; phone: string | null; amount: string; state: string | null; professionMatch: boolean }[];
    summary: string;
  } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}api/admin/mia/status`, {
        headers: { "x-admin-password": adminPassword },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setStatus(await r.json() as MiaStatus);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  useEffect(() => {
    void fetchStatus();
    const iv = setInterval(() => void fetchStatus(), 30_000);
    return () => clearInterval(iv);
  }, [fetchStatus]);

  const post = async (body: object) => fetch(`${BASE}api/admin/mia/task`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
    body: JSON.stringify(body),
  });

  const runReflection = async () => {
    setReflectRunning(true);
    try { await post({ task: "reflect" }); await fetchStatus(); } finally { setReflectRunning(false); }
  };

  const generateGoals = async () => {
    setGoalsRunning(true);
    try { await post({ task: "set_goals" }); await fetchStatus(); } finally { setGoalsRunning(false); }
  };

  const runLeadSearch = async () => {
    if (!leadProf.trim() || !leadLoc.trim()) return;
    setLeadRunning(true);
    setLeadResult(null);
    try {
      const r = await post({ task: "find_leads", profession: leadProf.trim(), location: leadLoc.trim(), limit: 20 });
      if (r.ok) { setLeadResult(await r.json() as typeof leadResult); await fetchStatus(); }
    } finally { setLeadRunning(false); }
  };

  const markGoalComplete = (id: number) => {
    setStatus((s) => s ? { ...s, todayGoals: s.todayGoals.map((g) => g.id === id ? { ...g, status: "completed" } : g) } : s);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-white/40 animate-pulse text-sm">Loading Mia's status…</div>;
  }

  if (error || !status) {
    return (
      <div className="text-center py-16 text-red-400 text-sm">
        Failed to load: {error}
        <button onClick={() => void fetchStatus()} className="ml-3 underline text-white/40 hover:text-white">Retry</button>
      </div>
    );
  }

  const { lifecycle, emotional, todayStats, memoryStats, learningRate, todayGoals, recentTasks, todayReflection } = status;
  const successRate = todayStats.total > 0 ? Math.round((todayStats.completed / todayStats.total) * 100) : 100;
  const v = emotional.vector;

  return (
    <div className="space-y-5">

      {/* Lifecycle timeline */}
      <LifecycleBar phase={lifecycle.phase} />

      {/* Identity card + emotional vector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Identity */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-5">
          <div className="relative shrink-0">
            <img src={`${BASE}mia-poster.jpg`} alt="Mia"
              className="w-18 h-18 w-[72px] h-[72px] rounded-full object-cover border-2 border-primary/60" />
            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#061826] ${
              lifecycle.phase === "sleeping" || lifecycle.phase === "maintenance" ? "bg-white/30" : "bg-green-400"
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-lg font-bold text-white">Mia</h2>
              <span className={`text-sm font-semibold ${MOOD_COLORS[emotional.label] ?? "text-white"}`}>
                {emotional.label}
              </span>
              <span className="text-xs text-white/25">{emotional.score}%</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">{emotional.description}</p>
            <p className="text-[10px] text-white/25 mt-2 uppercase tracking-widest">
              Phase: {lifecycle.phase}
            </p>
          </div>
          <ActivityRing score={emotional.activityScore} />
        </div>

        {/* Emotional vector */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Emotional Field</p>
          <div className="space-y-2.5">
            <VectorBar label="Valence"    value={v.valence}    lo={-1} hi={1} />
            <VectorBar label="Arousal"    value={v.arousal} />
            <VectorBar label="Curiosity"  value={v.curiosity} />
            <VectorBar label="Focus"      value={v.focus} />
            <VectorBar label="Confidence" value={v.confidence} />
            <VectorBar label="Concern"    value={v.concern}    invert />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tasks Today", value: `${todayStats.completed}/${todayStats.total}`,
            sub: `${todayStats.failed} failed · ${todayStats.running} running`, color: "text-primary" },
          { label: "Success Rate", value: `${successRate}%`,
            sub: `${todayStats.completed} completed`,
            color: successRate >= 80 ? "text-green-400" : successRate >= 50 ? "text-yellow-400" : "text-red-400" },
          { label: "Memory Entries", value: memoryStats.totalEntries.toLocaleString(),
            sub: `${memoryStats.totalSessions} sessions`, color: "text-blue-400" },
          { label: "Learning Rate", value: `${learningRate > 0 ? "+" : ""}${learningRate.toFixed(1)}%`,
            sub: "vs. last week", color: learningRate >= 0 ? "text-green-400" : "text-red-400" },
        ].map((c) => (
          <div key={c.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-white/30 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Goals + reflection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Today's goals */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Today's Goals</p>
              <p className="text-[10px] text-white/25 mt-0.5">Set autonomously at 6:30am</p>
            </div>
            <button onClick={() => void generateGoals()} disabled={goalsRunning}
              className="text-xs text-primary/70 hover:text-primary border border-primary/20 hover:border-primary/50 rounded-lg px-3 py-1 transition-colors disabled:opacity-40">
              {goalsRunning ? "Setting…" : todayGoals.length > 0 ? "↻ Reset" : "✦ Generate"}
            </button>
          </div>
          <div className="p-5">
            <GoalList goals={todayGoals} onComplete={markGoalComplete} adminPassword={adminPassword} />
          </div>
        </div>

        {/* Reflection */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Today's Reflection</p>
              <p className="text-[10px] text-white/25 mt-0.5">Written by Mia at 11pm</p>
            </div>
            <button onClick={() => void runReflection()} disabled={reflectRunning}
              className="text-xs text-primary/70 hover:text-primary border border-primary/20 hover:border-primary/50 rounded-lg px-3 py-1 transition-colors disabled:opacity-40">
              {reflectRunning ? "Thinking…" : "✦ Generate"}
            </button>
          </div>
          <div className="p-5 flex-1 overflow-y-auto max-h-72">
            {todayReflection
              ? <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{todayReflection}</p>
              : <p className="text-sm text-white/30 italic">No reflection yet. Click Generate or wait until 11pm.</p>
            }
          </div>
        </div>
      </div>

      {/* Task log */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Task Log</p>
          <span className="text-xs text-white/25">{recentTasks.length} recent entries</span>
        </div>
        <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
          {recentTasks.length === 0
            ? <p className="px-5 py-4 text-sm text-white/30">No tasks yet — the lifecycle will start logging at 6am.</p>
            : recentTasks.map((t) => (
                <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                  <span className={`text-sm font-bold shrink-0 ${
                    t.status === "completed" ? "text-green-400" : t.status === "failed" ? "text-red-400" : "text-yellow-400"
                  }`}>
                    {t.status === "completed" ? "✓" : t.status === "failed" ? "✗" : "⟳"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-white/80">{TASK_LABELS[t.type] ?? t.type}</span>
                    {t.output && <p className="text-[11px] text-white/40 truncate mt-0.5">{t.output}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    {t.durationMs && <p className="text-[10px] text-white/25">{(t.durationMs / 1000).toFixed(1)}s</p>}
                    <p className="text-[10px] text-white/20">
                      {new Date(t.createdAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
          }
        </div>
      </div>

      {/* Autonomous lead finder */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/10">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Autonomous Lead Finder</p>
          <p className="text-[10px] text-white/30 mt-0.5">Mia queries your contacts database for profession + location matches</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <input value={leadProf} onChange={(e) => setLeadProf(e.target.value)}
              placeholder="Profession (e.g. dentist)"
              className="flex-1 min-w-36 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm outline-none focus:border-primary" />
            <input value={leadLoc} onChange={(e) => setLeadLoc(e.target.value)}
              placeholder="Location (e.g. Sydney)"
              className="flex-1 min-w-36 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm outline-none focus:border-primary"
              onKeyDown={(e) => { if (e.key === "Enter") void runLeadSearch(); }} />
            <button onClick={() => void runLeadSearch()} disabled={leadRunning || !leadProf.trim() || !leadLoc.trim()}
              className="bg-primary text-black font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 text-sm whitespace-nowrap">
              {leadRunning ? "Searching…" : "▶ Find Leads"}
            </button>
          </div>
          {leadResult && (
            <div>
              <p className="text-sm text-white/70 mb-3">{leadResult.summary}</p>
              {leadResult.leads.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10">
                        {["Name","Amount","State","Email","Phone","Match"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-white/40 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leadResult.leads.map((lead, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2.5 text-white/80 font-medium">{lead.name}</td>
                          <td className="px-4 py-2.5 text-primary">{lead.amount}</td>
                          <td className="px-4 py-2.5 text-white/50">{lead.state ?? "—"}</td>
                          <td className="px-4 py-2.5 text-white/60">{lead.email ?? "—"}</td>
                          <td className="px-4 py-2.5 text-white/60">{lead.phone ?? "—"}</td>
                          <td className="px-4 py-2.5">{lead.professionMatch
                            ? <span className="text-green-400 font-bold">✓</span>
                            : <span className="text-white/20">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button onClick={() => void fetchStatus()}
        className="w-full text-xs text-white/20 hover:text-white/40 py-2 transition-colors">
        ↻ Refresh · auto-updates every 30s
      </button>
    </div>
  );
}
