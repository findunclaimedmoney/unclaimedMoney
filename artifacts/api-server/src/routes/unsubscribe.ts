import { Router } from "express";
import { db } from "@workspace/db";
import { unsubscribesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

// GET /api/unsubscribe?e=<email>&pid=<prospectId>
// One-click unsubscribe — Spam Act 2003 compliant
router.get("/unsubscribe", async (req, res): Promise<void> => {
  const email = req.query["e"] as string | undefined;
  const prospectId = req.query["pid"] ? parseInt(req.query["pid"] as string, 10) : null;

  if (!email || !email.includes("@")) {
    res.status(400).send("Invalid unsubscribe link.");
    return;
  }

  try {
    await db
      .insert(unsubscribesTable)
      .values({ email: email.toLowerCase(), prospectId: prospectId ?? null, reason: "one-click" })
      .onConflictDoNothing();

    logger.info({ email, prospectId }, "unsubscribe: recorded");

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribed — MissingCash</title>
  <style>
    body { font-family: sans-serif; background: #061826; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .box { text-align: center; max-width: 420px; padding: 40px 32px; background: #0f2233; border: 1px solid #1a2a3a; border-radius: 16px; }
    h1 { color: #f5b942; font-size: 24px; margin: 0 0 12px; }
    p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 20px; }
    a { color: #f5b942; text-decoration: none; font-size: 14px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>✓ Unsubscribed</h1>
    <p>You've been removed from MissingCash outreach emails. We will not contact you again.</p>
    <p style="font-size:13px;color:#6b7a8d;">You can still search for unclaimed money yourself at any time — it's always free.</p>
    <a href="https://missingcash.com.au">← Back to MissingCash</a>
  </div>
</body>
</html>`);
  } catch (err) {
    logger.error({ err, email }, "unsubscribe: failed");
    res.status(500).send("Something went wrong. Please email support@missingcash.com.au to unsubscribe.");
  }
});

export default router;
