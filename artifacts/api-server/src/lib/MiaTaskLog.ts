import { db } from "@workspace/db";
import { miaTaskLogTable } from "@workspace/db/schema";
import { desc, eq, gte, sql } from "drizzle-orm";
import { logger } from "./logger";

export type TaskType =
  | "lead_search"
  | "contact_find"
  | "reflection"
  | "outreach"
  | "pipeline_check"
  | "memory_save"
  | "search"
  | "report";

export async function startTask(type: TaskType, input?: string): Promise<number> {
  try {
    const [row] = await db
      .insert(miaTaskLogTable)
      .values({ type, status: "running", input })
      .returning({ id: miaTaskLogTable.id });
    return row?.id ?? 0;
  } catch (err) {
    logger.warn({ err }, "MiaTaskLog: startTask failed");
    return 0;
  }
}

export async function completeTask(id: number, output: string, startedAt: Date): Promise<void> {
  if (!id) return;
  try {
    await db
      .update(miaTaskLogTable)
      .set({
        status: "completed",
        output,
        durationMs: Date.now() - startedAt.getTime(),
        completedAt: new Date(),
      })
      .where(eq(miaTaskLogTable.id, id));
  } catch (err) {
    logger.warn({ err, id }, "MiaTaskLog: completeTask failed");
  }
}

export async function failTask(id: number, error: string, startedAt: Date): Promise<void> {
  if (!id) return;
  try {
    await db
      .update(miaTaskLogTable)
      .set({
        status: "failed",
        output: error,
        durationMs: Date.now() - startedAt.getTime(),
        completedAt: new Date(),
      })
      .where(eq(miaTaskLogTable.id, id));
  } catch (err) {
    logger.warn({ err, id }, "MiaTaskLog: failTask failed");
  }
}

export async function getRecentTasks(limit = 20) {
  try {
    return await db
      .select()
      .from(miaTaskLogTable)
      .orderBy(desc(miaTaskLogTable.createdAt))
      .limit(limit);
  } catch (err) {
    logger.warn({ err }, "MiaTaskLog: getRecentTasks failed");
    return [];
  }
}

export async function getTodayStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  try {
    const rows = await db
      .select()
      .from(miaTaskLogTable)
      .where(gte(miaTaskLogTable.createdAt, today));
    return {
      completed: rows.filter((r) => r.status === "completed").length,
      failed: rows.filter((r) => r.status === "failed").length,
      running: rows.filter((r) => r.status === "running").length,
      total: rows.length,
    };
  } catch {
    return { completed: 0, failed: 0, running: 0, total: 0 };
  }
}
