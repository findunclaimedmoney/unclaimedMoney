---
name: Always update Mia's brain
description: Standing user rule — every code change must be reflected in mia-knowledge.ts
---

## The rule
Whenever a new feature is built, a scraper is added/changed, a database count changes, or a new tool parameter is added — update `artifacts/api-server/src/lib/mia-knowledge.ts` in the same session.

**Why:** The user explicitly asked for this. Mia's knowledge base is her "brain" — if it goes stale she gives wrong answers about what she can search, how many databases she covers, and what parameters she accepts.

## What to check on every relevant change
- `MIA_SYSTEM_PROMPT` — database count ("13 databases"), source list, WA/DOB notes, About MissingCash section
- `MIA_SEARCH_TOOL` — description string (database count), `parameters.properties` (add new params like `dob`)
- `getMiaFallback` — keyword-triggered fallback responses for when OpenAI is unavailable
- `mia.ts` route — args type and `searchAllSources` call (must pass all tool params through)

## Current state (as of June 2026)
- 13 databases searched live
- Tool params: `firstName`, `lastName`, `address` (optional), `dob` (optional, YYYY-MM-DD)
- WA DTF uses DOB for better matching
- Google Search of .gov.au is source 13
- Auto-search daily limit: 100
