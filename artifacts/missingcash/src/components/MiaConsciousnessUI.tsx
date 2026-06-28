import { useState, useEffect, useCallback } from "react";

const BASE = import.meta.env.BASE_URL;

interface MiaStatus {
  mood: {
    label: string;
    score: number;
    description: string;
    activityScore: number;
  };
  todayStats: {
    completed: number;
    failed: number;
    running: number;
    total: number;
  };
  memoryStats: {
    totalSessions: number;
    totalEntries: number;
    recentActivity: number;
  };
  learningRate: number;
  recentTasks: {
    id: number;
    type: string;
    status: string;
    output: string | null;
    createdAt: string;
    durationMs: number | null;
  }[];
  todayReflection: string | null;
}

const MOOD_COLORS: Record<string, string> = {
  Satisfied: "text-green-400",
  Curious: "text-blue-400",
  Focused: "text-yellow-400",
  Energised: "text-orange-400",
  Reflective: "text-purple-400",
  Concerned: "text-red-400",
  Determined: "text-cyan-400",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "text-green-400",
  failed: "text-red-400",
  running: "text-yellow-400",
};

const STATUS_ICONS: Record<string, string> = {
  completed: "✓",
  failed: "✗",
  running: "⟳",
};

const TASK_LABELS: Record<string, string> = {
  lead_search: "Lead Search",
  contact_find: "Contact Find",
  reflection: "Reflection",
  outreach: "Outreach",
  pipeline_check: "Pipeline Check",
  memory_save: "Memory Save",
  search: "Search",
  report: "Report",
};

function ActivityRing({ score }: { score: number }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const fill = (score / 10) * circ;
  const gap = circ - fill;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(245,185,66,0.12)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#f5b942"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${gap}`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="text-center">
        <p className="text-2xl font-bold text-primary leading-none">{score.toFixed(1)}</p>
        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Φ Score</p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color = "text-white",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function MiaConsciousnessUI({ adminPassword }: { adminPassword: string }) {
  const [status, setStatus] = useState<MiaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [leadProf, setLeadProf] = useState("");
  const [leadLoc, setLeadLoc] = useState("");
  const [leadRunning, setLeadRunning] = useState(false);
  const [leadResult, setLeadResult] = useState<{
    leads: { name: string; email: string | null; phone: string | null; amount: string; state: string | null; professionMatch: boolean }[];
    summary: string;
  } | null>(null);

  const [reflectRunning, setReflectRunning] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}api/admin/mia/status`, {
        headers: { "x-admin-password": adminPassword },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as MiaStatus;
      setStatus(data);
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

  const runReflection = async () => {
    setReflectRunning(true);
    try {
      const r = await fetch(`${BASE}api/admin/mia/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ task: "reflect" }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await fetchStatus();
    } catch (e) {
      alert(`Reflection failed: ${String(e)}`);
    } finally {
      setReflectRunning(false);
    }
  };

  const runLeadSearch = async () => {
    if (!leadProf.trim() || !leadLoc.trim()) return;
    setLeadRunning(true);
    setLeadResult(null);
    try {
      const r = await fetch(`${BASE}api/admin/mia/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ task: "find_leads", profession: leadProf.trim(), location: leadLoc.trim(), limit: 20 }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json() as typeof leadResult;
      setLeadResult(data);
      await fetchStatus();
    } catch (e) {
      alert(`Lead search failed: ${String(e)}`);
    } finally {
      setLeadRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <span className="animate-pulse text-sm">Loading Mia's status…</span>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="text-center py-16 text-red-400 text-sm">
        Failed to load: {error ?? "Unknown error"}
        <button onClick={() => void fetchStatus()} className="ml-3 underline text-white/40 hover:text-white">
          Retry
        </button>
      </div>
    );
  }

  const { mood, todayStats, memoryStats, learningRate, recentTasks, todayReflection } = status;
  const successRate = todayStats.total > 0 ? Math.round((todayStats.completed / todayStats.total) * 100) : 100;
  const moodColor = MOOD_COLORS[mood.label] ?? "text-white";

  return (
    <div className="space-y-6">
      {/* ── Header: Identity Card ── */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6">
        <div className="relative">
          <img src={`${BASE}mia-poster.jpg`} alt="Mia" className="w-20 h-20 rounded-full object-cover border-2 border-primary/60" />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-[#061826]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-white">Mia</h2>
            <span className={`text-sm font-semibold ${moodColor}`}>{mood.label}</span>
            <span className="text-xs text-white/30">·</span>
            <span className="text-xs text-white/50">{mood.score}% score</span>
          </div>
          <p className="text-sm text-white/60">{mood.description}</p>
        </div>
        <ActivityRing score={mood.activityScore} />
        <button
          onClick={() => void fetchStatus()}
          className="text-xs text-white/30 hover:text-white/60 border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Tasks Today"
          value={`${todayStats.completed}/${todayStats.total}`}
          sub={`${todayStats.failed} failed · ${todayStats.running} running`}
          color="text-primary"
        />
        <StatCard
          label="Success Rate"
          value={`${successRate}%`}
          sub={`${todayStats.completed} completed`}
          color={successRate >= 80 ? "text-green-400" : successRate >= 60 ? "text-yellow-400" : "text-red-400"}
        />
        <StatCard
          label="Memory Entries"
          value={memoryStats.totalEntries.toLocaleString()}
          sub={`${memoryStats.totalSessions} sessions · ${memoryStats.recentActivity} active this week`}
          color="text-blue-400"
        />
        <StatCard
          label="Learning Rate"
          value={`${learningRate > 0 ? "+" : ""}${learningRate.toFixed(1)}%`}
          sub="session growth vs. last week"
          color={learningRate >= 0 ? "text-green-400" : "text-red-400"}
        />
      </div>

      {/* ── Two columns: Task Log + Reflection ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Task Log */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Recent Tasks</p>
            <span className="text-xs text-white/30">{recentTasks.length} entries</span>
          </div>
          <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
            {recentTasks.length === 0 ? (
              <p className="px-5 py-4 text-sm text-white/30">No tasks logged yet today.</p>
            ) : (
              recentTasks.map((t) => (
                <div key={t.id} className="px-5 py-3 flex items-start gap-3">
                  <span className={`text-sm font-bold mt-0.5 ${STATUS_COLORS[t.status] ?? "text-white/40"}`}>
                    {STATUS_ICONS[t.status] ?? "·"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white/80">
                        {TASK_LABELS[t.type] ?? t.type}
                      </span>
                      {t.durationMs && (
                        <span className="text-[10px] text-white/25">{(t.durationMs / 1000).toFixed(1)}s</span>
                      )}
                    </div>
                    {t.output && (
                      <p className="text-[11px] text-white/40 truncate mt-0.5">{t.output}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-white/20 whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reflection */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Today's Reflection</p>
            <button
              onClick={() => void runReflection()}
              disabled={reflectRunning}
              className="text-xs text-primary/70 hover:text-primary border border-primary/20 hover:border-primary/50 rounded-lg px-3 py-1 transition-colors disabled:opacity-40"
            >
              {reflectRunning ? "Thinking…" : "✦ Generate"}
            </button>
          </div>
          <div className="p-5 flex-1">
            {todayReflection ? (
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{todayReflection}</p>
            ) : (
              <p className="text-sm text-white/30 italic">
                No reflection yet today. Click Generate to have Mia reflect on her day.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Autonomous Lead Finder ── */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/10">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Autonomous Lead Finder</p>
          <p className="text-xs text-white/30 mt-0.5">Mia searches your contacts database for profession + location matches</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <input
              value={leadProf}
              onChange={(e) => setLeadProf(e.target.value)}
              placeholder="Profession (e.g. dentist)"
              className="flex-1 min-w-36 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm outline-none focus:border-primary"
            />
            <input
              value={leadLoc}
              onChange={(e) => setLeadLoc(e.target.value)}
              placeholder="Location (e.g. Sydney)"
              className="flex-1 min-w-36 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm outline-none focus:border-primary"
              onKeyDown={(e) => { if (e.key === "Enter") void runLeadSearch(); }}
            />
            <button
              onClick={() => void runLeadSearch()}
              disabled={leadRunning || !leadProf.trim() || !leadLoc.trim()}
              className="bg-primary text-black font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 text-sm whitespace-nowrap"
            >
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
                        <th className="px-4 py-2.5 text-left text-white/40 font-medium">Name</th>
                        <th className="px-4 py-2.5 text-left text-white/40 font-medium">Amount</th>
                        <th className="px-4 py-2.5 text-left text-white/40 font-medium">State</th>
                        <th className="px-4 py-2.5 text-left text-white/40 font-medium">Email</th>
                        <th className="px-4 py-2.5 text-left text-white/40 font-medium">Phone</th>
                        <th className="px-4 py-2.5 text-left text-white/40 font-medium">Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leadResult.leads.map((lead, i) => (
                        <tr key={i} className="hover:bg-white/3">
                          <td className="px-4 py-2.5 text-white/80 font-medium">{lead.name}</td>
                          <td className="px-4 py-2.5 text-primary">{lead.amount}</td>
                          <td className="px-4 py-2.5 text-white/50">{lead.state ?? "—"}</td>
                          <td className="px-4 py-2.5 text-white/60">{lead.email ?? "—"}</td>
                          <td className="px-4 py-2.5 text-white/60">{lead.phone ?? "—"}</td>
                          <td className="px-4 py-2.5">
                            {lead.professionMatch ? (
                              <span className="text-green-400 font-bold">✓</span>
                            ) : (
                              <span className="text-white/25">—</span>
                            )}
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
    </div>
  );
}
