import { Router, type IRouter } from "express";
import { AlertsSubscribeBody } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { emailAlertsTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.post("/alerts/subscribe", async (req, res) => {
  const parsed = AlertsSubscribeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
    return;
  }

  try {
    await db
      .insert(emailAlertsTable)
      .values(parsed.data)
      .onConflictDoUpdate({
        target: emailAlertsTable.email,
        set: { active: true, firstName: parsed.data.firstName, state: parsed.data.state },
      });

    req.log.info({ email: parsed.data.email }, "Email alert subscription saved");
    res.status(201).json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to save email alert subscription");
    res.status(500).json({ error: "Failed to subscribe. Please try again." });
  }
});

export default router;
