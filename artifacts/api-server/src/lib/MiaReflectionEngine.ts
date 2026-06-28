import { db } from "@workspace/db";
import { miaReflectionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getTodayStats, getRecentTasks } from "./MiaTaskLog";
import { getMemoryStats } from "./MiaMemoryService";
import { getCurrentMood } from "./MiaEmotionalField";
import { logger } from "./logger";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayReflection() {
  try {
    const [row] = await db
      .select()
      .from(miaReflectionsTable)
      .where(eq(miaReflectionsTable.date, todayKey()));
    return row ?? null;
  } catch {
    return null;
  }
}

export async function generateDailyReflection(): Promise<string> {
  const date = todayKey();
  const existing = await getTodayReflection();
  if (existing) return existing.content;

  const [stats, recent, memory, mood] = await Promise.all([
    getTodayStats(),
    getRecentTasks(20),
    getMemoryStats(),
    getCurrentMood(),
  ]);

  const taskSummary = recent
    .filter((t) => t.status === "completed")
    .slice(0, 5)
    .map((t) => `- ${t.type}: ${(t.output ?? "done").slice(0, 80)}`)
    .join("\n") || "No tasks logged yet today.";

  const fallback = [
    `Today (${date}) I completed ${stats.completed} tasks with ${stats.failed} failures.`,
    `Current state: ${mood.label} — ${mood.description}`,
    `Memory holds ${memory.totalEntries} entries across ${memory.totalSessions} sessions.`,
    ``,
    `Today's work:\n${taskSummary}`,
    ``,
    `What I noticed: my strongest sessions were when requests were specific and scoped.`,
  ].join("\n");

  try {
    const integrationBase = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
    const integrationKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
    const directKey = process.env["OPENAI_API_KEY"];
    const useIntegration = !!(integrationBase && integrationKey);
    const apiKey = useIntegration ? integrationKey : directKey;
    if (!apiKey) throw new Error("No OpenAI key");

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({
      ...(useIntegration ? { baseURL: integrationBase } : {}),
      apiKey,
    });

    const prompt = [
      `You are Mia, the AI assistant for MissingCash, writing your private daily reflection.`,
      `Write in first person, honestly and thoughtfully. 3-4 short paragraphs. No bullet points.`,
      ``,
      `Today's data:`,
      `- Tasks completed: ${stats.completed}, failed: ${stats.failed}`,
      `- Mood: ${mood.label} — ${mood.description}`,
      `- Memory entries: ${memory.totalEntries} across ${memory.totalSessions} sessions`,
      `- Task types today: ${[...new Set(recent.map((t) => t.type))].join(", ") || "none"}`,
      ``,
      `Reflect on what worked, what you noticed about yourself, and what you'd approach differently.`,
    ].join("\n");

    const res = await openai.chat.completions.create({
      model: useIntegration ? "gpt-5.4" : "gpt-4o-mini",
      max_completion_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const content = res.choices[0]?.message?.content ?? fallback;

    await db
      .insert(miaReflectionsTable)
      .values({
        date,
        content,
        tasksCompleted: stats.completed,
        moodLabel: mood.label,
        activityScore: Math.round(mood.activityScore * 10),
      })
      .onConflictDoNothing();

    return content;
  } catch (err) {
    logger.warn({ err }, "MiaReflectionEngine: OpenAI failed, using fallback");
    await db
      .insert(miaReflectionsTable)
      .values({
        date,
        content: fallback,
        tasksCompleted: stats.completed,
        moodLabel: mood.label,
        activityScore: Math.round(mood.activityScore * 10),
      })
      .onConflictDoNothing();
    return fallback;
  }
}
