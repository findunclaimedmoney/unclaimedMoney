import { db } from "@workspace/db";
import { prospectsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { logger } from "./logger";

const SCRAPINGBEE_API = "https://app.scrapingbee.com/api/v1/";
const MAX_PAGES = 50;

// Track in-progress crawls per source+letter so we don't double-run
const inProgress = new Set<string>();

export interface ProspectMatch {
  name: string;
  amount: string;
  holder: string;
  state: string;
  source: string;
  sourceKey: string;
}

async function fetchPage(url: string, apiKey: string): Promise<string> {
  const params = new URLSearchParams({
    api_key: apiKey,
    url,
    render_js: "true",
    premium_proxy: "true",
    block_ads: "true",
    country_code: "au",
    wait: "3000",
  });
  const res = await fetch(`${SCRAPINGBEE_API}?${params.toString()}`, {
    signal: AbortSignal.timeout(55_000),
  });
  if (!res.ok && res.status !== 404) {
    const body = await res.text().catch(() => "");
    throw new Error(`ScrapingBee ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.text();
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function parseMoneySmartRows(html: string): ProspectMatch[] {
  const matches: ProspectMatch[] = [];
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const row = rowMatch[1];
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
      m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").trim()
    );
    if (cells.length >= 2 && cells[0] && cells[0].trim().length > 2) {
      const amtMatch = (cells[1] ?? "").match(/\$[\d,]+(?:\.\d{2})?/);
      if (amtMatch) {
        matches.push({
          name: cells[0].trim(),
          amount: amtMatch[0],
          holder: cells[2] ?? "",
          state: cells[3] ?? "",
          source: "ASIC MoneySmart",
          sourceKey: "moneysmart",
        });
      }
    }
  }
  return matches;
}

function hasNextPage(html: string, page: number): boolean {
  return (
    /rel=["']next["']/i.test(html) ||
    /class="[^"]*next[^"]*"/i.test(html) ||
    />\s*Next\s*</i.test(html) ||
    new RegExp(`page=${page + 1}`, "i").test(html)
  );
}

async function scrapeMoneySmartLetter(letter: string, apiKey: string): Promise<{ matches: ProspectMatch[]; pages: number }> {
  const allMatches: ProspectMatch[] = [];
  let pages = 0;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const encoded = encodeURIComponent(letter);
    const url =
      page === 1
        ? `https://moneysmart.gov.au/find-unclaimed-money?name=${encoded}`
        : `https://moneysmart.gov.au/find-unclaimed-money?name=${encoded}&page=${page}`;

    logger.info({ letter, page, url }, "alphabet-scraper: fetching MoneySmart page");

    let html: string;
    try {
      html = await fetchPage(url, apiKey);
    } catch (err) {
      logger.error({ err, letter, page }, "alphabet-scraper: fetch failed, stopping pagination");
      break;
    }

    pages++;
    const pageMatches = parseMoneySmartRows(html);
    allMatches.push(...pageMatches);

    const noResults =
      /no results found|no records found|no unclaimed money|0 results/i.test(html);

    if (noResults || pageMatches.length === 0) break;
    if (!hasNextPage(html, page)) break;

    await new Promise((r) => setTimeout(r, 600));
  }

  return { matches: allMatches, pages };
}

async function upsertProspects(letter: string, matches: ProspectMatch[]): Promise<number> {
  if (matches.length === 0) return 0;

  // Delete old entries for this letter+source before reinserting (fresh crawl)
  await db.delete(prospectsTable).where(
    and(eq(prospectsTable.letter, letter.toUpperCase()), eq(prospectsTable.sourceKey, "moneysmart"))
  );

  const seen = new Set<string>();
  const rows = matches
    .filter((m) => {
      const key = `${normalise(m.name)}|${m.amount}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((m) => ({
      name: m.name,
      amount: m.amount,
      holder: m.holder || null,
      state: m.state || null,
      source: m.source,
      sourceKey: m.sourceKey,
      letter: letter.toUpperCase(),
    }));

  if (rows.length === 0) return 0;

  // Insert in batches of 100
  for (let i = 0; i < rows.length; i += 100) {
    await db.insert(prospectsTable).values(rows.slice(i, i + 100));
  }

  return rows.length;
}

export async function crawlLetter(letter: string): Promise<{ inserted: number; pages: number; error?: string }> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) return { inserted: 0, pages: 0, error: "SCRAPINGBEE_API_KEY not set" };

  const key = `moneysmart:${letter.toUpperCase()}`;
  if (inProgress.has(key)) return { inserted: 0, pages: 0, error: "Already in progress" };

  inProgress.add(key);
  try {
    logger.info({ letter }, "alphabet-scraper: starting letter crawl");
    const { matches, pages } = await scrapeMoneySmartLetter(letter.toUpperCase(), apiKey);
    logger.info({ letter, rawMatches: matches.length, pages }, "alphabet-scraper: scrape complete, upserting");
    const inserted = await upsertProspects(letter, matches);
    logger.info({ letter, inserted, pages }, "alphabet-scraper: letter complete");
    return { inserted, pages };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err, letter }, "alphabet-scraper: letter failed");
    return { inserted: 0, pages: 0, error: msg };
  } finally {
    inProgress.delete(key);
  }
}

export async function getProspectStats(): Promise<{ total: number; byLetter: { letter: string; count: number }[] }> {
  const byLetter = await db.select({
    letter: prospectsTable.letter,
    count: sql<number>`count(*)::int`,
  }).from(prospectsTable).groupBy(prospectsTable.letter).orderBy(prospectsTable.letter);

  const total = byLetter.reduce((sum, r) => sum + r.count, 0);
  return { total, byLetter };
}

export function isLetterInProgress(letter: string): boolean {
  return inProgress.has(`moneysmart:${letter.toUpperCase()}`);
}
