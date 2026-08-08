import { pgTable, serial, text, boolean, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const emailAlertsTable = pgTable("email_alerts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  state: text("state"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEmailAlertSchema = createInsertSchema(emailAlertsTable).omit({ id: true, createdAt: true });
export type InsertEmailAlert = z.infer<typeof insertEmailAlertSchema>;
export type EmailAlert = typeof emailAlertsTable.$inferSelect;

export const searchSubmissionsTable = pgTable("search_submissions", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  state: text("state"),
  birthYear: integer("birth_year"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSearchSubmissionSchema = createInsertSchema(searchSubmissionsTable).omit({ id: true, createdAt: true });
export type InsertSearchSubmission = z.infer<typeof insertSearchSubmissionSchema>;
export type SearchSubmission = typeof searchSubmissionsTable.$inferSelect;

export const financeEnquiriesTable = pgTable("finance_enquiries", {
  id: serial("id").primaryKey(),
  loanType: text("loan_type").notNull(),
  loanAmount: integer("loan_amount").notNull(),
  preferredTerm: integer("preferred_term").notNull(),
  estimatedMonthly: integer("estimated_monthly"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  postcode: text("postcode").notNull(),
  message: text("message"),
  referralCode: text("referral_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFinanceEnquirySchema = createInsertSchema(financeEnquiriesTable).omit({ id: true, createdAt: true });
export type InsertFinanceEnquiry = z.infer<typeof insertFinanceEnquirySchema>;
export type FinanceEnquiry = typeof financeEnquiriesTable.$inferSelect;

export const miaResearchRequestsTable = pgTable("mia_research_requests", {
  id: serial("id").primaryKey(),
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  email: text("email").notNull(),
  customerName: text("customer_name").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  dob: text("dob"),
  currentAddress: text("current_address"),
  previousAddresses: text("previous_addresses"),
  previousSurnames: text("previous_surnames"),
  reportSentAt: timestamp("report_sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMiaResearchRequestSchema = createInsertSchema(miaResearchRequestsTable).omit({ id: true, createdAt: true, reportSentAt: true });
export type InsertMiaResearchRequest = z.infer<typeof insertMiaResearchRequestSchema>;
export type MiaResearchRequest = typeof miaResearchRequestsTable.$inferSelect;

export const tiktokLeadsTable = pgTable("tiktok_leads", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: text("dob").notNull(),
  email: text("email"),
  source: text("source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTiktokLeadSchema = createInsertSchema(tiktokLeadsTable).omit({ id: true, createdAt: true });
export type InsertTiktokLead = z.infer<typeof insertTiktokLeadSchema>;
export type TiktokLead = typeof tiktokLeadsTable.$inferSelect;

export const miaFreeSearchesTable = pgTable("mia_free_searches", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: text("dob").notNull(),
  currentAddress: text("current_address").notNull(),
  previousAddresses: text("previous_addresses"),
  previousSurnames: text("previous_surnames"),
  status: text("status").notNull().default("searching"),
  totalAmountCents: integer("total_amount_cents"),
  teaserMatchesJson: text("teaser_matches_json"),
  stripeSessionId: text("stripe_session_id"),
  reportSentAt: timestamp("report_sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type MiaFreeSearch = typeof miaFreeSearchesTable.$inferSelect;

export const prospectsTable = pgTable("prospects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: text("amount").notNull(),
  holder: text("holder"),
  state: text("state"),
  source: text("source").notNull(),
  sourceKey: text("source_key").notNull(),
  letter: text("letter").notNull(),
  contactStatus: text("contact_status").notNull().default("pending"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  contactAddress: text("contact_address"),
  contactSource: text("contact_source"),
  contactSearchedAt: timestamp("contact_searched_at"),
  outreachSentAt: timestamp("outreach_sent_at"),
  stripeSessionId: text("stripe_session_id"),
  outreachSubject: text("outreach_subject"),
  outreachBodyText: text("outreach_body_text"),
  scrapedAt: timestamp("scraped_at").notNull().defaultNow(),
});

export type Prospect = typeof prospectsTable.$inferSelect;

export const unsubscribesTable = pgTable("unsubscribes", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  unsubscribedAt: timestamp("unsubscribed_at").notNull().defaultNow(),
  prospectId: integer("prospect_id"),
  reason: text("reason"),
});

export type Unsubscribe = typeof unsubscribesTable.$inferSelect;

export const paidSearchesTable = pgTable("paid_searches", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  state: text("state"),
  source: text("source"),
  stripeSessionId: text("stripe_session_id").unique(),
  status: text("status").notNull().default("pending"),
  resultsFound: integer("results_found"),
  searchedAt: timestamp("searched_at"),
  emailedAt: timestamp("emailed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PaidSearch = typeof paidSearchesTable.$inferSelect;

export const alphabetCrawlProgressTable = pgTable("alphabet_crawl_progress", {
  letter: text("letter").primaryKey(),
  status: text("status").notNull().default("pending"),
  prospectCount: integer("prospect_count").notNull().default(0),
  contactsFound: integer("contacts_found").notNull().default(0),
  outreachSent: integer("outreach_sent").notNull().default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export type AlphabetCrawlProgress = typeof alphabetCrawlProgressTable.$inferSelect;

export const pageViewsTable = pgTable("page_views", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const miaMemoriesTable = pgTable("mia_memories", {
  sessionId: text("session_id").primaryKey(),
  email: text("email"),
  memories: text("memories").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type MiaMemory = typeof miaMemoriesTable.$inferSelect;

export const autoSearchResultsTable = pgTable("auto_search_results", {
  id: serial("id").primaryKey(),
  sourceTable: text("source_table").notNull(),
  sourceId: integer("source_id").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  freeSearchId: integer("free_search_id"),
  status: text("status").notNull().default("searching"),
  totalAmountCents: integer("total_amount_cents"),
  searchedAt: timestamp("searched_at").notNull().defaultNow(),
});

export type AutoSearchResult = typeof autoSearchResultsTable.$inferSelect;

export const miaTaskLogTable = pgTable("mia_task_log", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  status: text("status").notNull().default("running"),
  input: text("input"),
  output: text("output"),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type MiaTaskLogEntry = typeof miaTaskLogTable.$inferSelect;

export const miaReflectionsTable = pgTable("mia_reflections", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(),
  content: text("content").notNull(),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  moodLabel: text("mood_label"),
  activityScore: integer("activity_score").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type MiaReflection = typeof miaReflectionsTable.$inferSelect;

export const miaGoalsTable = pgTable("mia_goals", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  goal: text("goal").notNull(),
  priority: integer("priority").notNull().default(3),
  status: text("status").notNull().default("pending"),
  reasoning: text("reasoning"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type MiaGoal = typeof miaGoalsTable.$inferSelect;

export const companionSubscribersTable = pgTable("companion_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  tier: text("tier").notNull().default("spark"),
  active: boolean("active").notNull().default(true),
  voiceMessagesThisMonth: integer("voice_messages_this_month").notNull().default(0),
  voiceMonthResetAt: timestamp("voice_month_reset_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CompanionSubscriber = typeof companionSubscribersTable.$inferSelect;

export const companionSessionsTable = pgTable("companion_sessions", {
  sessionId: text("session_id").primaryKey(),
  persona: text("persona").notNull().default("mia"),
  messageCount: integer("message_count").notNull().default(0),
  summary: text("summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CompanionSession = typeof companionSessionsTable.$inferSelect;

export const miaConfigTable = pgTable("mia_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type MiaConfig = typeof miaConfigTable.$inferSelect;

export const miaDevTasksTable = pgTable("mia_dev_tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("normal"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type MiaDevTask = typeof miaDevTasksTable.$inferSelect;

export const companionOutfitsTable = pgTable("companion_outfits", {
  sessionId: text("session_id").notNull(),
  outfitId: text("outfit_id").notNull(),
  portraitBase64: text("portrait_base64").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.sessionId, table.outfitId] }),
}));

export type CompanionOutfit = typeof companionOutfitsTable.$inferSelect;

export const companionFactsTable = pgTable("companion_facts", {
  sessionId: text("session_id").notNull(),
  factKey: text("fact_key").notNull(),
  factValue: text("fact_value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.sessionId, table.factKey] }),
}));

export type CompanionFact = typeof companionFactsTable.$inferSelect;

// ── Referral program ─────────────────────────────────────────────────────
// Tracks referral rewards end-to-end. A referrer's code gets attached to a
// finance_enquiries row via referralCode above; this table is the reward
// record itself, moved through manually since loan approval/amount is
// confirmed directly with Stratton, not detected automatically.
export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referralCode: text("referral_code").notNull(),
  referrerName: text("referrer_name"),
  referrerEmail: text("referrer_email"),
  referrerPhone: text("referrer_phone"),
  financeEnquiryId: integer("finance_enquiry_id"),
  status: text("status").notNull().default("pending"),
  // "pending" | "approved" | "rewarded" | "declined"
  loanApprovedAmountCents: integer("loan_approved_amount_cents"),
  rewardEligible: boolean("reward_eligible").notNull().default(false),
  rewardAmountCents: integer("reward_amount_cents"),
  rewardMethod: text("reward_method"),
  // "cash" | "visa_card"
  rewardPaidAt: timestamp("reward_paid_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertReferralSchema = createInsertSchema(referralsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referralsTable.$inferSelect;

import { Router, type IRouter } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const FROM_ADDRESS =
  process.env.MISSINGCASH_DOMAIN_VERIFIED === "true"
    ? "MissingCash <leads@missingcash.com.au>"
    : "MissingCash <leads@lensflow.com.au>";

const SITE_BASE = "https://missingcash.com.au";
const JWT_SECRET = process.env.JWT_SECRET ?? "";
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function makeReferralCode(firstName: string, lastName: string): string {
  const raw = `${firstName}${lastName}${Date.now()}`.toUpperCase();
  return raw.replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

// POST /api/auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  const email = typeof body["email"] === "string" ? body["email"].trim().toLowerCase().slice(0, 200) : "";
  const password = typeof body["password"] === "string" ? body["password"] : "";
  const firstName = typeof body["firstName"] === "string" ? body["firstName"].trim().slice(0, 60) : "";
  const lastName = typeof body["lastName"] === "string" ? body["lastName"].trim().slice(0, 60) : "";
  const mobile = typeof body["mobile"] === "string" ? body["mobile"].trim().slice(0, 30) : "";
  const address = typeof body["address"] === "string" ? body["address"].trim().slice(0, 300) : undefined;
  const dob = typeof body["dob"] === "string" ? body["dob"].trim().slice(0, 20) : undefined;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "A valid email is required" });
    return;
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  if (!firstName || !lastName || !mobile) {
    res.status(400).json({ error: "First name, last name, and mobile are required" });
    return;
  }

  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "An account with that email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = makeReferralCode(firstName, lastName);

    const [user] = await db
      .insert(usersTable)
      .values({
        email,
        passwordHash,
        firstName,
        lastName,
        mobile,
        address: address ?? null,
        dob: dob ?? null,
        referralCode,
      })
      .returning({ id: usersTable.id, email: usersTable.email, referralCode: usersTable.referralCode });

    if (!user) {
      res.status(500).json({ error: "Failed to create account" });
      return;
    }

    if (!JWT_SECRET) {
      res.status(500).json({ error: "Auth not configured" });
      return;
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({ token, referralCode: user.referralCode });
  } catch (err) {
    req.log.error({ err }, "auth: register failed");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  const email = typeof body["email"] === "string" ? body["email"].trim().toLowerCase().slice(0, 200) : "";
  const password = typeof body["password"] === "string" ? body["password"] : "";

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  if (!JWT_SECRET) {
    res.status(500).json({ error: "Auth not configured" });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Incorrect email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Incorrect email or password" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        referralCode: user.referralCode,
      },
    });
  } catch (err) {
    req.log.error({ err }, "auth: login failed");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// POST /api/auth/forgot-password
router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  const email = typeof body["email"] === "string" ? body["email"].trim().toLowerCase().slice(0, 200) : "";

  // Always respond the same way whether the account exists or not —
  // don't reveal which emails are registered.
  const genericResponse = { message: "If that email is registered, a reset link has been sent." };

  if (!email) {
    res.json(genericResponse);
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.json(genericResponse);
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await db
      .update(usersTable)
      .set({ resetToken, resetTokenExpiresAt })
      .where(eq(usersTable.id, user.id));

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      const resetUrl = `${SITE_BASE}/reset-password?token=${resetToken}`;
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: "Reset your MissingCash password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            <p>Hi ${user.firstName},</p>
            <p>Click below to reset your password. This link expires in 1 hour.</p>
            <p style="margin:24px 0;">
              <a href="${resetUrl}" style="background:#f5b942;color:#061826;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
            </p>
            <p style="color:#9ca3af;font-size:13px;">If you didn't request this, you can ignore this email.</p>
          </div>`,
      });
    }

    res.json(genericResponse);
  } catch (err) {
    req.log.error({ err }, "auth: forgot-password failed");
    res.json(genericResponse); // still don't leak errors either way
  }
});

// POST /api/auth/reset-password
router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const body = req.body as Record<string, unknown>;
  const token = typeof body["token"] === "string" ? body["token"] : "";
  const newPassword = typeof body["newPassword"] === "string" ? body["newPassword"] : "";

  if (!token || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "A valid token and a password of at least 8 characters are required" });
    return;
  }

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.resetToken, token)).limit(1);

    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      res.status(400).json({ error: "This reset link is invalid or has expired" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db
      .update(usersTable)
      .set({ passwordHash, resetToken: null, resetTokenExpiresAt: null })
      .where(eq(usersTable.id, user.id));

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    req.log.error({ err }, "auth: reset-password failed");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
