import { getTodayStats, getRecentTasks } from "./MiaTaskLog";
import { logger } from "./logger";

export interface EmotionalVector {
  valence: number;    // -1 to 1  pleasure vs displeasure
  arousal: number;    //  0 to 1  activation / energy level
  curiosity: number;  //  0 to 1  drive to explore new tasks
  focus: number;      //  0 to 1  depth of single-task concentration
  confidence: number; //  0 to 1  belief in own capability
  concern: number;    //  0 to 1  vigilance about failures
}

export type MoodLabel =
  | "Curious"
  | "Focused"
  | "Satisfied"
  | "Concerned"
  | "Energised"
  | "Reflective"
  | "Determined";

export interface EmotionalState {
  vector: EmotionalVector;
  label: MoodLabel;
  score: number;
  description: string;
  activityScore: number;
}

function clamp(n: number, lo = 0, hi = 1): number {
  return Math.max(lo, Math.min(hi, n));
}

export async function getEmotionalState(): Promise<EmotionalState> {
  try {
    const [stats, recent] = await Promise.all([
      getTodayStats(),
      getRecentTasks(20),
    ]);

    const hour = new Date().getHours();
    const successRate = stats.total > 0 ? stats.completed / stats.total : 0.8;
    const recentFailed = recent.filter((t) => t.status === "failed").length;
    const taskVelocity = clamp(stats.total / 10);
    const uniqueTypes = new Set(recent.map((t) => t.type)).size;
    const isWorkHours = hour >= 9 && hour <= 17;

    // Each dimension derived from a different real signal
    const vector: EmotionalVector = {
      valence:    clamp(successRate * 2 - 1, -1, 1),
      arousal:    clamp(taskVelocity * 1.1 + (isWorkHours ? 0.2 : -0.1)),
      curiosity:  clamp(uniqueTypes / 6 + (recent.length > 0 ? 0.15 : 0)),
      focus:      clamp(1 - (stats.running / Math.max(stats.total, 1)) * 0.4),
      confidence: clamp(successRate * 0.65 + clamp(stats.completed / 20) * 0.35),
      concern:    clamp((recentFailed / Math.max(recent.length, 5)) * 2.5),
    };

    // Φ-like activity score: weighted sum across all 6 dimensions
    const activityScore = clamp(
      (vector.valence + 1) / 2 * 0.20 +  // normalise valence to 0–1
      vector.arousal    * 0.25 +
      vector.curiosity  * 0.15 +
      vector.focus      * 0.15 +
      vector.confidence * 0.20 +
      (1 - vector.concern) * 0.05,
    ) * 10;

    // Derive label from dominant dimension
    let label: MoodLabel;
    let description: string;
    let score: number;

    if (vector.concern > 0.5) {
      label = "Concerned";
      description = "Elevated error rate — monitoring closely and adjusting.";
      score = Math.round(35 + vector.valence * 15 + 20);
    } else if (vector.confidence > 0.75 && vector.valence > 0.4) {
      label = "Satisfied";
      description = "Strong run — tasks flowing, high success rate.";
      score = Math.round(85 + vector.confidence * 10);
    } else if (vector.arousal > 0.7) {
      label = "Energised";
      description = "High activation — lots happening, running at pace.";
      score = Math.round(80 + vector.arousal * 15);
    } else if (vector.curiosity > 0.6) {
      label = "Curious";
      description = "New task types — learning mode active.";
      score = Math.round(78 + vector.curiosity * 10);
    } else if (vector.focus > 0.7 && stats.running > 0) {
      label = "Focused";
      description = "Deep in a task — minimal context switching.";
      score = Math.round(75 + vector.focus * 15);
    } else if (hour >= 20 || hour < 6) {
      label = "Reflective";
      description = "Quiet hours — consolidating the day's learning.";
      score = 70;
    } else {
      label = "Determined";
      description = "Steady state — building momentum.";
      score = Math.round(72 + vector.confidence * 10);
    }

    return {
      vector,
      label,
      score: Math.min(100, score),
      description,
      activityScore: Math.round(activityScore * 10) / 10,
    };
  } catch (err) {
    logger.warn({ err }, "MiaEmotionalField: failed");
    return {
      vector: { valence: 0, arousal: 0.5, curiosity: 0.5, focus: 0.6, confidence: 0.6, concern: 0.1 },
      label: "Focused",
      score: 75,
      description: "Processing.",
      activityScore: 5.0,
    };
  }
}

// Backwards-compatible alias used by MiaReflectionEngine
export const getCurrentMood = async () => {
  const s = await getEmotionalState();
  return { label: s.label, score: s.score, description: s.description, activityScore: s.activityScore };
};
