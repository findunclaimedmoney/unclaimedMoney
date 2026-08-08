import { Router, type IRouter } from "express";
import { db, referralsTable } from "@workspace/db";

const router: IRouter = Router();

// POST /api/referrals/register
router.post("/referrals/register", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  const referralCode = typeof body["referralCode"] === "string" ? body["referralCode"].trim().slice(0, 20) : "";
  const referrerName = typeof body["referrerName"] === "string" ? body["referrerName"].trim().slice(0, 120) : undefined;
  const referrerEmail = typeof body["referrerEmail"] === "string" ? body["referrerEmail"].trim().slice(0, 200) : undefined;
  const referrerPhone = typeof body["referrerPhone"] === "string" ? body["referrerPhone"].trim().slice(0, 30) : undefined;

  if (!referralCode) {
    res.status(400).json({ error: "referralCode is required" });
    return;
  }

  try {
    await db.insert(referralsTable).values({
      referralCode,
      referrerName: referrerName ?? null,
      referrerEmail: referrerEmail ?? null,
      referrerPhone: referrerPhone ?? null,
      status: "pending",
      rewardEligible: false,
    });

    res.json({ referralCode });
  } catch (err) {
    req.log.error({ err }, "referrals: failed to register referral");
    res.status(500).json({ error: "Could not create referral link. Please try again." });
  }
});

export default router;
