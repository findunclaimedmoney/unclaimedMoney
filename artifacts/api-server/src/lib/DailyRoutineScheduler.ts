import { logger } from "./logger";
import { startTask, completeTask, failTask } from "./MiaTaskLog";

let schedulerStarted = false;

function nextRunMs(targetHour: number, targetMinute = 0): number {
  const now = new Date();
  const next = new Date();
  next.setHours(targetHour, targetMinute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

async function runMorningReflection(): Promise<void> {
  const started = new Date();
  const id = await startTask("reflection", "daily morning reflection");
  try {
    const { generateDailyReflection } = await import("./MiaReflectionEngine");
    const content = await generateDailyReflection();
    await completeTask(id, content.slice(0, 200) + "…", started);
    logger.info("DailyScheduler: morning reflection complete");
  } catch (err) {
    await failTask(id, String(err), started);
    logger.error({ err }, "DailyScheduler: morning reflection failed");
  }
}

async function runPipelineCheck(): Promise<void> {
  const started = new Date();
  const id = await startTask("pipeline_check", "daily pipeline health check");
  try {
    const { db } = await import("@workspace/db");
    const { prospectsTable } = await import("@workspace/db/schema");
    const { count, eq } = await import("drizzle-orm");

    const [total] = await db.select({ n: count() }).from(prospectsTable);
    const [found] = await db
      .select({ n: count() })
      .from(prospectsTable)
      .where(eq(prospectsTable.contactStatus, "found"));

    const summary = `Pipeline: ${total?.n ?? 0} total prospects, ${found?.n ?? 0} contacts found.`;
    await completeTask(id, summary, started);
    logger.info({ summary }, "DailyScheduler: pipeline check complete");
  } catch (err) {
    await failTask(id, String(err), started);
    logger.error({ err }, "DailyScheduler: pipeline check failed");
  }
}

function schedule(label: string, fn: () => Promise<void>, hourAWST: number, minute = 0): void {
  const run = async () => {
    logger.info(`DailyScheduler: running ${label}`);
    await fn();
    setTimeout(run, 24 * 60 * 60 * 1000);
  };

  const delayMs = nextRunMs(hourAWST, minute);
  logger.info(`DailyScheduler: ${label} scheduled in ${Math.round(delayMs / 60000)} min`);
  setTimeout(run, delayMs);
}

export function startDailyScheduler(): void {
  if (schedulerStarted) return;
  schedulerStarted = true;

  logger.info("DailyScheduler: starting Mia's daily routine");

  schedule("morning reflection", runMorningReflection, 6, 30);
  schedule("pipeline health check", runPipelineCheck, 9, 0);
  schedule("midday pipeline check", runPipelineCheck, 13, 0);
}
