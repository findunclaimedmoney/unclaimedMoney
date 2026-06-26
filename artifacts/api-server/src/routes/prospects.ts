import { Router } from "express";
import { db } from "@workspace/db";
import { prospectsTable } from "@workspace/db/schema";
import { eq, like, sql, desc } from "drizzle-orm";
import { crawlLetter, getProspectStats, isLetterInProgress, startAlphabetPipeline } from "../lib/alphabet-scraper";
import { logger } from "../lib/logger";

const router = Router();

function checkAuth(req: Parameters<Parameters<typeof router.get>[1]>[0]): boolean {
  const password = process.env["ADMIN_PASSWORD"] ?? "missingcash2024";
  const auth = req.headers["x-admin-password"] ?? req.query["p"];
  return auth === password;
}

// POST /api/admin/prospect-crawl — trigger a letter crawl (runs async)
router.post("/admin/prospect-crawl", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { letter } = req.body as { letter?: string };
  if (!letter || letter.length !== 1 || !/[a-zA-Z]/.test(letter)) {
    res.status(400).json({ error: "letter must be a single A-Z character" }); return;
  }

  const upper = letter.toUpperCase();

  if (isLetterInProgress(upper)) {
    res.json({ status: "already_running", letter: upper }); return;
  }

  // Fire async — don't await so we return immediately
  crawlLetter(upper).then((result) => {
    logger.info({ letter: upper, ...result }, "prospect-crawl: completed");
  }).catch((err) => {
    logger.error({ err, letter: upper }, "prospect-crawl: failed");
  });

  res.json({ status: "started", letter: upper });
});

// GET /api/admin/prospects — list prospects with optional letter filter
router.get("/admin/prospects", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const { letter, page: pageStr, search } = req.query as { letter?: string; page?: string; search?: string };
    const pageSize = 50;
    const page = Math.max(1, parseInt(pageStr ?? "1", 10));
    const offset = (page - 1) * pageSize;

    let query = db.select().from(prospectsTable);

    if (letter) {
      query = query.where(eq(prospectsTable.letter, letter.toUpperCase())) as typeof query;
    } else if (search) {
      query = query.where(like(prospectsTable.name, `%${search}%`)) as typeof query;
    }

    const [rows, stats] = await Promise.all([
      query.orderBy(desc(prospectsTable.scrapedAt)).limit(pageSize).offset(offset),
      getProspectStats(),
    ]);

    res.json({ prospects: rows, stats, page, pageSize });
  } catch (err) {
    logger.error({ err }, "prospects: query failed");
    res.status(500).json({ error: "query failed" });
  }
});

// GET /api/admin/prospect-stats — just the stats
router.get("/admin/prospect-stats", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const stats = await getProspectStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "query failed" });
  }
});

// GET /api/admin/audit-export — dated CSV of every outreach sent (for compliance/audit)
router.get("/admin/audit-export", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const rows = await db
      .select()
      .from(prospectsTable)
      .where(sql`outreach_sent_at is not null`)
      .orderBy(prospectsTable.outreachSentAt);

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `missingcash-audit-${dateStr}.csv`;

    const header = [
      "id","name","amount","holder","state","source","letter",
      "contact_email","contact_phone","contact_address","contact_source","contact_searched_at",
      "outreach_sent_at","outreach_subject","stripe_session_id","outreach_body_text","scraped_at"
    ].join(",");

    function csvCell(v: unknown): string {
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    }

    const lines = rows.map((r) => [
      r.id, csvCell(r.name), csvCell(r.amount), csvCell(r.holder), csvCell(r.state),
      csvCell(r.source), csvCell(r.letter),
      csvCell(r.contactEmail), csvCell(r.contactPhone), csvCell(r.contactAddress), csvCell(r.contactSource),
      csvCell(r.contactSearchedAt?.toISOString()),
      csvCell(r.outreachSentAt?.toISOString()), csvCell(r.outreachSubject), csvCell(r.stripeSessionId),
      csvCell(r.outreachBodyText), csvCell(r.scrapedAt?.toISOString()),
    ].join(","));

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send([header, ...lines].join("\n"));
  } catch (err) {
    logger.error({ err }, "audit-export: failed");
    res.status(500).json({ error: "export failed" });
  }
});

// POST /api/admin/pipeline-start — start the full A-Z auto-pipeline
router.post("/admin/pipeline-start", async (req, res): Promise<void> => {
  if (!checkAuth(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  void startAlphabetPipeline();
  res.json({ status: "started" });
});

export default router;
