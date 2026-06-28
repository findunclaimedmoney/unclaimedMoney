import { db } from "@workspace/db";
import { miaMemoriesTable } from "@workspace/db/schema";
import { count, sql } from "drizzle-orm";
import { logger } from "./logger";

export interface MemoryStats {
  totalSessions: number;
  totalEntries: number;
  recentActivity: number;
}

export async function getMemoryStats(): Promise<MemoryStats> {
  try {
    const [totals] = await db
      .select({ sessions: count() })
      .from(miaMemoriesTable);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recent] = await db
      .select({ c: count() })
      .from(miaMemoriesTable)
      .where(sql`updated_at > ${sevenDaysAgo}`);

    const allMemories = await db
      .select({ memories: miaMemoriesTable.memories })
      .from(miaMemoriesTable);

    const totalEntries = allMemories.reduce((sum, m) => {
      return sum + (m.memories ? m.memories.split("\n").filter((l) => l.trim()).length : 0);
    }, 0);

    return {
      totalSessions: totals?.sessions ?? 0,
      totalEntries,
      recentActivity: recent?.c ?? 0,
    };
  } catch (err) {
    logger.warn({ err }, "MiaMemoryService: getMemoryStats failed");
    return { totalSessions: 0, totalEntries: 0, recentActivity: 0 };
  }
}

export async function getLearningRate(): Promise<number> {
  try {
    const now = Date.now();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const [thisWeek] = await db
      .select({ c: count() })
      .from(miaMemoriesTable)
      .where(sql`updated_at > ${weekAgo}`);
    const [lastWeek] = await db
      .select({ c: count() })
      .from(miaMemoriesTable)
      .where(sql`updated_at > ${twoWeeksAgo} AND updated_at <= ${weekAgo}`);

    const tw = thisWeek?.c ?? 0;
    const lw = lastWeek?.c ?? 1;
    const rate = ((tw - lw) / Math.max(lw, 1)) * 100;
    return Math.round(Math.max(-99, Math.min(999, rate)) * 10) / 10;
  } catch {
    return 0;
  }
}
