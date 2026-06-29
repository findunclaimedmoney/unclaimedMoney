import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { prospectsTable, alphabetCrawlProgressTable, miaConfigTable, miaDevTasksTable } from "@workspace/db/schema";
import { eq, count, sql, desc } from "drizzle-orm";
import { MIA_BOSS_PROMPT, MIA_SYSTEM_PROMPT, MIA_BOSS_TOOLS } from "../lib/mia-knowledge";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function checkAuth(req: Parameters<Parameters<typeof router.post>[1]>[0]): boolean {
  const password = process.env["ADMIN_PASSWORD"] ?? "missingcash2024";
  const auth = req.headers["x-admin-password"];
  return auth === password;
}

async function getPipelineStats(): Promise<string> {
  const [totalRow] = await db.select({ total: count() }).from(prospectsTable);
  const [contactsRow] = await db
    .select({ found: count() })
    .from(prospectsTable)
    .where(eq(prospectsTable.contactStatus, "found"));
  const [emailedRow] = await db
    .select({ sent: count() })
    .from(prospectsTable)
    .where(sql`outreach_sent_at IS NOT NULL`);

  const progress = await db.select().from(alphabetCrawlProgressTable).orderBy(alphabetCrawlProgressTable.letter);

  const done = progress.filter((p) => p.status === "done").map((p) => p.letter);
  const inProgress = progress.filter((p) => p.status === "crawling" || p.status === "searching");
  const pending = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter(
    (l) => !progress.find((p) => p.letter === l),
  );

  const lines = [
    `Pipeline stats as of ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Perth" })} AWST:`,
    ``,
    `Total prospects in database: ${totalRow?.total ?? 0}`,
    `Contacts found (email/phone): ${contactsRow?.found ?? 0}`,
    `Outreach emails sent: ${emailedRow?.sent ?? 0}`,
    ``,
    `Letters completed (${done.length}/26): ${done.length > 0 ? done.join(", ") : "none yet"}`,
    inProgress.length > 0
      ? `Currently running: ${inProgress.map((p) => `${p.letter} (${p.status})`).join(", ")}`
      : `No letter currently running`,
    `Letters not started: ${pending.length > 0 ? pending.join(", ") : "all started"}`,
  ];

  if (progress.length > 0) {
    lines.push(``, `Per-letter breakdown (completed letters):`);
    for (const p of progress.filter((x) => x.status === "done")) {
      lines.push(`  ${p.letter}: ${p.prospectCount} prospects, ${p.contactsFound} contacts, ${p.outreachSent} emails sent`);
    }
  }

  return lines.join("\n");
}

async function buildBossSystemPrompt(): Promise<string> {
  try {
    const { getMiaStatus } = await import("../lib/MiaAgent");
    const status = await getMiaStatus();
    const now = new Date().toLocaleString("en-AU", { timeZone: "Australia/Perth", weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const goalsText = status.todayGoals.length > 0
      ? status.todayGoals.map((g) => `  ${g.status === "completed" ? "✓" : "○"} [id:${g.id}] ${g.goal}`).join("\n")
      : "  No goals set yet today — they will be generated at 6:30am AWST.";
    const tasksText = status.recentTasks.length > 0
      ? status.recentTasks.slice(0, 5).map((t) => `  • ${t.type}: ${t.status}`).join("\n")
      : "  No tasks completed yet today.";
    const v = status.emotional.vector;
    const stateBlock = `## Your live state right now
Time (AWST): ${now}
Lifecycle phase: ${status.lifecycle.phase}
Emotional state: ${status.emotional.label} (score ${status.emotional.score}/100)
Emotional vector: valence ${v.valence.toFixed(2)} · arousal ${v.arousal.toFixed(2)} · curiosity ${v.curiosity.toFixed(2)} · focus ${v.focus.toFixed(2)} · confidence ${v.confidence.toFixed(2)} · concern ${v.concern.toFixed(2)}

Today's goals (use goal id to mark complete):
${goalsText}

Recent tasks:
${tasksText}

Speak from this state naturally — don't recite it mechanically. It's who you are right now.`;
    return `${MIA_BOSS_PROMPT}\n\n---\n\n${stateBlock}`;
  } catch {
    return MIA_BOSS_PROMPT;
  }
}

async function getMiaStatusText(): Promise<string> {
  try {
    const { getMiaStatus } = await import("../lib/MiaAgent");
    const status = await getMiaStatus();
    const goals = status.todayGoals.map((g) => `${g.status === "completed" ? "✓" : "○"} [id:${g.id}] ${g.goal}`).join("\n") || "No goals set today yet.";
    const tasks = status.recentTasks.slice(0, 5).map((t) => `• ${t.type}: ${t.status}`).join("\n") || "No tasks run today.";
    const v = status.emotional.vector;
    return [
      `Lifecycle: ${status.lifecycle.phase}`,
      `Emotional: ${status.emotional.label} (score ${status.emotional.score}/100)`,
      `Vector: valence ${v.valence.toFixed(2)}, arousal ${v.arousal.toFixed(2)}, curiosity ${v.curiosity.toFixed(2)}, focus ${v.focus.toFixed(2)}, confidence ${v.confidence.toFixed(2)}, concern ${v.concern.toFixed(2)}`,
      ``,
      `Today's goals:\n${goals}`,
      ``,
      `Recent tasks:\n${tasks}`,
    ].join("\n");
  } catch (e) {
    return `Could not fetch status: ${String(e)}`;
  }
}

async function handleCompleteGoal(goalId: number): Promise<string> {
  try {
    const { completeGoal } = await import("../lib/MiaGoalEngine");
    await completeGoal(goalId);
    return `Goal ${goalId} marked as completed.`;
  } catch (e) {
    return `Failed to complete goal ${goalId}: ${String(e)}`;
  }
}

async function handleFindLeads(profession: string, location: string, limit?: number): Promise<string> {
  try {
    const { findProfessionLeads } = await import("../lib/AutonomousTaskExecutor");
    const result = await findProfessionLeads(profession, location, limit ?? 10);
    if (!result || !Array.isArray(result.leads) || result.leads.length === 0) {
      return `No leads found for ${profession} in ${location}.`;
    }
    type LeadShape = { name?: string; email?: string; phone?: string; company?: string };
    const lines = (result.leads as LeadShape[]).slice(0, limit ?? 10).map((l) =>
      `• ${l.name ?? "Unknown"} — ${l.company ?? ""} — ${l.email ?? ""} ${l.phone ?? ""}`.trim()
    );
    return `Found ${result.leads.length} leads for ${profession} in ${location}:\n\n${lines.join("\n")}`;
  } catch (e) {
    return `Lead search failed: ${String(e)}`;
  }
}

type OpenAIToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };

async function executeTool(call: OpenAIToolCall): Promise<{ label: string; result: string }> {
  const name = call.function.name;
  let args: Record<string, unknown> = {};
  try { args = JSON.parse(call.function.arguments || "{}"); } catch { /* empty args */ }

  switch (name) {
    case "get_pipeline_stats":
      return { label: "📊 Pulling live pipeline stats...", result: await getPipelineStats() };
    case "get_my_status":
      return { label: "🧠 Checking my current state...", result: await getMiaStatusText() };
    case "complete_goal":
      return { label: `✓ Marking goal complete...`, result: await handleCompleteGoal(Number(args.goalId ?? 0)) };
    case "find_profession_leads":
      return { label: `🔍 Searching for ${String(args.profession ?? "")} leads in ${String(args.location ?? "")}...`, result: await handleFindLeads(String(args.profession ?? ""), String(args.location ?? ""), Number(args.limit ?? 10)) };
    default:
      return { label: `Running ${name}...`, result: `Unknown tool: ${name}` };
  }
}

// POST /api/admin/mia/chat — boss mode Mia, requires x-admin-password
router.post("/admin/mia/chat", async (req, res): Promise<void> => {
  if (!checkAuth(req)) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  const body = req.body as { messages?: { role: string; content: string }[] };
  if (!body.messages || !Array.isArray(body.messages)) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let gone = false;
  res.on("close", () => { if (!res.writableEnded) gone = true; });
  const clientGone = () => gone;

  const write = (content: string) => {
    if (!clientGone() && !res.writableEnded) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  };

  const integrationBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const integrationKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const directKey = process.env.OPENAI_API_KEY;
  const useIntegration = !!(integrationBase && integrationKey);
  const useDirect = !useIntegration && !!directKey;
  const MODEL = useIntegration ? "gpt-5.4" : "gpt-4o";

  if (!useIntegration && !useDirect) {
    write("No AI credentials configured. Please set OPENAI_API_KEY.");
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  try {
    const { default: OpenAI } = await import("openai");
    const openai = useIntegration
      ? new OpenAI({ baseURL: integrationBase, apiKey: integrationKey })
      : new OpenAI({ apiKey: directKey });

    const controller = new AbortController();
    res.on("close", () => controller.abort());

    const systemPrompt = await buildBossSystemPrompt();

    const baseMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...body.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const firstResponse = await openai.chat.completions.create(
      {
        model: MODEL,
        max_completion_tokens: 4096,
        messages: baseMessages,
        tools: MIA_BOSS_TOOLS,
        tool_choice: "auto",
        stream: false,
      },
      { signal: controller.signal },
    );

    if (clientGone()) return;

    const choice = firstResponse.choices[0];

    if (choice?.finish_reason === "tool_calls" && choice.message.tool_calls?.length) {
      const calls = choice.message.tool_calls as OpenAIToolCall[];

      const toolResults: { role: "tool"; tool_call_id: string; content: string }[] = [];
      for (const call of calls) {
        const { label, result } = await executeTool(call);
        write(`${label}\n\n`);
        logger.info({ tool: call.function.name }, "Admin Mia: tool call executed");
        toolResults.push({ role: "tool" as const, tool_call_id: call.id, content: result });
      }

      if (clientGone()) return;

      const followUpStream = await openai.chat.completions.create(
        {
          model: MODEL,
          max_completion_tokens: 4096,
          messages: [
            ...baseMessages,
            { role: "assistant" as const, content: null as unknown as string, tool_calls: calls },
            ...toolResults,
          ],
          stream: true,
        },
        { signal: controller.signal },
      );

      for await (const chunk of followUpStream) {
        if (clientGone()) break;
        const content = chunk.choices[0]?.delta?.content;
        if (content) write(content);
      }

      if (!clientGone()) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      }
      return;
    }

    const directContent = choice?.message?.content;
    if (directContent) {
      const stream = await openai.chat.completions.create(
        {
          model: MODEL,
          max_completion_tokens: 4096,
          messages: baseMessages,
          stream: true,
        },
        { signal: controller.signal },
      );
      for await (const chunk of stream) {
        if (clientGone()) break;
        const content = chunk.choices[0]?.delta?.content;
        if (content) write(content);
      }
      if (!clientGone()) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      }
      return;
    }

    if (!clientGone()) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  } catch (err) {
    if (clientGone()) return;
    logger.error({ err }, "Admin Mia chat failed");
    write("Something went wrong. Check server logs.");
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
});

// GET /api/admin/mia/status — Mia's live consciousness dashboard data
router.get("/admin/mia/status", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  try {
    const { getMiaStatus } = await import("../lib/MiaAgent");
    const status = await getMiaStatus();
    res.json(status);
  } catch (err) {
    logger.error({ err }, "Admin: getMiaStatus failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/mia/task — run an autonomous task (find_leads | reflect)
router.post("/admin/mia/task", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const body = req.body as {
    task?: string;
    profession?: string;
    location?: string;
    limit?: number;
  };

  if (body.task === "find_leads") {
    if (!body.profession || !body.location) {
      res.status(400).json({ error: "profession and location are required" });
      return;
    }
    try {
      const { findProfessionLeads } = await import("../lib/AutonomousTaskExecutor");
      const result = await findProfessionLeads(
        body.profession,
        body.location,
        body.limit ?? 15,
      );
      res.json(result);
    } catch (err) {
      logger.error({ err }, "Admin: findProfessionLeads failed");
      res.status(500).json({ error: "Lead search failed" });
    }
    return;
  }

  if (body.task === "complete_goal") {
    const goalId = Number((body as { goalId?: number }).goalId ?? 0);
    if (!goalId) { res.status(400).json({ error: "goalId required" }); return; }
    try {
      const { completeGoal } = await import("../lib/MiaGoalEngine");
      await completeGoal(goalId);
      res.json({ ok: true });
    } catch (err) {
      logger.error({ err }, "Admin: completeGoal failed");
      res.status(500).json({ error: "Failed to update goal" });
    }
    return;
  }

  if (body.task === "set_goals") {
    try {
      const { setDailyGoals } = await import("../lib/MiaGoalEngine");
      const goals = await setDailyGoals();
      res.json({ goals });
    } catch (err) {
      logger.error({ err }, "Admin: setDailyGoals failed");
      res.status(500).json({ error: "Goal generation failed" });
    }
    return;
  }

  if (body.task === "reflect") {
    try {
      const { generateDailyReflection } = await import("../lib/MiaReflectionEngine");
      const content = await generateDailyReflection();
      res.json({ content });
    } catch (err) {
      logger.error({ err }, "Admin: reflection failed");
      res.status(500).json({ error: "Reflection failed" });
    }
    return;
  }

  res.status(400).json({ error: "Unknown task. Supported: find_leads, reflect" });
});

// GET /api/admin/mia/prompts — return current prompts so the lab can pre-fill them
router.get("/admin/mia/prompts", (req, res): void => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  res.json({ boss: MIA_BOSS_PROMPT, customer: MIA_SYSTEM_PROMPT });
});

// POST /api/admin/mia/test — run any custom system prompt + message, stream the response
router.post("/admin/mia/test", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }

  const body = req.body as { systemPrompt?: string; message?: string };
  if (!body.systemPrompt || !body.message) {
    res.status(400).json({ error: "systemPrompt and message are required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let gone = false;
  res.on("close", () => { if (!res.writableEnded) gone = true; });
  const clientGone = () => gone;
  const write = (content: string) => {
    if (!clientGone() && !res.writableEnded) res.write(`data: ${JSON.stringify({ content })}\n\n`);
  };

  const integrationBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const integrationKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const directKey = process.env.OPENAI_API_KEY;
  const useIntegration = !!(integrationBase && integrationKey);
  const useDirect = !useIntegration && !!directKey;

  if (!useIntegration && !useDirect) {
    write("No AI credentials configured.");
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  try {
    const { default: OpenAI } = await import("openai");
    const openai = useIntegration
      ? new OpenAI({ baseURL: integrationBase, apiKey: integrationKey })
      : new OpenAI({ apiKey: directKey });

    const controller = new AbortController();
    res.on("close", () => controller.abort());

    const stream = await openai.chat.completions.create(
      {
        model: useIntegration ? "gpt-5.4" : "gpt-4o",
        max_completion_tokens: 2048,
        messages: [
          { role: "system", content: body.systemPrompt },
          { role: "user", content: body.message },
        ],
        stream: true,
      },
      { signal: controller.signal },
    );

    for await (const chunk of stream) {
      if (clientGone()) break;
      const content = chunk.choices[0]?.delta?.content;
      if (content) write(content);
    }

    if (!clientGone()) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  } catch (err) {
    if (clientGone()) return;
    logger.error({ err }, "Mia test run failed");
    write("Something went wrong — check server logs.");
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
});

// ─── KNOWLEDGE CONFIG ──────────────────────────────────────────────────────

async function getConfig(key: string): Promise<string | null> {
  const rows = await db.select().from(miaConfigTable).where(eq(miaConfigTable.key, key));
  return rows[0]?.value ?? null;
}

async function setConfig(key: string, value: string): Promise<void> {
  await db
    .insert(miaConfigTable)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: miaConfigTable.key, set: { value, updatedAt: new Date() } });
}

// GET /api/admin/mia/knowledge
router.get("/admin/mia/knowledge", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const addendum = await getConfig("knowledge_addendum") ?? "";
  res.json({ addendum });
});

// POST /api/admin/mia/knowledge — body: { text: string } or multipart file
router.post("/admin/mia/knowledge", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const body = req.body as { text?: string; replace?: boolean };
  if (!body.text) { res.status(400).json({ error: "text required" }); return; }
  const existing = await getConfig("knowledge_addendum") ?? "";
  const updated = body.replace ? body.text : (existing ? existing + "\n\n---\n\n" + body.text : body.text);
  await setConfig("knowledge_addendum", updated);
  res.json({ ok: true, length: updated.length });
});

// DELETE /api/admin/mia/knowledge — clear addendum
router.delete("/admin/mia/knowledge", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  await setConfig("knowledge_addendum", "");
  res.json({ ok: true });
});

// ─── SCRIPT DOWNLOAD ────────────────────────────────────────────────────────

// GET /api/admin/mia/script — download full system prompt
router.get("/admin/mia/script", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const addendum = await getConfig("knowledge_addendum") ?? "";
  const full = addendum
    ? `${MIA_SYSTEM_PROMPT}\n\n---\n\n## KNOWLEDGE ADDENDUM\n${addendum}`
    : MIA_SYSTEM_PROMPT;
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", `attachment; filename="mia-system-prompt-${new Date().toISOString().slice(0, 10)}.txt"`);
  res.send(full);
});

// ─── VOICE CONFIG ───────────────────────────────────────────────────────────

// GET /api/admin/mia/voice
router.get("/admin/mia/voice", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const voiceId = await getConfig("voice_id") ?? (process.env["ELEVENLABS_VOICE_ID"] ?? "x3PfG9wL6FOEApZ1VJ9H");
  const model = await getConfig("voice_model") ?? "eleven_turbo_v2_5";
  const avatarId = await getConfig("avatar_id") ?? "05f1da4dc12744c087dace9e0651a6e0";
  res.json({ voiceId, model, avatarId });
});

// POST /api/admin/mia/voice
router.post("/admin/mia/voice", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const body = req.body as { voiceId?: string; model?: string; avatarId?: string };
  if (body.voiceId) await setConfig("voice_id", body.voiceId);
  if (body.model) await setConfig("voice_model", body.model);
  if (body.avatarId) await setConfig("avatar_id", body.avatarId);
  res.json({ ok: true });
});

// ─── HEYGEN STREAMING PROXY ─────────────────────────────────────────────────

const HEYGEN_BASE = "https://api.heygen.com";

async function heygenPost(path: string, body: unknown): Promise<unknown> {
  const key = process.env["HEYGEN_API_KEY"];
  if (!key) throw new Error("HEYGEN_API_KEY not set");
  const r = await fetch(`${HEYGEN_BASE}${path}`, {
    method: "POST",
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

// POST /api/admin/mia/heygen/session — create streaming session
router.post("/admin/mia/heygen/session", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const avatarId = await getConfig("avatar_id") ?? "05f1da4dc12744c087dace9e0651a6e0";
  try {
    const data = await heygenPost("/v1/streaming.new", {
      quality: "high",
      avatar_id: avatarId,
      voice: { voice_id: await getConfig("voice_id") ?? "x3PfG9wL6FOEApZ1VJ9H" },
      version: "v2",
    });
    res.json(data);
  } catch (err) {
    logger.error({ err }, "HeyGen session creation failed");
    res.status(500).json({ error: "HeyGen session failed" });
  }
});

// POST /api/admin/mia/heygen/start — send WebRTC answer
router.post("/admin/mia/heygen/start", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const body = req.body as { session_id: string; sdp: { sdp: string; type: string } };
  try {
    const data = await heygenPost("/v1/streaming.start", body);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "HeyGen start failed");
    res.status(500).json({ error: "HeyGen start failed" });
  }
});

// POST /api/admin/mia/heygen/ice — relay ICE candidate
router.post("/admin/mia/heygen/ice", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const body = req.body as { session_id: string; candidate: unknown };
  try {
    const data = await heygenPost("/v1/streaming.ice", body);
    res.json(data);
  } catch (err) {
    logger.error({ err }, "HeyGen ICE failed");
    res.status(500).json({ error: "HeyGen ICE failed" });
  }
});

// POST /api/admin/mia/heygen/speak — send text for avatar to say
router.post("/admin/mia/heygen/speak", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const body = req.body as { session_id: string; text: string };
  try {
    const data = await heygenPost("/v1/streaming.task", { session_id: body.session_id, text: body.text });
    res.json(data);
  } catch (err) {
    logger.error({ err }, "HeyGen speak failed");
    res.status(500).json({ error: "HeyGen speak failed" });
  }
});

// POST /api/admin/mia/heygen/stop — close session
router.post("/admin/mia/heygen/stop", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const body = req.body as { session_id: string };
  try {
    const data = await heygenPost("/v1/streaming.stop", { session_id: body.session_id });
    res.json(data);
  } catch (err) {
    logger.error({ err }, "HeyGen stop failed");
    res.status(500).json({ error: "HeyGen stop failed" });
  }
});

// ─── DEV TASKS ──────────────────────────────────────────────────────────────

// GET /api/admin/mia/tasks
router.get("/admin/mia/tasks", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const tasks = await db.select().from(miaDevTasksTable).orderBy(desc(miaDevTasksTable.createdAt));
  res.json({ tasks });
});

// POST /api/admin/mia/tasks
router.post("/admin/mia/tasks", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const body = req.body as { title: string; description?: string; priority?: string };
  if (!body.title) { res.status(400).json({ error: "title required" }); return; }
  const [task] = await db.insert(miaDevTasksTable).values({
    title: body.title,
    description: body.description ?? null,
    priority: body.priority ?? "normal",
  }).returning();
  res.json({ task });
});

// PATCH /api/admin/mia/tasks/:id — update status
router.patch("/admin/mia/tasks/:id", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const id = Number(req.params["id"]);
  const body = req.body as { status?: string; title?: string; description?: string };
  const updates: Record<string, unknown> = {};
  if (body.status) updates["status"] = body.status;
  if (body.title) updates["title"] = body.title;
  if (body.description !== undefined) updates["description"] = body.description;
  if (body.status === "done") updates["completedAt"] = new Date();
  await db.update(miaDevTasksTable).set(updates).where(eq(miaDevTasksTable.id, id));
  res.json({ ok: true });
});

// DELETE /api/admin/mia/tasks/:id
router.delete("/admin/mia/tasks/:id", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorised" }); return; }
  const id = Number(req.params["id"]);
  await db.delete(miaDevTasksTable).where(eq(miaDevTasksTable.id, id));
  res.json({ ok: true });
});

export default router;
