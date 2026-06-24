import PDFDocument from "pdfkit";
import { logger } from "./logger";
import type { MoneySmartResults } from "./moneysmart-scraper";

interface ResearchDetails {
  firstName: string;
  lastName: string;
  dob: string;
  currentAddress: string;
  previousAddresses: string;
  previousSurnames: string;
}

const NAVY = "#061826";
const GOLD = "#f5b942";
const DARK = "#1a2a3a";
const MUTED = "#6b7a8d";

function buildPDF(fn: (doc: InstanceType<typeof PDFDocument>) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 55, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    fn(doc);
    doc.end();
  });
}

function reportHeader(doc: InstanceType<typeof PDFDocument>, name: string) {
  doc.rect(0, 0, doc.page.width, 140).fill(NAVY);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(11).text("MissingCash — PERSONALISED RESEARCH REPORT", 55, 25);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text(`${name}`, 55, 48);
  doc.fillColor(GOLD).font("Helvetica").fontSize(10).text(`Prepared by Mia · ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}`, 55, 76);
  doc.fillColor(MUTED).font("Helvetica").fontSize(9).text("CONFIDENTIAL — This report was prepared for your personal use only.", 55, 98);
  doc.rect(0, 135, doc.page.width, 5).fill(GOLD);
  doc.y = 160;
}

function section(doc: InstanceType<typeof PDFDocument>, title: string, dbNum?: number) {
  doc.moveDown(0.8);
  if (dbNum) {
    doc.rect(55, doc.y, 28, 20).fill(GOLD);
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(`${dbNum}`, 55, doc.y - 15, { width: 28, align: "center" });
    doc.fillColor(DARK).font("Helvetica-Bold").fontSize(13).text(title, 92, doc.y - 20);
  } else {
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(13).text(title);
  }
  doc.moveDown(0.3);
  doc.rect(55, doc.y, 80, 2).fill(GOLD);
  doc.moveDown(0.6);
}

function body(doc: InstanceType<typeof PDFDocument>, text: string) {
  doc.fillColor(DARK).font("Helvetica").fontSize(10).text(text, { lineGap: 3 });
  doc.moveDown(0.4);
}

function stepItem(doc: InstanceType<typeof PDFDocument>, num: number, text: string) {
  const x = doc.x;
  const y = doc.y;
  doc.circle(x + 8, y + 7, 8).fill(GOLD);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(8).text(String(num), x + 5, y + 4, { width: 7, align: "center" });
  doc.fillColor(DARK).font("Helvetica").fontSize(10).text(text, x + 22, y, { width: doc.page.width - x - 77, lineGap: 2 });
  doc.moveDown(0.5);
}

function highlight(doc: InstanceType<typeof PDFDocument>, label: string, value: string) {
  doc.fillColor(MUTED).font("Helvetica-Bold").fontSize(9).text(`${label}: `, { continued: true });
  doc.fillColor(DARK).font("Helvetica").fontSize(9).text(value, { lineGap: 2 });
  doc.moveDown(0.2);
}

function liveResultsSection(doc: InstanceType<typeof PDFDocument>, results: MoneySmartResults, fullName: string) {
  section(doc, "⚡ LIVE MONEYSMART RESULTS — SEARCHED BY MIA");

  if (results.matches.length === 0) {
    body(doc, `Mia searched MoneySmart across ${results.totalScanned} pages for the name${results.namesSearched.length > 1 ? "s" : ""}: ${results.namesSearched.join(", ")}. No exact matches were found for ${fullName} in today's ASIC database. This does NOT mean there is no money — ASIC updates records monthly and some entries use name abbreviations. Follow the manual steps in the ASIC section below to double-check with variations.`);
    return;
  }

  body(doc, `Mia found ${results.matches.length} potential match${results.matches.length !== 1 ? "es" : ""} for ${fullName} on MoneySmart after scanning ${results.totalScanned} pages. Review each entry below and follow the claim steps in the ASIC section.`);
  doc.moveDown(0.4);

  const colWidths = [180, 80, 170, 50];
  const tableX = 55;
  const pageWidth = doc.page.width - 110;
  const rowH = 22;

  doc.rect(tableX, doc.y, pageWidth, rowH).fill(NAVY);
  const hdrY = doc.y + 6;
  const headers = ["NAME ON FILE", "AMOUNT", "INSTITUTION", "STATE"];
  let hx = tableX + 6;
  for (let i = 0; i < headers.length; i++) {
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(8).text(headers[i]!, hx, hdrY, { width: colWidths[i]! - 4, lineBreak: false });
    hx += colWidths[i]!;
  }
  doc.y += rowH + 2;

  for (const [idx, match] of results.matches.entries()) {
    const rowY = doc.y;
    const bg = idx % 2 === 0 ? "#f0f4f8" : "#ffffff";
    doc.rect(tableX, rowY, pageWidth, rowH).fill(bg);
    const cells = [match.name, match.amount || "—", match.holder || "—", match.state || "—"];
    let cx = tableX + 6;
    for (let i = 0; i < cells.length; i++) {
      doc.fillColor(DARK).font("Helvetica").fontSize(8).text(cells[i]!, cx, rowY + 6, { width: colWidths[i]! - 8, lineBreak: false });
      cx += colWidths[i]!;
    }
    doc.y += rowH;
  }

  doc.moveDown(0.6);
  body(doc, "⚠️  To claim any match above: scroll to the ASIC/MoneySmart section in this report for the exact lodgement steps.");
}

export async function generateResearchReport(details: ResearchDetails, reportText: string, liveResults?: MoneySmartResults): Promise<Buffer> {
  const fullName = `${details.firstName} ${details.lastName}`;

  return buildPDF((doc) => {
    doc.on("pageAdded", () => {
      const bottom = doc.page.height - 35;
      doc.rect(0, bottom - 5, doc.page.width, 40).fill(NAVY);
      doc.fillColor(GOLD).font("Helvetica").fontSize(8)
        .text(`MissingCash Personalised Report — ${fullName} · www.missingcash.com.au`, 55, bottom, { align: "center", width: doc.page.width - 110 });
    });

    reportHeader(doc, fullName);

    if (liveResults?.scraped) {
      liveResultsSection(doc, liveResults, fullName);
      doc.moveDown(0.6);
    }

    section(doc, "YOUR RESEARCH PROFILE");
    highlight(doc, "Full Name", fullName);
    highlight(doc, "Date of Birth", details.dob);
    highlight(doc, "Current Address", details.currentAddress);
    if (details.previousAddresses) highlight(doc, "Previous Addresses", details.previousAddresses);
    if (details.previousSurnames) highlight(doc, "Previous Surnames", details.previousSurnames);
    doc.moveDown(0.4);
    body(doc, "Mia has used these details to prepare your personalised database-by-database research guide below. Each section includes the exact steps to search for money in your name, using your specific details.");

    const lines = reportText.split("\n");
    let currentDbNum = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        doc.moveDown(0.3);
        continue;
      }
      if (trimmed.startsWith("## ")) {
        currentDbNum++;
        section(doc, trimmed.replace("## ", ""), currentDbNum);
      } else if (trimmed.startsWith("# ")) {
        section(doc, trimmed.replace("# ", ""));
      } else if (/^\d+\.\s/.test(trimmed)) {
        const num = parseInt(trimmed.match(/^(\d+)\./)?.[1] ?? "1");
        stepItem(doc, num, trimmed.replace(/^\d+\.\s/, ""));
      } else if (trimmed.startsWith("- ")) {
        doc.fillColor(GOLD).font("Helvetica").fontSize(10).text("•  ", { continued: true });
        doc.fillColor(DARK).font("Helvetica").fontSize(10).text(trimmed.replace(/^- /, ""), { lineGap: 2 });
        doc.moveDown(0.3);
      } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(trimmed.replace(/\*\*/g, ""), { lineGap: 2 });
        doc.moveDown(0.2);
      } else {
        body(doc, trimmed);
      }
    }

    doc.moveDown(1);
    const footerY = doc.y;
    doc.rect(55, footerY, doc.page.width - 110, 70).fill(NAVY);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(12).text("Questions? Mia is here.", 75, footerY + 10, { width: doc.page.width - 150 });
    doc.fillColor("#ffffff").font("Helvetica").fontSize(9).text(
      "Visit www.missingcash.com.au and open the Mia chat — she knows your case and can answer any follow-up questions about your search. You can also email support@missingcash.com.au.",
      75, footerY + 30, { width: doc.page.width - 150, lineGap: 3 }
    );
  });
}

export async function callOpenAIReport(details: ResearchDetails): Promise<string> {
  const integrationBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const integrationKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const directKey = process.env.OPENAI_API_KEY;

  const useIntegration = !!(integrationBase && integrationKey);
  const useDirect = !useIntegration && !!directKey;

  if (!useIntegration && !useDirect) {
    logger.warn("No OpenAI credentials — using fallback research report");
    return buildFallbackReport(details);
  }

  const { default: OpenAI } = await import("openai");
  const openai = useIntegration
    ? new OpenAI({ baseURL: integrationBase, apiKey: integrationKey })
    : new OpenAI({ apiKey: directKey });

  const prompt = `You are Mia, the AI assistant for MissingCash (www.missingcash.com.au), an Australian unclaimed money search service.

A customer has paid $99 for a personalised Mia Speed Research report. Write a comprehensive, professional, highly personalised research report using their details below.

Customer Details:
- Full Name: ${details.firstName} ${details.lastName}
- Date of Birth: ${details.dob}
- Current Address: ${details.currentAddress}
${details.previousAddresses ? `- Previous Addresses: ${details.previousAddresses}` : ""}
${details.previousSurnames ? `- Previous Surnames / Maiden Name: ${details.previousSurnames}` : ""}

Write the report covering these 8 databases. For EACH database:
1. Give the exact URL to visit
2. Give step-by-step instructions using their EXACT name and DOB as they should enter it
3. Note any name variations to try (especially using their previous surnames or address history)
4. Explain what a match looks like and what to do if found
5. Include the claim lodgement steps specific to that database

Use Australian English. Be specific, warm, and professional. Use "## " prefix for each database heading. Use numbered lists for steps. Be encouraging but honest.

Databases to cover:
## ATO — Lost Superannuation & Tax Refunds (via myGov)
## ASIC / MoneySmart — Bank Accounts, Investments & Life Insurance
## NSW Revenue Office
## VIC State Revenue Office
## QLD Revenue Office
## WA — Unclaimed Moneys
## SA — RevenueSA
## Share Registries — Computershare & Link Market Services

After the databases, add these sections:
# Fair Work — Unpaid Wages
# Rental Bonds
# Lotteries

End with:
# Your Priority Search Order
Based on their details (age implied by DOB, states from addresses), recommend which databases are most likely to have results and in what order to search them.

# How to Claim What You Find
A consolidated step-by-step on lodging claims once money is found.`;

  try {
    const completion = await openai.chat.completions.create({
      model: useIntegration ? "gpt-5.4" : "gpt-4o",
      max_completion_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });
    return completion.choices[0]?.message?.content ?? buildFallbackReport(details);
  } catch (err) {
    logger.error({ err }, "OpenAI research report generation failed — using fallback");
    return buildFallbackReport(details);
  }
}

function buildFallbackReport(d: ResearchDetails): string {
  const name = `${d.firstName} ${d.lastName}`;
  return `# Your Personalised Unclaimed Money Research Guide

This report has been prepared for ${name} (DOB: ${d.dob}).

## ATO — Lost Superannuation & Tax Refunds

Search for lost super and unclaimed tax refunds held by the Australian Taxation Office.

1. Go to www.my.gov.au and sign in (or create a free account).
2. Link the ATO service to your myGov account if not already linked.
3. Navigate to Super → Manage → Find lost super.
4. Search using the name: ${name} and your Tax File Number.
5. Also check Tax → Lodgements for any outstanding returns with refunds owed.
${d.previousSurnames ? `6. Note: Also try searching under your previous name(s): ${d.previousSurnames}` : ""}

## ASIC / MoneySmart — Bank Accounts, Investments & Life Insurance

ASIC holds money from bank accounts inactive for 7+ years, investments, and life insurance policies.

1. Go to www.moneysmart.gov.au/unclaimed-money
2. Search for: ${name}
${d.previousSurnames ? `3. Also search: ${d.previousSurnames}` : "3. Search any previous surnames you may have had."}
4. Try variations: first name only, surname only, initials.
5. If you find a match, click "How to claim" next to the listing.

## NSW Revenue Office

1. Go to www.revenue.nsw.gov.au and search for "unclaimed money".
2. Enter the name: ${name}
3. If you have lived in NSW, this register may hold trust money or court deposits.

## VIC State Revenue Office

1. Go to www.sro.vic.gov.au
2. Navigate to the unclaimed money section.
3. Search for: ${name}

## QLD Revenue Office

1. Go to www.unclaimed.treasury.qld.gov.au
2. Search for: ${name}
3. This register covers unclaimed trust money from Queensland.

## WA — Unclaimed Moneys

1. Go to www.finance.wa.gov.au and search for "unclaimed moneys register".
2. Search for: ${name}

## SA — RevenueSA

1. Go to www.revenuesa.sa.gov.au
2. Navigate to the unclaimed money section.
3. Search for: ${name}

## Share Registries — Computershare & Link Market Services

If you've ever owned shares, dividends may be unclaimed in your name.

1. Computershare: www.computershare.com/au → Investor Centre → search ${name}
2. Link Market Services: www.linkmarketservices.com.au → search ${name}
${d.previousSurnames ? `3. Also search under previous name(s): ${d.previousSurnames}` : ""}

# Fair Work — Unpaid Wages

1. Go to services.fairwork.gov.au/unpaid-wages/check-unpaid-wages
2. Search for: ${name}
3. If a match is found, follow the free online claim process.

# Rental Bonds

Search in every state where you've rented property:
- NSW: www.fairtrading.nsw.gov.au → rental bonds
- VIC: www.rtba.vic.gov.au
- QLD: www.rta.qld.gov.au → bond search
- WA: www.commerce.wa.gov.au → rental bonds

# Lotteries

- Oz Lotto / Tatts: www.thelott.com → Check my ticket
- Lotterywest (WA): www.lotterywest.wa.gov.au → Check my ticket

# Your Priority Search Order

Based on your details, we recommend searching in this order:
1. ATO (myGov) — highest chance of finding lost super or tax credits
2. ASIC/MoneySmart — second most likely to have dormant account funds
3. State Revenue Offices — search states listed in your addresses
4. Share Registries — if you've ever invested in shares
5. Fair Work — if you've worked for any employer in the past 6 years

# How to Claim What You Find

Once you find money in your name:
1. Note the reference number or listing details.
2. Download the claim form from the relevant authority's website.
3. Prepare your ID: government-issued photo ID + proof of address.
4. If claiming under a previous name: marriage certificate or deed poll required.
5. Submit the claim — most agencies process within 20–40 business days.
6. Keep copies of everything you submit.

Questions? Open Mia at www.missingcash.com.au — she can answer any follow-up questions about your specific situation.`;
}
