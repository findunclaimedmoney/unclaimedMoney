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

function calcFee(dollars: number): { flat: boolean; pct: number; cents: number; str: string } {
  if (dollars >= 20000) {
    // High-value: flat $500 concierge fee
    return { flat: true, pct: 0, cents: 50000, str: "$500" };
  }
  // Lower amounts: simple percentage
  const pct = dollars <= 1000 ? 10 : 15;
  const cents = Math.max(Math.round(dollars * 100 * pct / 100), 999);
  return { flat: false, pct, cents, str: `$${(cents / 100).toFixed(2)}` };
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
  const lastName = parsed?.lastName ?? "";
  const dollars = parseAmountDollars(amount);
  const { flat, pct, cents, str: feeStr } = calcFee(dollars);
  const holderName = holder || "an Australian government register";
  const isHighValue = dollars >= 20000;

  const productName = isHighValue
    ? "MissingCash Claim Concierge"
    : "MissingCash Claim Guide";
  const productDesc = isHighValue
    ? `We prepare your personalised claim dossier for ${amount} held by ${holderName} — exact forms, reference numbers, and step-by-step instructions delivered within 24 hours.`
    : `Step-by-step instructions to claim ${amount} held by ${holderName}.`;

  // Create Stripe checkout
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
          product_data: { name: productName, description: productDesc },
        },
        quantity: 1,
      }],
      metadata: { product: "prospect-outreach", prospectId: String(prospectId) },
      success_url: `${SITE_BASE}/contact?concierge=1&prospect=${prospectId}`,
      cancel_url: `${SITE_BASE}/`,
    });
    checkoutUrl = session.url!;
    stripeSessionId = session.id;
  } catch (err) {
    logger.error({ err, email, name }, "alphabet-scraper: Stripe session failed");
    return { sent: false };
  }

  const subject = isHighValue
    ? `${firstName}, we found ${amount} registered in your name`
    : `We found ${amount} in your name — here's how to claim it`;

  const unsubscribeUrl = `${SITE_BASE}/api/unsubscribe?e=${encodeURIComponent(email)}&pid=${prospectId}`;
  const financeUrl = `${SITE_BASE}/finance?fn=${encodeURIComponent(firstName)}&ln=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}&amount=${encodeURIComponent(amount)}&source=prospect-concierge`;

  const feeNote = flat
    ? `Flat fee of ${feeStr} — we prepare everything, you submit the form.`
    : `${pct}% service fee · ${feeStr} total`;

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
    isHighValue
      ? `My name is Mia. I work with MissingCash — an Australian service that searches the national unclaimed money registers on behalf of Australians who may not know money is being held for them.`
      : `We searched the national unclaimed money registers and found money that appears to belong to you.`,
    ``,
    `Amount found: ${amount}`,
    `Held by: ${holderName}`,
    `Source: WA Unclaimed Monies register`,
    ``,
    isHighValue
      ? `For an amount like this, we offer a Claim Concierge service — we prepare your complete personalised claim dossier: the exact forms, account reference numbers, supporting documents required, and a step-by-step submission guide specific to your situation. You receive it by email within 24 hours and submit the claim yourself directly to the government — no middleman.`
      : `Your claim guide includes step-by-step instructions to recover this amount directly from the register.`,
    ``,
    `Service fee: ${feeNote}`,
    ``,
    `Get started: ${checkoutUrl}`,
    ``,
    isHighValue ? `If you'd prefer to discuss this first, simply reply to this email.` : "",
    ``,
    `© MissingCash | ABN 52 347 989 391 | support@missingcash.com.au`,
    `To unsubscribe: ${unsubscribeUrl}`,
  ].filter(Boolean).join("\n");

  const html = `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#ffffff;padding:0;border:1px solid #e5e7eb;">
  <div style="background:#061826;padding:24px 32px;text-align:center;">
    <span style="color:#f5b942;font-size:20px;font-weight:bold;letter-spacing:2px;">MissingCash</span>
    <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;font-family:sans-serif;">Australia's Unclaimed Money Service · ABN 52 347 989 391</p>
  </div>

  <div style="padding:36px 40px;background:#ffffff;">
    <p style="font-size:15px;color:#111827;margin:0 0 20px;">Hi ${firstName},</p>

    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 20px;">
      ${isHighValue
        ? `My name is Mia. I work with <strong>MissingCash</strong> — an Australian service that searches the national unclaimed money registers on behalf of people who may not know money is being held for them.`
        : `We searched the national unclaimed money registers and found money that appears to belong to you.`}
    </p>

    <div style="background:#fefce8;border-left:4px solid #f5b942;padding:20px 24px;margin:0 0 24px;">
      <p style="font-size:12px;color:#92400e;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;font-family:sans-serif;">Amount found in your name</p>
      <p style="font-size:32px;font-weight:bold;color:#111827;margin:0;">${amount}</p>
      <p style="font-size:13px;color:#6b7280;margin:6px 0 0;font-family:sans-serif;">Held by ${holderName} · WA Unclaimed Monies Register</p>
    </div>

    ${isHighValue ? `
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
      For an amount like this, we offer a <strong>Claim Concierge service</strong>. We prepare your complete, personalised claim dossier:
    </p>
    <ul style="font-size:14px;color:#374151;line-height:2;margin:0 0 20px;padding-left:20px;">
      <li>The exact government claim forms for your register</li>
      <li>Your account reference numbers</li>
      <li>Supporting documents you'll need to provide</li>
      <li>A step-by-step submission guide written for your specific situation</li>
    </ul>
    <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 24px;">
      You receive everything by email <strong>within 24 hours</strong> and submit directly to the government yourself — no middleman holds your money.
    </p>` : `
    <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
      Your personalised claim guide includes the exact steps to recover this amount directly from the register.
    </p>`}

    <div style="text-align:center;margin:28px 0;">
      <a href="${checkoutUrl}" style="background:#f5b942;color:#061826;padding:16px 36px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;font-family:sans-serif;">
        ${isHighValue ? `Get My Claim Dossier — ${feeStr}` : `Get My Claim Guide — ${feeStr}`}
      </a>
      <p style="color:#9ca3af;font-size:11px;margin:10px 0 0;font-family:sans-serif;">${feeNote} · Secure payment via Stripe</p>
    </div>

    ${isHighValue ? `
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:18px 24px;margin:0 0 24px;">
      <p style="font-size:13px;color:#374151;margin:0 0 12px;font-family:sans-serif;">💡 <strong>Need help covering the fee first?</strong></p>
      <p style="font-size:13px;color:#6b7280;margin:0 0 14px;font-family:sans-serif;">Stratton Finance can help fund your claim — you pay nothing upfront.</p>
      <a href="${financeUrl}" style="color:#061826;font-weight:bold;font-size:13px;font-family:sans-serif;">Apply via Stratton Finance →</a>
      <p style="color:#9ca3af;font-size:10px;margin:8px 0 0;font-family:sans-serif;">Stratton Finance ACL 364340 · Subject to credit assessment</p>
    </div>` : ""}

    <p style="font-size:14px;color:#374151;line-height:1.7;margin:0;">
      If you have any questions before proceeding, simply reply to this email — I'm happy to help.
    </p>
    <p style="font-size:14px;color:#374151;margin:8px 0 0;">Warm regards,<br><strong>Mia</strong><br><span style="color:#9ca3af;font-size:12px;font-family:sans-serif;">MissingCash · support@missingcash.com.au</span></p>
  </div>

  <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:10px;margin:0;font-family:sans-serif;">
      You received this email because your name appears on the WA Unclaimed Monies public register.
      <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
    <p style="color:#9ca3af;font-size:10px;margin:4px 0 0;font-family:sans-serif;">© MissingCash | ABN 52 347 989 391 | This is not financial or legal advice.</p>
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

// ---------- daily unfound report ----------
// Called by DailyRoutineScheduler at 11 PM: emails Zac every HV prospect
// Mia couldn't find contact details for so he can manually locate them.

export async function sendUnfoundHVReport(): Promise<{ sent: boolean; count: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { logger.warn("unfound-report: RESEND_API_KEY not set"); return { sent: false, count: 0 }; }

  const unfound = await db
    .select()
    .from(prospectsTable)
    .where(and(eq(prospectsTable.letter, HV_LETTER), eq(prospectsTable.contactStatus, "not_found")))
    .orderBy(sql`CAST(REPLACE(REPLACE(COALESCE(amount,'0'), '$', ''), ',', '') AS NUMERIC) DESC`);

  if (unfound.length === 0) {
    logger.info("unfound-report: no unfound HV prospects — skipping email");
    return { sent: false, count: 0 };
  }

  const domainVerified = process.env.MISSINGCASH_DOMAIN_VERIFIED === "true";
  const from = domainVerified
    ? "MissingCash <leads@missingcash.com.au>"
    : "MissingCash <leads@lensflow.com.au>";

  const dateStr = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const rows = unfound.map((p) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${p.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:bold;color:#16a34a;">${p.amount}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${p.holder ?? "—"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${p.state ?? "—"}</td>
    </tr>`).join("");

  const textRows = unfound.map((p) => `  ${p.name.padEnd(42)} ${p.amount.padStart(14)}  ${p.state ?? "—"}`).join("\n");

  const html = `
<div style="font-family:Arial,sans-serif;color:#0f172a;max-width:700px;">
  <h2 style="color:#061826;">MissingCash — High-Value Unfound Contacts</h2>
  <p style="color:#475569;">${dateStr}</p>
  <p>Mia searched for contact details for <strong>${unfound.length} high-value WA prospect${unfound.length !== 1 ? "s" : ""}</strong> today and couldn't locate them through public directories. Here they are for you to find manually:</p>
  <table style="border-collapse:collapse;width:100%;margin-top:16px;font-size:14px;">
    <thead>
      <tr style="background:#061826;color:#f5b942;">
        <th style="padding:10px 12px;text-align:left;">Name</th>
        <th style="padding:10px 12px;text-align:left;">Amount</th>
        <th style="padding:10px 12px;text-align:left;">Holder</th>
        <th style="padding:10px 12px;text-align:left;">State/Location</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="margin-top:20px;color:#64748b;font-size:13px;">Source: WA Unclaimed Monies register — amounts ≥ $20,000. These records are live on <a href="https://www.wa.gov.au/organisation/department-of-treasury/unclaimed-monies" style="color:#f5b942;">WA DTF</a>.</p>
</div>`;

  const text = [
    `MissingCash — High-Value Unfound Contacts — ${dateStr}`,
    "",
    `Mia couldn't find contact details for ${unfound.length} prospect(s):`,
    "",
    textRows,
    "",
    "Source: WA Unclaimed Monies register (≥ $20,000).",
  ].join("\n");

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const res = await resend.emails.send({
      from,
      to: ["admin@missingcash.com.au"],
      subject: `${unfound.length} high-value unfound contacts — ${dateStr}`,
      html,
      text,
    });
    if (res.error) throw new Error(res.error.message);
    logger.info({ count: unfound.length }, "unfound-report: daily email sent to Zac");
    return { sent: true, count: unfound.length };
  } catch (err) {
    logger.error({ err }, "unfound-report: Resend failed");
    return { sent: false, count: unfound.length };
  }
}

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
