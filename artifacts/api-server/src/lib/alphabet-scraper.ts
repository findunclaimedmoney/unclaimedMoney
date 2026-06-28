import { db } from "@workspace/db";
import { prospectsTable, alphabetCrawlProgressTable, unsubscribesTable } from "@workspace/db/schema";
import { eq, and, sql, isNull } from "drizzle-orm";
import { Resend } from "resend";
import Stripe from "stripe";
import twilio from "twilio";
import { logger } from "./logger";
import { findContact, parseName } from "./contact-finder";
import { searchMoneySmartBySurname } from "./moneysmart-scraper";

const MAX_PAGES = 60;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Max prospects to contact-search per letter (credit guard)
const MAX_CONTACTS_PER_LETTER = parseInt(process.env.MAX_CONTACTS_PER_LETTER ?? "300", 10);

const FROM_ADDRESS =
  process.env.MISSINGCASH_DOMAIN_VERIFIED === "true"
    ? "MissingCash <leads@missingcash.com.au>"
    : "MissingCash <leads@lensflow.com.au>";

// ---------- WA Unclaimed Monies API ----------
// Source: https://search.unclaimedmonies.dtf.wa.gov.au/
// Public Elasticsearch endpoint — direct POST, no proxy, no auth needed.

const WA_API = "https://search.unclaimedmonies.dtf.wa.gov.au/search/_search";
const WA_PAGE_SIZE = 50;

interface RawMatch {
  name: string;
  amount: string;
  holder: string;
  state: string;
  description: string;
  holderEmail: string;
  holderPhone: string;
  holderContactName: string;
}

async function fetchWAPage(
  surname: string,
  from: number
): Promise<{ items: RawMatch[]; total: number } | null> {
  const body = JSON.stringify({
    from,
    size: WA_PAGE_SIZE,
    query: { bool: { must: [{ match: { payee_name: surname } }] } },
  });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(WA_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`WA API HTTP ${res.status}`);

      const data = await res.json() as {
        hits: {
          total: { value: number };
          hits: Array<{ _source: Record<string, string> }>;
        };
      };

      const total = data.hits?.total?.value ?? 0;
      const items: RawMatch[] = (data.hits?.hits ?? []).map(({ _source: s }) => ({
        name: (s.payee_name ?? "").trim(),
        amount: s.amount_unclaimed ? `$${parseFloat(s.amount_unclaimed).toFixed(2)}` : "",
        holder: (s["payer_/_source"] ?? "").trim(),
        state: (s.address_2 ?? "").trim(),
        description: (s.description ?? "").trim(),
        holderEmail: (s.holder_contact_email ?? "").trim(),
        holderPhone: (s.holder_contact_phone ?? "").trim(),
        holderContactName: (s.holder_contact_name ?? "").trim(),
      })).filter((m) => m.name.length > 0 && m.amount.length > 1);

      logger.info({ surname, from, total, fetched: items.length }, "alphabet-scraper: WA API page");
      return { items, total };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn({ surname, from, attempt, err: msg }, "alphabet-scraper: WA API fetch failed");
      if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  return null;
}

// ---------- top Australian surnames per letter ----------
// Searching by surname avoids MoneySmart's bot detection (single-letter searches get blocked)

const SURNAMES_BY_LETTER: Record<string, string[]> = {
  A: ["Anderson", "Adams", "Allen", "Armstrong", "Andrews", "Alexander", "Abbott", "Ahmed", "Ali", "Atkinson"],
  B: ["Brown", "Baker", "Bell", "Bennett", "Bailey", "Barnes", "Bishop", "Black", "Boyd", "Burns", "Butler"],
  C: ["Campbell", "Carter", "Clark", "Clarke", "Collins", "Cook", "Cooper", "Cox", "Crawford", "Curtis"],
  D: ["Davis", "Davies", "Dixon", "Duncan", "Davidson", "Dean", "Doyle", "Douglas", "Drew", "Dunn"],
  E: ["Evans", "Edwards", "Elliott", "Ellis", "Eriksson", "Egan", "Eaton", "Edmonds", "Emery", "English"],
  F: ["Fisher", "Foster", "Fox", "Fraser", "Freeman", "French", "Ferguson", "Field", "Fleming", "Flynn"],
  G: ["Gibson", "Graham", "Grant", "Gray", "Green", "Griffin", "George", "Gordon", "Gardner", "Gilbert"],
  H: ["Hall", "Harris", "Harrison", "Harvey", "Henderson", "Hill", "Holmes", "Howard", "Hughes", "Hunt"],
  I: ["Ingram", "Irving", "Ivanov", "Ibrahim", "Irwin", "Ingham", "Irvine", "Izard", "Imrie", "Inglis"],
  J: ["Jackson", "James", "Jenkins", "Johnson", "Jones", "Jordan", "Jensen", "Joyce", "Jeffrey", "Jacobs"],
  K: ["Kelly", "Kennedy", "King", "Knight", "Kumar", "Khan", "Kemp", "Kerr", "Kirk", "Klein"],
  L: ["Lane", "Lee", "Lewis", "Lloyd", "Long", "Lawson", "Lambert", "Lynch", "Lucas", "Lawrence"],
  M: ["Martin", "Mason", "Matthews", "McDonald", "Mitchell", "Moore", "Morgan", "Morris", "Morrison", "Murray"],
  N: ["Nelson", "Newman", "Newton", "Nguyen", "Nicholson", "Norman", "Nolan", "Neal", "Nash", "Norton"],
  O: ["Oliver", "Owen", "O'Brien", "O'Connor", "O'Neill", "O'Sullivan", "Olsen", "Osborne", "Owens", "Ortega"],
  P: ["Palmer", "Parker", "Patel", "Patterson", "Pearce", "Perry", "Peters", "Phillips", "Price", "Powell"],
  Q: ["Quinn", "Quigley", "Quinlan", "Quick", "Quint", "Quartermaine", "Quayle", "Quest", "Queale", "Quinton"],
  R: ["Reid", "Richards", "Richardson", "Roberts", "Robertson", "Robinson", "Rogers", "Ross", "Russell", "Ryan"],
  S: ["Scott", "Shaw", "Simpson", "Singh", "Smith", "Spencer", "Stevens", "Stewart", "Sullivan", "Sutton"],
  T: ["Taylor", "Thomas", "Thompson", "Thomson", "Turner", "Tucker", "Todd", "Tran", "Thornton", "Timms"],
  U: ["Underwood", "Unsworth", "Upton", "Urquhart", "Usher", "Urban", "Ulrich", "Upham", "Uttley", "Underhill"],
  V: ["Vincent", "Vance", "Vaughan", "Valentine", "Vargas", "Vasquez", "Victor", "Villa", "Vickers", "Vine"],
  W: ["Walker", "Wallace", "Walsh", "Ward", "Watson", "Webb", "White", "Williams", "Wilson", "Wood"],
  X: ["Xavier", "Xiao", "Xu", "Xenakis", "Xanthis", "Xenos", "Ximenes", "Xing", "Xiong", "Xue"],
  Y: ["Young", "Yates", "Yang", "York", "Yuen", "Yip", "Yeoman", "Yates", "Yarwood", "Yeung"],
  Z: ["Zhang", "Zhou", "Zimmermann", "Zito", "Zola", "Zorba", "Zander", "Zane", "Ziegler", "Zemansky"],
};

// ---------- crawl one letter (by surname list) ----------

async function crawlMoneySmartLetter(letter: string, _apiKey: string): Promise<{ matches: RawMatch[]; pages: number }> {
  const allMatches: RawMatch[] = [];
  let totalPages = 0;
  const surnames = SURNAMES_BY_LETTER[letter] ?? [letter];
  const seen = new Set<string>();

  const addMatch = (m: RawMatch) => {
    const key = `${m.name.toLowerCase()}|${m.amount}`;
    if (!seen.has(key)) {
      seen.add(key);
      allMatches.push(m);
    }
  };

  for (const surname of surnames) {
    // Source 1: WA DTF — free direct Elasticsearch API, no proxy needed
    logger.info({ letter, surname }, "alphabet-scraper: fetching WA DTF");
    let from = 0;
    let totalHits = -1;
    while (from / WA_PAGE_SIZE < MAX_PAGES) {
      const result = await fetchWAPage(surname, from);
      if (!result) break;
      if (from === 0) totalHits = result.total;
      totalPages++;
      for (const m of result.items) addMatch(m);
      if (result.items.length === 0) break;
      from += WA_PAGE_SIZE;
      if (totalHits >= 0 && from >= totalHits) break;
      await new Promise((r) => setTimeout(r, 300));
    }

    // Source 2: MoneySmart national register — broader coverage across all states
    logger.info({ letter, surname }, "alphabet-scraper: fetching MoneySmart national register");
    const msResults = await searchMoneySmartBySurname(surname);
    totalPages++;
    for (const m of msResults) {
      addMatch({
        name: m.name,
        amount: m.amount,
        holder: m.holder,
        state: m.state,
        description: "",
        holderEmail: "",
        holderPhone: "",
        holderContactName: "",
      });
    }

    await new Promise((r) => setTimeout(r, 800));
  }

  return { matches: allMatches, pages: totalPages };
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

async function insertProspects(letter: string, matches: RawMatch[]): Promise<number> {
  if (matches.length === 0) return 0;

  // Clear old records for this letter
  await db.delete(prospectsTable).where(
    and(eq(prospectsTable.letter, letter), eq(prospectsTable.sourceKey, "wa-dtf"))
  );

  const seen = new Set<string>();
  const MIN_AMOUNT_DOLLARS = 5000;

  const rows = matches
    .filter((m) => {
      const key = `${normalise(m.name)}|${m.amount}`;
      if (seen.has(key)) return false;
      seen.add(key);
      // Skip amounts below minimum threshold — not worth outreach cost
      const dollars = parseAmountDollars(m.amount);
      if (dollars < MIN_AMOUNT_DOLLARS) return false;
      return true;
    })
    .map((m) => ({
      name: m.name,
      amount: m.amount,
      holder: m.holder || null,
      state: m.state || null,
      source: "WA Unclaimed Monies",
      sourceKey: "wa-dtf",
      letter,
      contactStatus: "pending",
    }));

  for (let i = 0; i < rows.length; i += 100) {
    await db.insert(prospectsTable).values(rows.slice(i, i + 100));
  }

  return rows.length;
}

// ---------- contact search ----------

const SITE_BASE = process.env.REPLIT_DOMAINS
  ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
  : "https://missingcash.com.au";

function parseAmountDollars(amount: string): number {
  const m = amount.match(/\$?([\d,]+)/);
  if (!m) return 0;
  return parseFloat(m[1].replace(/,/g, "")) || 0;
}

function calcFee(dollars: number): { pct: number; cents: number; str: string } {
  const pct = dollars <= 1000 ? 5 : dollars <= 5000 ? 10 : dollars <= 30000 ? 15 : dollars <= 100000 ? 20 : 33;
  const cents = Math.max(Math.round(dollars * pct), 100);
  return { pct, cents, str: `$${(cents / 100).toLocaleString("en-AU", { maximumFractionDigits: 0 })}` };
}

async function sendOutreachEmail(
  email: string,
  name: string,
  amount: string,
  holder: string | null,
  prospectId: number,
): Promise<{ sent: boolean; stripeSessionId?: string; subject?: string; bodyText?: string }> {
  const resendKey = process.env.RESEND_API_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!resendKey || !stripeKey) return { sent: false };

  // Spam Act 2003 — check unsubscribe list before sending
  const unsub = await db.select().from(unsubscribesTable).where(eq(unsubscribesTable.email, email.toLowerCase())).limit(1);
  if (unsub.length > 0) {
    logger.info({ email, prospectId }, "alphabet-scraper: skipping — email is unsubscribed");
    return { sent: false };
  }

  const parsed = parseName(name);
  const firstName = parsed?.firstName ?? name.split(" ")[0] ?? name;
  const dollars = parseAmountDollars(amount);
  const { pct, cents, str: feeStr } = calcFee(dollars);
  const holderName = holder || "an Australian government register";

  // Create Stripe checkout — fee paid BEFORE claim details are revealed
  let checkoutUrl: string;
  let stripeSessionId: string;
  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "aud",
          unit_amount: cents,
          product_data: {
            name: `MissingCash Claim Report — ${pct}% success fee`,
            description: `Mia found ${amount} held by ${holderName}. Pay ${feeStr} to unlock your personalised step-by-step claim instructions.`,
          },
        },
        quantity: 1,
      }],
      metadata: { product: "prospect-outreach", prospectId: String(prospectId) },
      success_url: `${SITE_BASE}/mia-search/paid?prospect=${prospectId}`,
      cancel_url: `${SITE_BASE}/`,
    });
    checkoutUrl = session.url!;
    stripeSessionId = session.id;
  } catch (err) {
    logger.error({ err, email, name }, "alphabet-scraper: Stripe session failed");
    return { sent: false };
  }

  const subject = `⚡ We found ${amount} in your name — unlock your claim report`;
  const unsubscribeUrl = `${SITE_BASE}/api/unsubscribe?e=${encodeURIComponent(email)}&pid=${prospectId}`;

  // Plain-text version stored for audit trail
  const bodyText = [
    `To: ${email}`,
    `From: ${FROM_ADDRESS}`,
    `Subject: ${subject}`,
    `Date: ${new Date().toISOString()}`,
    `Stripe Session: ${stripeSessionId}`,
    ``,
    `Hi ${firstName},`,
    ``,
    `We searched the national unclaimed money registers and found money that appears to belong to you.`,
    ``,
    `Amount found in your name: ${amount}`,
    `Held by: ${holderName}`,
    ``,
    `Data source: WA Unclaimed Monies register (https://www.wa.gov.au/organisation/department-of-treasury/unclaimed-monies)`,
    `Fee: ${pct}% of ${amount} = ${feeStr} (paid before claim instructions are released)`,
    ``,
    `Claim instructions are locked — the exact account references, claim forms, and step-by-step process are in your paid report.`,
    ``,
    `Checkout URL: ${checkoutUrl}`,
    ``,
    `${dollars > 20000 ? `Stratton Finance option included (amount > $20,000). ACL 364340. Subject to credit assessment.` : ""}`,
    ``,
    `© MissingCash | ABN 52 347 989 391 | support@missingcash.com.au`,
    `To unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#061826;padding:0;border-radius:12px;overflow:hidden;">
  <div style="background:#061826;padding:28px 32px 16px;text-align:center;">
    <h1 style="color:#f5b942;font-size:22px;margin:0;letter-spacing:2px;">MissingCash</h1>
    <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Australia's Unclaimed Money Service</p>
  </div>
  <div style="background:#0f2233;padding:28px 32px;border-top:3px solid #f5b942;">
    <h2 style="color:#ffffff;font-size:20px;margin:0 0 6px;">Hi ${firstName},</h2>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 20px;">
      We searched the national unclaimed money registers and found money that appears to belong to you.
    </p>
    <div style="background:#061826;border:1px solid #f5b942;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Amount found in your name</p>
      <p style="color:#f5b942;font-size:36px;font-weight:900;margin:0;">${amount}</p>
      <p style="color:#6b7a8d;font-size:12px;margin:6px 0 0;">Held by ${holderName}</p>
    </div>
    <div style="background:#0a1f30;border:1px solid #1a2a3a;border-radius:8px;padding:14px;margin-bottom:24px;">
      <p style="color:#94a3b8;font-size:13px;margin:0;">
        🔒 <strong style="color:#fff;">Claim instructions are locked</strong> — the exact account references, claim forms, and step-by-step process are in your paid report. Pay once, get everything you need to claim your ${amount}.
      </p>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${checkoutUrl}" style="background:#f5b942;color:#061826;padding:18px 40px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:17px;display:inline-block;letter-spacing:1px;">
        🔓 Unlock My Claim Report — ${feeStr}
      </a>
      <p style="color:#6b7a8d;font-size:11px;margin:12px 0 0;">${pct}% of ${amount} · Secure Stripe payment · Report delivered instantly after payment</p>
    </div>
    ${dollars > 20000 ? `
    <div style="margin-top:20px;padding-top:20px;border-top:1px solid #1a2a3a;text-align:center;">
      <p style="color:#94a3b8;font-size:13px;margin:0 0 12px;">💡 <strong style="color:#fff;">Can't cover the fee upfront?</strong></p>
      <p style="color:#6b7a8d;font-size:12px;margin:0 0 14px;">Stratton Finance can fund your claim fee using your ${amount} as collateral — you pay nothing until the money is in your account.</p>
      <a href="${SITE_BASE}/finance?fn=${encodeURIComponent(firstName)}&ln=${encodeURIComponent(parsed?.lastName ?? "")}&email=${encodeURIComponent(email)}&amount=${encodeURIComponent(amount)}&source=prospect-finance" style="background:#0f2233;color:#f5b942;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;border:1px solid #f5b942/30;">
        Apply for Fee Finance via Stratton →
      </a>
      <p style="color:#6b7a8d;font-size:10px;margin:10px 0 0;">Stratton Finance ACL 364340 · Subject to credit assessment</p>
    </div>` : ""}
    <p style="color:#6b7a8d;font-size:11px;text-align:center;margin-top:16px;">Questions? Reply to this email or contact support@missingcash.com.au</p>
  </div>
  <div style="background:#061826;padding:16px 32px;text-align:center;border-top:1px solid #1a2a3a;">
    <p style="color:#6b7a8d;font-size:11px;margin:0;">© MissingCash | ABN 52 347 989 391 | support@missingcash.com.au</p>
    <p style="color:#4a5568;font-size:10px;margin:8px 0 0;">You received this because your name appears on the ASIC MoneySmart public unclaimed money register. <a href="${unsubscribeUrl}" style="color:#4a5568;">Unsubscribe</a></p>
  </div>
</div>`;

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({ from: FROM_ADDRESS, to: email, subject, html });
    logger.info({ email, name, amount, prospectId, stripeSessionId }, "alphabet-scraper: outreach email sent");
    return { sent: true, stripeSessionId, subject, bodyText };
  } catch (err) {
    logger.error({ err, email, name }, "alphabet-scraper: outreach email failed");
    return { sent: false };
  }
}

async function sendOutreachSms(
  phone: string,
  name: string,
  amount: string,
  holder: string | null,
  prospectId: number,
): Promise<{ sent: boolean; stripeSessionId?: string; bodyText?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!accountSid || !authToken || !fromNumber || !stripeKey) {
    logger.warn("alphabet-scraper: SMS skipped — missing Twilio/Stripe env vars");
    return { sent: false };
  }

  const parsed = parseName(name);
  const firstName = parsed?.firstName ?? name.split(" ")[0] ?? name;
  const dollars = parseAmountDollars(amount);
  const { pct, cents, str: feeStr } = calcFee(dollars);
  const holderName = holder || "an Australian government register";

  let checkoutUrl: string;
  let stripeSessionId: string;
  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "aud",
          unit_amount: cents,
          product_data: {
            name: `MissingCash Claim Report — ${pct}% success fee`,
            description: `Mia found ${amount} held by ${holderName}. Pay ${feeStr} to unlock your personalised step-by-step claim instructions.`,
          },
        },
        quantity: 1,
      }],
      metadata: { product: "prospect-outreach", prospectId: String(prospectId) },
      success_url: `${SITE_BASE}/mia-search/paid?prospect=${prospectId}`,
      cancel_url: `${SITE_BASE}/`,
    });
    checkoutUrl = session.url!;
    stripeSessionId = session.id;
  } catch (err) {
    logger.error({ err, phone, name }, "alphabet-scraper: Stripe session failed (SMS)");
    return { sent: false };
  }

  // Normalise AU mobile to E.164 (+61...)
  const e164 = phone.replace(/^0/, "+61").replace(/\s/g, "");

  const body = `Hi ${firstName}, MissingCash found ${amount} in your name held by ${holderName}. Unlock your claim report (${feeStr} success fee): ${checkoutUrl}  Reply STOP to opt out.`;

  const bodyText = [
    `To: ${e164}`,
    `From: ${fromNumber}`,
    `Date: ${new Date().toISOString()}`,
    `Stripe Session: ${stripeSessionId}`,
    ``,
    body,
  ].join("\n");

  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({ body, from: fromNumber, to: e164 });
    logger.info({ phone: e164, name, stripeSessionId }, "alphabet-scraper: SMS sent");
    return { sent: true, stripeSessionId, bodyText };
  } catch (err) {
    logger.error({ err, phone: e164, name }, "alphabet-scraper: SMS send failed");
    return { sent: false };
  }
}

async function contactSearchLetter(letter: string): Promise<{ found: number; emailed: number }> {
  let found = 0;
  let emailed = 0;
  let processed = 0;

  while (processed < MAX_CONTACTS_PER_LETTER) {
    // Pick next pending prospect — prioritise records with a comma (full name like "SMITH, JOHN")
    // over bare surnames, which parseName can't use anyway.
    const rows = await db
      .select()
      .from(prospectsTable)
      .where(
        and(
          eq(prospectsTable.letter, letter),
          eq(prospectsTable.contactStatus, "pending"),
          sql`name LIKE '%,%'`
        )
      )
      .limit(1);

    const prospect = rows[0];
    if (!prospect) break;

    processed++;

    const contact = await findContact(prospect.name, prospect.state ?? null);

    if (contact && (contact.phone || contact.email || contact.address)) {
      found++;

      let outreachSentAt: Date | null = null;
      let stripeSessionId: string | null = null;
      let outreachSubject: string | null = null;
      let outreachBodyText: string | null = null;
      if (contact.email) {
        const result = await sendOutreachEmail(contact.email, prospect.name, prospect.amount, prospect.holder ?? null, prospect.id);
        if (result.sent) {
          emailed++;
          outreachSentAt = new Date();
          stripeSessionId = result.stripeSessionId ?? null;
          outreachSubject = result.subject ?? null;
          outreachBodyText = result.bodyText ?? null;
        }
      } else if (contact.phone) {
        // No email — send SMS instead (same Stripe checkout link)
        const result = await sendOutreachSms(contact.phone, prospect.name, prospect.amount, prospect.holder ?? null, prospect.id);
        if (result.sent) {
          emailed++;
          outreachSentAt = new Date();
          stripeSessionId = result.stripeSessionId ?? null;
          outreachSubject = `SMS to ${contact.phone}`;
          outreachBodyText = result.bodyText ?? null;
        }
      }

      await db
        .update(prospectsTable)
        .set({
          contactStatus: "found",
          contactEmail: contact.email ?? null,
          contactPhone: contact.phone ?? null,
          contactAddress: contact.address ?? null,
          contactSource: contact.source,
          contactSearchedAt: new Date(),
          outreachSentAt,
          stripeSessionId,
          outreachSubject,
          outreachBodyText,
        })
        .where(eq(prospectsTable.id, prospect.id));
    } else {
      await db
        .update(prospectsTable)
        .set({
          contactStatus: "not_found",
          contactSearchedAt: new Date(),
        })
        .where(eq(prospectsTable.id, prospect.id));
    }

    // Polite pause between requests
    await new Promise((r) => setTimeout(r, 1200));
  }

  return { found, emailed };
}

// ---------- progress tracking ----------

async function getProgress(letter: string) {
  const rows = await db.select().from(alphabetCrawlProgressTable).where(eq(alphabetCrawlProgressTable.letter, letter));
  return rows[0] ?? null;
}

async function upsertProgress(letter: string, patch: Partial<typeof alphabetCrawlProgressTable.$inferInsert>) {
  await db
    .insert(alphabetCrawlProgressTable)
    .values({ letter, ...patch })
    .onConflictDoUpdate({ target: alphabetCrawlProgressTable.letter, set: patch });
}

// ---------- auto-progression ----------

let pipelineRunning = false;

async function runPipeline() {
  if (pipelineRunning) return;
  pipelineRunning = true;

  try {
    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) { logger.warn("alphabet-pipeline: no SCRAPINGBEE_API_KEY"); return; }

    // Find first letter that isn't done
    for (const letter of LETTERS) {
      const progress = await getProgress(letter);

      if (progress?.status === "done") continue;

      // PHASE 1: crawl MoneySmart for this letter
      if (!progress || progress.status === "pending") {
        logger.info({ letter }, "alphabet-pipeline: starting crawl");
        await upsertProgress(letter, { status: "crawling", startedAt: new Date() });

        const { matches, pages } = await crawlMoneySmartLetter(letter, apiKey);

        if (pages === 0) {
          // Crawl failed entirely — reset to pending so it retries next run
          logger.warn({ letter }, "alphabet-pipeline: crawl returned 0 pages, resetting to pending for retry");
          await upsertProgress(letter, { status: "pending", startedAt: null });
          break;
        }

        const inserted = await insertProspects(letter, matches);
        logger.info({ letter, inserted, pages }, "alphabet-pipeline: crawl done");
        await upsertProgress(letter, { status: "searching", prospectCount: inserted });
      }

      // PHASE 2: contact-search all prospects
      if ((await getProgress(letter))?.status === "searching") {
        logger.info({ letter }, "alphabet-pipeline: starting contact search");
        const { found, emailed } = await contactSearchLetter(letter);

        logger.info({ letter, found, emailed }, "alphabet-pipeline: contact search done");
        await upsertProgress(letter, {
          status: "done",
          contactsFound: found,
          outreachSent: emailed,
          completedAt: new Date(),
        });

        // Delete prospects that had no contact (keep found ones for the daily report)
        await db
          .delete(prospectsTable)
          .where(
            and(
              eq(prospectsTable.letter, letter),
              eq(prospectsTable.contactStatus, "not_found")
            )
          );

        logger.info({ letter }, "alphabet-pipeline: letter complete, not_found prospects purged");
      }

      // Only do one letter per run — next letter triggers on next pipeline tick
      break;
    }
  } catch (err) {
    logger.error({ err }, "alphabet-pipeline: error");
  } finally {
    pipelineRunning = false;
  }
}

// ---------- high-value WA seeder ----------
// Directly queries WA DTF for records >= $20,000, seeds the prospects table,
// runs contact search, and sends outreach — bypassing the slow A-Z surname crawl.

const HV_LETTER = "HV";
const HV_MIN_DOLLARS = 20000;
const HV_SKIP_TERMS = ["DEC'D", "DECEASED", "ESTATE OF", "PTY LTD", "PTY.", " LTD", "INC.", "CORP.", "HOLDINGS", "VARIOUS", "& SONS", "& ASSOCIATES", "DEPARTMENT", "GOVERNMENT"];
const HV_SKIP_ADDRESS = ["CHINA", "USA", "U.S.A", "UK", "UNITED KINGDOM", "NEW ZEALAND", "SINGAPORE", "HONG KONG", "CANADA", "INDIA", "MALAYSIA"];
const AU_STATES = ["WA", "NSW", "VIC", "QLD", "SA", "TAS", "NT", "ACT"];

function isHighValueActionable(name: string, addr2: string): boolean {
  const nameUp = name.toUpperCase();
  const addrUp = addr2.toUpperCase();
  if (HV_SKIP_TERMS.some((t) => nameUp.includes(t))) return false;
  if (HV_SKIP_ADDRESS.some((t) => addrUp.includes(t))) return false;
  const hasAuAddress = AU_STATES.some((s) => addrUp.includes(s));
  return hasAuAddress;
}

async function fetchHighValueWAPage(from: number): Promise<{ items: RawMatch[]; total: number } | null> {
  const body = JSON.stringify({
    from,
    size: 50,
    query: { range: { amount_unclaimed: { gte: HV_MIN_DOLLARS } } },
    sort: [{ amount_unclaimed: "desc" }],
  });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(WA_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`WA API HTTP ${res.status}`);
      const data = await res.json() as { hits: { total: { value: number }; hits: Array<{ _source: Record<string, string> }> } };
      const total = data.hits?.total?.value ?? 0;
      const items: RawMatch[] = (data.hits?.hits ?? [])
        .map(({ _source: s }) => ({
          name: (s.payee_name ?? "").trim(),
          amount: s.amount_unclaimed ? `$${parseFloat(s.amount_unclaimed).toFixed(2)}` : "",
          holder: (s["payer_/_source"] ?? "").trim(),
          state: (s.address_2 ?? "").trim(),
          description: (s.description ?? "").trim(),
          holderEmail: "",
          holderPhone: "",
          holderContactName: "",
        }))
        .filter((m) => m.name.length > 0 && m.amount.length > 1 && isHighValueActionable(m.name, m.state));
      return { items, total };
    } catch (err) {
      logger.warn({ from, attempt, err: err instanceof Error ? err.message : String(err) }, "hv-seeder: WA fetch failed");
      if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  return null;
}

async function insertHighValueProspects(matches: RawMatch[]): Promise<number> {
  if (matches.length === 0) return 0;
  await db.delete(prospectsTable).where(eq(prospectsTable.letter, HV_LETTER));

  const seen = new Set<string>();
  const rows = matches.filter((m) => {
    const key = `${m.name.toLowerCase()}|${m.amount}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((m) => ({
    name: m.name,
    amount: m.amount,
    holder: m.holder || null,
    state: m.state || null,
    source: "WA Unclaimed Monies (High Value)",
    sourceKey: "wa-dtf-hv",
    letter: HV_LETTER,
    contactStatus: "pending",
  }));

  for (let i = 0; i < rows.length; i += 100) {
    await db.insert(prospectsTable).values(rows.slice(i, i + 100));
  }
  return rows.length;
}

async function contactSearchHighValue(): Promise<{ found: number; emailed: number }> {
  let found = 0;
  let emailed = 0;

  const pending = await db
    .select()
    .from(prospectsTable)
    .where(and(eq(prospectsTable.letter, HV_LETTER), eq(prospectsTable.contactStatus, "pending")))
    .orderBy(sql`CAST(REPLACE(REPLACE(REGEXP_REPLACE(COALESCE(amount,'0'), '[^0-9.]', '', 'g'), ',', ''), '$', '') AS NUMERIC) DESC`);

  logger.info({ count: pending.length }, "hv-seeder: starting contact search");

  for (const prospect of pending) {
    const contact = await findContact(prospect.name, prospect.state ?? null);

    if (contact && (contact.phone || contact.email || contact.address)) {
      found++;
      let outreachSentAt: Date | null = null;
      let stripeSessionId: string | null = null;
      let outreachSubject: string | null = null;
      let outreachBodyText: string | null = null;

      if (contact.email) {
        const result = await sendOutreachEmail(contact.email, prospect.name, prospect.amount, prospect.holder ?? null, prospect.id);
        if (result.sent) {
          emailed++;
          outreachSentAt = new Date();
          stripeSessionId = result.stripeSessionId ?? null;
          outreachSubject = result.subject ?? null;
          outreachBodyText = result.bodyText ?? null;
          logger.info({ name: prospect.name, amount: prospect.amount, email: contact.email }, "hv-seeder: outreach sent");
        }
      } else if (contact.phone) {
        const result = await sendOutreachSms(contact.phone, prospect.name, prospect.amount, prospect.holder ?? null, prospect.id);
        if (result.sent) {
          emailed++;
          outreachSentAt = new Date();
          stripeSessionId = result.stripeSessionId ?? null;
          outreachSubject = `SMS to ${contact.phone}`;
          outreachBodyText = result.bodyText ?? null;
          logger.info({ name: prospect.name, amount: prospect.amount, phone: contact.phone }, "hv-seeder: SMS sent");
        }
      }

      await db.update(prospectsTable).set({
        contactStatus: "found",
        contactEmail: contact.email ?? null,
        contactPhone: contact.phone ?? null,
        contactAddress: contact.address ?? null,
        contactSource: contact.source,
        contactSearchedAt: new Date(),
        outreachSentAt,
        stripeSessionId,
        outreachSubject,
        outreachBodyText,
      }).where(eq(prospectsTable.id, prospect.id));
    } else {
      await db.update(prospectsTable).set({
        contactStatus: "not_found",
        contactSearchedAt: new Date(),
      }).where(eq(prospectsTable.id, prospect.id));
      logger.info({ name: prospect.name }, "hv-seeder: no contact found");
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  return { found, emailed };
}

let hvRunning = false;

export async function runHighValueCrawl(): Promise<{ seeded: number; found: number; emailed: number; error?: string }> {
  if (hvRunning) return { seeded: 0, found: 0, emailed: 0, error: "already_running" };
  hvRunning = true;

  try {
    logger.info("hv-seeder: starting high-value WA crawl");
    const allMatches: RawMatch[] = [];
    let from = 0;
    let total = -1;

    while (true) {
      const page = await fetchHighValueWAPage(from);
      if (!page) break;
      if (total < 0) total = page.items.length > 0 ? 999 : 0;
      allMatches.push(...page.items);
      if (page.items.length < 50) break;
      from += 50;
      if (from >= 400) break; // cap at 400 raw records
      await new Promise((r) => setTimeout(r, 400));
    }

    logger.info({ raw: allMatches.length }, "hv-seeder: WA fetch complete");
    const seeded = await insertHighValueProspects(allMatches);
    logger.info({ seeded }, "hv-seeder: prospects inserted");

    const { found, emailed } = await contactSearchHighValue();
    logger.info({ seeded, found, emailed }, "hv-seeder: complete");

    return { seeded, found, emailed };
  } catch (err) {
    logger.error({ err }, "hv-seeder: error");
    return { seeded: 0, found: 0, emailed: 0, error: err instanceof Error ? err.message : String(err) };
  } finally {
    hvRunning = false;
  }
}

export function isHighValueRunning(): boolean { return hvRunning; }

// ---------- public API ----------

export async function crawlLetter(letter: string): Promise<{ inserted: number; pages: number; error?: string }> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) return { inserted: 0, pages: 0, error: "SCRAPINGBEE_API_KEY not set" };

  try {
    const { matches, pages } = await crawlMoneySmartLetter(letter.toUpperCase(), apiKey);
    const inserted = await insertProspects(letter.toUpperCase(), matches);
    return { inserted, pages };
  } catch (err) {
    return { inserted: 0, pages: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function startAlphabetPipeline() {
  logger.info("alphabet-pipeline: auto-start triggered");
  void runPipeline();
}

export async function getProspectStats() {
  const [byLetter, progress] = await Promise.all([
    db.select({
      letter: prospectsTable.letter,
      count: sql<number>`count(*)::int`,
      found: sql<number>`count(*) filter (where contact_status = 'found')::int`,
      emailed: sql<number>`count(*) filter (where outreach_sent_at is not null)::int`,
    }).from(prospectsTable).groupBy(prospectsTable.letter).orderBy(prospectsTable.letter),
    db.select().from(alphabetCrawlProgressTable).orderBy(alphabetCrawlProgressTable.letter),
  ]);

  const total = byLetter.reduce((sum, r) => sum + r.count, 0);
  return { total, byLetter, progress };
}

export function isLetterInProgress(letter: string): boolean {
  return pipelineRunning;
}
