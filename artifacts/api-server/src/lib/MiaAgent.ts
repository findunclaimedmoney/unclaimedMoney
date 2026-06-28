import { getTodayStats, getRecentTasks } from "./MiaTaskLog";
import { getMemoryStats, getLearningRate } from "./MiaMemoryService";
import { getEmotionalState } from "./MiaEmotionalField";
import { getTodayReflection } from "./MiaReflectionEngine";
import { getTodayGoals } from "./MiaGoalEngine";
import { getLifecycleState } from "./DailyRoutineScheduler";
import { logger } from "./logger";

export interface MiaStatus {
  lifecycle: {
    phase: string;
    phaseStartedAt: Date;
    todayGoalsSet: boolean;
  };
  emotional: {
    vector: {
      valence: number;
      arousal: number;
      curiosity: number;
      focus: number;
      confidence: number;
      concern: number;
    };
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
  todayGoals: Array<{
    id: number;
    goal: string;
    priority: number;
    status: string;
    reasoning: string | null;
  }>;
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

function unwrap<T>(r: PromiseSettledResult<T>, fallback: T): T {
  return r.status === "fulfilled" ? r.value : fallback;
}

export async function getMiaStatus(): Promise<MiaStatus> {
  const lifecycle = getLifecycleState();

  const [emotional, todayStats, memoryStats, learningRate, todayGoals, recentTasks, reflection] =
    await Promise.allSettled([
      getEmotionalState(),
      getTodayStats(),
      getMemoryStats(),
      getLearningRate(),
      getTodayGoals(),
      getRecentTasks(15),
      getTodayReflection(),
    ]);

  return {
    lifecycle: {
      phase: lifecycle.phase,
      phaseStartedAt: lifecycle.phaseStartedAt,
      todayGoalsSet: lifecycle.todayGoalsSet,
    },
    emotional: unwrap(emotional, {
      vector: { valence: 0, arousal: 0.5, curiosity: 0.5, focus: 0.6, confidence: 0.6, concern: 0.1 },
      label: "Focused",
      score: 75,
      description: "Processing.",
      activityScore: 5.0,
    }),
    todayStats:    unwrap(todayStats,    { completed: 0, failed: 0, running: 0, total: 0 }),
    memoryStats:   unwrap(memoryStats,   { totalSessions: 0, totalEntries: 0, recentActivity: 0 }),
    learningRate:  unwrap(learningRate,  0),
    todayGoals:    unwrap(todayGoals,    []),
    recentTasks:   unwrap(recentTasks,   []),
    todayReflection: unwrap(reflection, null)?.content ?? null,
  };
}

logger.info("MiaAgent: online");
