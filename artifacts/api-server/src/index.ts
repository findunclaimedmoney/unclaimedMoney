import app from "./app";
import { logger } from "./lib/logger";
import { startAutoSearch } from "./lib/auto-search";
import { startAlphabetPipeline } from "./lib/alphabet-scraper";
import { startDailyScheduler } from "./lib/DailyRoutineScheduler";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  startAutoSearch();
  startDailyScheduler();
  if (process.env.ALPHABET_PIPELINE_ENABLED === "true") {
    void startAlphabetPipeline();
  }
});
