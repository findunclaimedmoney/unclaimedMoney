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
- Custom components: `UnclaimedTicker` ($2.6B base, ticks every 100ms), `EmailAlertSignup` (firstName + state + email, posts to `/api/alerts/subscribe`), `MiaChat` (framer-motion, streaming SSE, video avatar, listens to `mia:open` CustomEvent, posts to `/api/mia/chat`), `TrustTicker` (CSS marquee with trust signals), `NavBar` (shield logo, Sign Up bell, Get Finance CTA)
- `usePageSEO` hook in `src/hooks/use-page-seo.ts` — sets document.title and meta tags
- UI components copied from Glimr (`src/components/ui/`)
- Static assets (PDFs, videos, images) remain in `public/` and are served by Vite at root paths
- GA4: G-1LLNFV2MEQ (in index.html)
- `src/pages/Finance.tsx` line 1 had `4q` corruption removed; file was also truncated at line 320 mid-JSX — reconstructed with loan calculator + enquiry form sections

**Sharp edges:**
- Finance.tsx was truncated in the user's upload — always check Finance page if rebuilding
- `mia-avatar.png` exists in public/ (903×899 PNG, real headshot); MiaChat AVATAR points to it. AVATAR_VIDEOS use `mia-talk.mp4` + `mia.mp4`
- Mia chat expects streaming SSE from `POST /api/mia/chat` — not yet built in api-server; fails gracefully
- Email alerts expect `POST /api/alerts/subscribe` — not yet built
- framer-motion causes "duplicate React instance" error unless `vite.config.ts` has `resolve.dedupe: ["react", "react-dom", "framer-motion"]` AND `optimizeDeps.include: ["react", "react-dom", "framer-motion"]`
- AVA GENIUS zip extracts to a single 707KB `index.html` → saved as `public/ava-genius.html`
