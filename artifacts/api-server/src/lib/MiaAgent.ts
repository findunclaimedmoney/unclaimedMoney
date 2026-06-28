import { getTodayStats, getRecentTasks } from "./MiaTaskLog";
import { getMemoryStats, getLearningRate } from "./MiaMemoryService";
import { getCurrentMood } from "./MiaEmotionalField";
import { getTodayReflection } from "./MiaReflectionEngine";
import { logger } from "./logger";

export interface MiaStatus {
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
  recentTasks: Array<{
    id: number;
    type: string;
    status: string;
    output: string | null;
    createdAt: Date;
    durationMs: number | null;
  }>;
  todayReflection: string | null;
}

export async function getMiaStatus(): Promise<MiaStatus> {
  const [mood, todayStats, memoryStats, learningRate, recentTasks, reflection] =
    await Promise.allSettled([
      getCurrentMood(),
      getTodayStats(),
      getMemoryStats(),
      getLearningRate(),
      getRecentTasks(15),
      getTodayReflection(),
    ]);

  const unwrap = <T>(r: PromiseSettledResult<T>, fallback: T): T =>
    r.status === "fulfilled" ? r.value : fallback;

  return {
    mood: unwrap(mood, {
      label: "Focused",
      score: 75,
      description: "Processing.",
      activityScore: 5.0,
    }),
    todayStats: unwrap(todayStats, { completed: 0, failed: 0, running: 0, total: 0 }),
    memoryStats: unwrap(memoryStats, { totalSessions: 0, totalEntries: 0, recentActivity: 0 }),
    learningRate: unwrap(learningRate, 0),
    recentTasks: unwrap(recentTasks, []),
    todayReflection: unwrap(reflection, null)?.content ?? null,
  };
}

logger.info("MiaAgent: online");
