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
