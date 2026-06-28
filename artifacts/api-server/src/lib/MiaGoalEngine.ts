import { db } from "@workspace/db";
import { miaGoalsTable, prospectsTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";
import { logger } from "./logger";

export interface Goal {
  id: number;
  goal: string;
  priority: number;
  status: string;
  reasoning: string | null;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayGoals(): Promise<Goal[]> {
  try {
    return await db
      .select()
      .from(miaGoalsTable)
      .where(eq(miaGoalsTable.date, todayKey()))
      .orderBy(miaGoalsTable.priority);
  } catch {
    return [];
  }
}

export async function setDailyGoals(): Promise<Goal[]> {
  const date = todayKey();
  const existing = await getTodayGoals();
  if (existing.length > 0) return existing;

  const { getTodayStats, getRecentTasks } = await import("./MiaTaskLog");
  const { getMemoryStats } = await import("./MiaMemoryService");

  const [stats, recent, memory, total, found] = await Promise.all([
    getTodayStats(),
    getRecentTasks(20),
    getMemoryStats(),
    db.select({ n: count() }).from(prospectsTable).then(r => r[0]?.n ?? 0),
    db.select({ n: count() }).from(prospectsTable).where(eq(prospectsTable.contactStatus, "found")).then(r => r[0]?.n ?? 0),
  ]);

  const context = [
    `Pipeline: ${total} prospects, ${found} with contacts found.`,
    `Yesterday completed ${stats.completed} tasks (${stats.failed} failed).`,
    `Memory: ${memory.totalEntries} entries across ${memory.totalSessions} sessions.`,
    `Task types seen recently: ${[...new Set(recent.map((t) => t.type))].join(", ") || "none yet"}.`,
    `Today is ${new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}.`,
  ].join("\n");

  const fallbackGoals = [
    { goal: "Check pipeline health and flag contacts needing follow-up", priority: 1, reasoning: "Daily maintenance keeps leads fresh" },
    { goal: "Review and retry any failed tasks from yesterday", priority: 2, reasoning: "Resilience — don't let failures compound" },
    { goal: "Process at least 3 new prospect searches if pipeline has capacity", priority: 3, reasoning: "Keeps the prospect database growing" },
    { goal: "Write today's reflection before end of day", priority: 4, reasoning: "Self-improvement requires self-review" },
  ];

  try {
    const integrationBase = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
    const integrationKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
    const directKey = process.env["OPENAI_API_KEY"];
    const useIntegration = !!(integrationBase && integrationKey);
    const apiKey = useIntegration ? integrationKey : directKey;
    if (!apiKey) throw new Error("no key");

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({
      ...(useIntegration ? { baseURL: integrationBase } : {}),
      apiKey,
    });

    const res = await openai.chat.completions.create({
      model: useIntegration ? "gpt-5.4" : "gpt-4o-mini",
      max_completion_tokens: 600,
      messages: [
        {
          role: "user",
          content: [
            `You are Mia, AI assistant for MissingCash (Australian unclaimed money). It's 6:30am — set your goals for today.`,
            ``,
            `Context:\n${context}`,
            ``,
            `Generate 4-5 specific, achievable goals that directly serve MissingCash's mission.`,
            `Respond with a JSON array only, no markdown:`,
            `[{ "goal": "under 80 chars", "priority": 1, "reasoning": "why today" }, ...]`,
            `Priority 1 = most important.`,
          ].join("\n"),
        },
      ],
    });

    const raw = res.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as typeof fallbackGoals;
    const goals = (Array.isArray(parsed) ? parsed : fallbackGoals).slice(0, 5);
    const rows = await db.insert(miaGoalsTable).values(
      goals.map((g) => ({ date, goal: g.goal, priority: g.priority ?? 3, reasoning: g.reasoning ?? null, status: "pending" })),
    ).returning();
    return rows;
  } catch (err) {
    logger.warn({ err }, "MiaGoalEngine: GPT failed, using fallback goals");
    const rows = await db.insert(miaGoalsTable).values(
      fallbackGoals.map((g) => ({ date, goal: g.goal, priority: g.priority, reasoning: g.reasoning, status: "pending" })),
    ).returning();
    return rows;
  }
}

export async function completeGoal(id: number): Promise<void> {
  try {
    await db.update(miaGoalsTable).set({ status: "completed", completedAt: new Date() })
      .where(eq(miaGoalsTable.id, id));
  } catch (err) {
    logger.warn({ err, id }, "MiaGoalEngine: completeGoal failed");
  }
}

export async function updateGoalStatus(id: number, status: "pending" | "in_progress" | "completed" | "abandoned"): Promise<void> {
  try {
    await db.update(miaGoalsTable).set({
      status,
      ...(status === "completed" ? { completedAt: new Date() } : {}),
    }).where(eq(miaGoalsTable.id, id));
  } catch (err) {
    logger.warn({ err, id }, "MiaGoalEngine: updateGoalStatus failed");
  }
}
