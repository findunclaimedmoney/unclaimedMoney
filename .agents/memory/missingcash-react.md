---
name: MissingCash React conversion
description: Notes on converting missingcash from static HTML to React/Vite app.
---

# MissingCash React Conversion

**Why:** The static HTML site (serve.mjs + public/) was converted to a full React/Vite app matching the Glimr pattern.

**How to apply:** App is at `artifacts/missingcash/`. Uses PORT + BASE_PATH env vars (same as Glimr). Workflow runs `pnpm --filter @workspace/missingcash run dev`.

## Key facts

- Theme: navy #061826, gold #f5b942 — set via @theme in `src/index.css`
- Router: wouter with `<Router base={BASE_URL.replace(/\/$/, "")}>` pattern
- 12 pages in `src/pages/` — 11 from user zip + Finance.tsx which was truncated in upload and had to be reconstructed manually
- Finance.tsx: posts to `/api/finance/enquiry`; Stratton Finance partner; Erin Crofton 0432 280 181; tracking URL in STRATTON_QUOTE_URL constant
- Custom components: `UnclaimedTicker` (live counter from $24.1B base), `EmailAlertSignup` (posts to `/api/alerts/subscribe`), `MiaChat` (floating chat, listens to `mia:open` CustomEvent, posts to `/api/mia/chat`)
- `usePageSEO` hook in `src/hooks/use-page-seo.ts` — sets document.title and meta tags
- UI components copied from Glimr (`src/components/ui/`)
- Static assets (PDFs, videos, images) remain in `public/` and are served by Vite at root paths
- GA4: G-1LLNFV2MEQ (in index.html)
- `src/pages/Finance.tsx` line 1 had `4q` corruption removed; file was also truncated at line 320 mid-JSX — reconstructed with loan calculator + enquiry form sections

**Sharp edges:**
- Finance.tsx was truncated in the user's upload — always check Finance page if rebuilding
- Mia chat expects `/api/mia/chat` endpoint (not yet built in api-server)
- Email alerts expect `/api/alerts/subscribe` endpoint (not yet built)
