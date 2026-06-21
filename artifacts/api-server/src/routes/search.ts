import { Router, type IRouter } from "express";
import { SearchSubmitBody } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { searchSubmissionsTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.post("/search/submit", async (req, res) => {
  const parsed = SearchSubmitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid submission data", details: parsed.error.issues });
    return;
  }

  try {
    const [row] = await db
      .insert(searchSubmissionsTable)
      .values(parsed.data)
      .returning({ id: searchSubmissionsTable.id });

    req.log.info({ submissionId: row.id, email: parsed.data.email }, "Search submission saved");
    res.status(201).json({ success: true, submissionId: row.id });
  } catch (err) {
    req.log.error({ err }, "Failed to save search submission");
    res.status(500).json({ error: "Failed to save your submission. Please try again." });
  }
});

export default router;
