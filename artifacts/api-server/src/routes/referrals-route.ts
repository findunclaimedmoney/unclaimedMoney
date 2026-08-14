import { Router, type IRouter } from "express";
import { db, usersTable, referralsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router: IRouter = Router();
const SITE_BASE = "https://missingcash.com.au";

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

// GET /api/referrals/my-referrals — requires a valid login session
router.get("/referrals/my-referrals", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const myReferrals = await db
      .select()
      .from(referralsTable)
      .where(eq(referralsTable.referralCode, user.referralCode));

    const summary = myReferrals.reduce(
      (acc, ref) => {
        acc.total += 1;
        if (ref.status === "pending") acc.pending += 1;
        if (ref.status === "approved") acc.approved += 1;
        if (ref.status === "rewarded") {
          acc.rewarded += 1;
          acc.totalEarnedCents += ref.rewardAmountCents ?? 0;
        }
        if (ref.status === "declined") acc.declined += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rewarded: 0, declined: 0, totalEarnedCents: 0 },
    );

    res.json({
      referralCode: user.referralCode,
      referralLink: `${SITE_BASE}/?ref=${user.referralCode}`,
      summary,
      referrals: myReferrals.map((r) => ({
        id: r.id,
        status: r.status,
        loanApprovedAmountCents: r.loanApprovedAmountCents,
        rewardAmountCents: r.rewardAmountCents,
        rewardMethod: r.rewardMethod,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "referrals: failed to load my-referrals");
    res.status(500).json({ error: "Could not load your referrals. Please try again." });
  }
});

export default router;
