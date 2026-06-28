import { logger } from "./logger";
import { startTask, completeTask, failTask } from "./MiaTaskLog";

export type LifecyclePhase =
  | "sleeping"
  | "waking"
  | "reviewing"
  | "goal-setting"
  | "active"
  | "logging"
  | "maintenance";

interface LifecycleState {
  phase: LifecyclePhase;
  phaseStartedAt: Date;
  todayGoalsSet: boolean;
  overnightReviewed: boolean;
  dayLoggedAt: Date | null;
}

function phaseFromHour(h: number, m: number): LifecyclePhase {
  if (h < 6) return "sleeping";
  if (h === 6 && m < 5) return "waking";
  if (h === 6 && m < 30) return "reviewing";
  if (h === 6) return "goal-setting";
  if (h >= 7 && h < 23) return "active";
  if (h === 23) return "logging";
  return "maintenance";
}

const now = new Date();
const state: LifecycleState = {
  phase: phaseFromHour(now.getHours(), now.getMinutes()),
  phaseStartedAt: now,
  todayGoalsSet: false,
  overnightReviewed: false,
  dayLoggedAt: null,
};

export function getLifecycleState(): Readonly<LifecycleState> {
  return state;
}

function setPhase(phase: LifecyclePhase): void {
  if (state.phase === phase) return;
  logger.info({ phase, from: state.phase }, "DailyScheduler: phase →");
  state.phase = phase;
  state.phaseStartedAt = new Date();
}

function nextRunMs(h: number, m = 0): number {
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next <= new Date()) next.setDate(next.getDate() + 1);
  return next.getTime() - Date.now();
}

function daily(fn: () => Promise<void>, h: number, m = 0): void {
  const run = async () => { await fn(); setTimeout(run, 24 * 60 * 60 * 1000); };
  setTimeout(run, nextRunMs(h, m));
  logger.info(`DailyScheduler: ${fn.name || "task"} at ${h}:${String(m).padStart(2, "0")} in ${Math.round(nextRunMs(h, m) / 60000)} min`);
}

// ── 6:00 AM ── wake up
async function wakeUp(): Promise<void> {
  setPhase("waking");
  logger.info("DailyScheduler: 🌅 Mia waking up");
  const started = new Date();
  const id = await startTask("report", "system wake-up — starting daily lifecycle");
  state.overnightReviewed = false;
  state.todayGoalsSet = false;
  state.dayLoggedAt = null;
  await completeTask(id, "Woke up. Starting overnight review.", started);
}

// ── 6:05 AM ── review overnight
async function reviewOvernight(): Promise<void> {
  setPhase("reviewing");
  const started = new Date();
  const id = await startTask("pipeline_check", "overnight review");
  try {
    const { getTodayStats, getRecentTasks } = await import("./MiaTaskLog");
    const [stats, recent] = await Promise.all([getTodayStats(), getRecentTasks(10)]);
    const summary = `Overnight: ${stats.total} total tasks, ${stats.failed} failed. ${recent.length} entries reviewed.`;
    await completeTask(id, summary, started);
    state.overnightReviewed = true;
    logger.info({ summary }, "DailyScheduler: overnight review done");
  } catch (err) {
    await failTask(id, String(err), started);
    logger.error({ err }, "DailyScheduler: overnight review failed");
  }
}

// ── 6:30 AM ── autonomous goal setting
async function setGoals(): Promise<void> {
  if (state.todayGoalsSet) return;
  setPhase("goal-setting");
  const started = new Date();
  const id = await startTask("reflection", "autonomous goal setting");
  try {
    const { setDailyGoals } = await import("./MiaGoalEngine");
    const goals = await setDailyGoals();
    const summary = `Set ${goals.length} goals: ${goals.map((g) => g.goal).slice(0, 2).join("; ")}…`;
    await completeTask(id, summary, started);
    state.todayGoalsSet = true;
    setPhase("active");
    logger.info({ count: goals.length }, "DailyScheduler: goals set");
  } catch (err) {
    await failTask(id, String(err), started);
    setPhase("active");
    logger.error({ err }, "DailyScheduler: goal setting failed");
  }
}

// ── 9:00 AM + 1:00 PM ── pipeline health check
async function pipelineCheck(): Promise<void> {
  const started = new Date();
  const id = await startTask("pipeline_check", "scheduled pipeline health check");
  try {
    const { db } = await import("@workspace/db");
    const { prospectsTable } = await import("@workspace/db/schema");
    const { count, eq } = await import("drizzle-orm");
    const [[total], [found]] = await Promise.all([
      db.select({ n: count() }).from(prospectsTable),
      db.select({ n: count() }).from(prospectsTable).where(eq(prospectsTable.contactStatus, "found")),
    ]);
    const summary = `Pipeline: ${total?.n ?? 0} prospects, ${found?.n ?? 0} contacts found.`;
    await completeTask(id, summary, started);
    logger.info({ summary }, "DailyScheduler: pipeline check done");
  } catch (err) {
    await failTask(id, String(err), started);
    logger.error({ err }, "DailyScheduler: pipeline check failed");
  }
}

// ── 11:00 PM ── end of day
async function endOfDay(): Promise<void> {
  if (state.dayLoggedAt) return;
  setPhase("logging");
  const started = new Date();
  const id = await startTask("reflection", "end-of-day logging");
  try {
    const { generateDailyReflection } = await import("./MiaReflectionEngine");
    const content = await generateDailyReflection();
    state.dayLoggedAt = new Date();
    await completeTask(id, `Day logged. ${content.slice(0, 100)}…`, started);
    logger.info("DailyScheduler: 🌙 day logged");
  } catch (err) {
    await failTask(id, String(err), started);
    logger.error({ err }, "DailyScheduler: end-of-day failed");
  }

  // Send Zac the daily list of high-value prospects Mia couldn't find
  try {
    const { sendUnfoundHVReport } = await import("./alphabet-scraper");
    const { sent, count } = await sendUnfoundHVReport();
    if (sent) logger.info({ count }, "DailyScheduler: unfound HV report sent to Zac");
    else logger.info({ count }, "DailyScheduler: unfound HV report — nothing to send");
  } catch (err) {
    logger.error({ err }, "DailyScheduler: unfound HV report failed");
  }
}

// ── 12:00 AM ── maintenance
async function enterMaintenance(): Promise<void> {
  setPhase("maintenance");
  state.overnightReviewed = false;
  state.todayGoalsSet = false;
  logger.info("DailyScheduler: 💤 maintenance mode");
}

let started = false;

export function startDailyScheduler(): void {
  if (started) return;
  started = true;
  logger.info({ phase: state.phase }, "DailyScheduler: Mia lifecycle starting");

  daily(wakeUp,            6,  0);
  daily(reviewOvernight,   6,  5);
  daily(setGoals,          6, 30);
  daily(pipelineCheck,     9,  0);
  daily(pipelineCheck,    13,  0);
  daily(endOfDay,         23,  0);
  daily(enterMaintenance,  0,  0);

  // If starting during active hours and goals not yet set, do it now
  const h = new Date().getHours();
  if (h >= 6 && h < 23 && !state.todayGoalsSet) {
    setTimeout(() => void setGoals(), 5_000);
  }
}
