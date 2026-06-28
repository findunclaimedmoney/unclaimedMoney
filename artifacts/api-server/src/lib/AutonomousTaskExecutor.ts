import { db } from "@workspace/db";
import { prospectsTable } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";
import { startTask, completeTask, failTask } from "./MiaTaskLog";
import { logger } from "./logger";

const LOCATION_TO_STATE: Record<string, string> = {
  sydney: "NSW", "new south wales": "NSW", nsw: "NSW",
  melbourne: "VIC", victoria: "VIC", vic: "VIC",
  brisbane: "QLD", queensland: "QLD", qld: "QLD",
  perth: "WA", "western australia": "WA", wa: "WA",
  adelaide: "SA", "south australia": "SA", sa: "SA",
  hobart: "TAS", tasmania: "TAS", tas: "TAS",
  darwin: "NT", "northern territory": "NT", nt: "NT",
  canberra: "ACT", act: "ACT",
};

export interface LeadResult {
  name: string;
  amount: string;
  state: string | null;
  holder: string | null;
  email: string | null;
  phone: string | null;
  professionMatch: boolean;
}

export async function findProfessionLeads(
  profession: string,
  location: string,
  limit = 15,
): Promise<{ leads: LeadResult[]; summary: string }> {
  const started = new Date();
  const taskId = await startTask("lead_search", JSON.stringify({ profession, location, limit }));

  try {
    const stateCode = LOCATION_TO_STATE[location.toLowerCase().trim()] ?? null;

    const prospects = await db
      .select()
      .from(prospectsTable)
      .where(
        stateCode
          ? and(eq(prospectsTable.contactStatus, "found"), eq(prospectsTable.state, stateCode))
          : eq(prospectsTable.contactStatus, "found"),
      )
      .limit(100);

    if (prospects.length === 0) {
      const summary = `No prospects with contact info found${stateCode ? ` in ${stateCode}` : ""}.`;
      await completeTask(taskId, summary, started);
      return { leads: [], summary };
    }

    const apiKey = process.env["SCRAPINGBEE_API_KEY"];
    const results: LeadResult[] = [];
    const sample = prospects.slice(0, Math.min(limit * 3, 60));

    for (const prospect of sample) {
      if (results.length >= limit) break;

      const lead: LeadResult = {
        name: prospect.name,
        amount: prospect.amount,
        state: prospect.state,
        holder: prospect.holder,
        email: prospect.contactEmail,
        phone: prospect.contactPhone,
        professionMatch: false,
      };

      if (apiKey) {
        try {
          const q = encodeURIComponent(`"${prospect.name}" ${profession} ${location}`);
          const params = new URLSearchParams({
            api_key: apiKey,
            url: `https://html.duckduckgo.com/html/?q=${q}&kl=au-en`,
            render_js: "false",
            block_ads: "true",
            stealth_proxy: "true",
            country_code: "au",
          });
          const res = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`, {
            signal: AbortSignal.timeout(12_000),
          });
          if (res.ok) {
            const text = (await res.text()).toLowerCase();
            lead.professionMatch =
              text.includes(profession.toLowerCase()) &&
              text.includes((prospect.name.toLowerCase().split(" ")[0]) ?? "");
          }
        } catch {
          // skip — profession match is best-effort
        }
      }

      results.push(lead);
    }

    const matched = results.filter((r) => r.professionMatch);
    const returned = matched.length >= 3 ? matched : results.slice(0, limit);

    const summary = [
      `Found ${returned.length} potential leads for ${profession}s in ${location}.`,
      matched.length > 0
        ? `${matched.length} confirmed via web lookup.`
        : `Web lookup inconclusive — returning all contacts in ${stateCode ?? location}.`,
      `With email: ${returned.filter((r) => r.email).length}.`,
      `With phone: ${returned.filter((r) => r.phone).length}.`,
    ].join(" ");

    await completeTask(taskId, summary, started);
    return { leads: returned, summary };
  } catch (err) {
    logger.error({ err }, "AutonomousTaskExecutor: findProfessionLeads failed");
    await failTask(taskId, String(err), started);
    throw err;
  }
}
