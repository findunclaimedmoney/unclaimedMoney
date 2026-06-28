import { getTodayStats, getRecentTasks } from "./MiaTaskLog";
import { logger } from "./logger";

export type MoodLabel =
  | "Curious"
  | "Focused"
  | "Satisfied"
  | "Concerned"
  | "Energised"
  | "Reflective"
  | "Determined";

export interface EmotionalState {
  label: MoodLabel;
  score: number;
  description: string;
  activityScore: number;
}

export async function getCurrentMood(): Promise<EmotionalState> {
  try {
    const [stats, recent] = await Promise.all([
      getTodayStats(),
      getRecentTasks(10),
    ]);

    const hour = new Date().getHours();
    const successRate = stats.total > 0 ? stats.completed / stats.total : 0.8;
    const recentFailed = recent.filter((t) => t.status === "failed").length;

    const baseActivity = Math.min(stats.completed * 0.7, 7);
    const timeBonus = hour >= 9 && hour <= 17 ? 1.5 : 0.5;
    const successBonus = successRate * 1.5;
    const activityScore = Math.min(10, baseActivity + timeBonus + successBonus);

    let label: MoodLabel;
    let description: string;
    let score: number;

    if (recentFailed >= 3) {
      label = "Concerned";
      description = "Several recent tasks hit errors — working through them.";
      score = 45;
    } else if (stats.completed >= 10 && successRate >= 0.85) {
      label = "Satisfied";
      description = "Strong run today — high completion rate, everything flowing.";
      score = 92;
    } else if (hour >= 6 && hour < 10) {
      label = "Energised";
      description = "Fresh start — systems running, ready for the day.";
      score = 85;
    } else if (hour >= 20 || hour < 6) {
      label = "Reflective";
      description = "Quieter hours — a good time to review and consolidate.";
      score = 72;
    } else if (stats.running > 0) {
      label = "Focused";
      description = "Tasks in progress — staying on it.";
      score = 78;
    } else if (stats.completed >= 3) {
      label = "Curious";
      description = "Good momentum — open to whatever comes next.";
      score = 82;
    } else {
      label = "Determined";
      description = "Getting started — building momentum.";
      score = 70;
    }

    return {
      label,
      score,
      description,
      activityScore: Math.round(activityScore * 10) / 10,
    };
  } catch (err) {
    logger.warn({ err }, "MiaEmotionalField: failed");
    return { label: "Focused", score: 75, description: "Processing.", activityScore: 5.0 };
  }
}
