# MissingCash

An Australian unclaimed-money search service: helps people find money held by the ATO, ASIC, and banks, with guidance on claiming it, a crypto-recovery section, a Stratton-style finance/loans page, and "Mia", a site-wide AI assistant.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Frontend (React + Vite + Wouter + Tailwind + shadcn + framer-motion): `artifacts/missingcash/`
  - Pages: `src/pages/` (Home, Crypto, Finance, Contact, Privacy)
  - SEO: `src/hooks/use-page-seo.ts` (sets title/description/keywords/OG/Twitter meta per page)
  - Mia chat widget: `src/components/MiaChat.tsx`, mounted site-wide in `src/components/layout/Layout.tsx`
- API (Express 5, routed at `/api` via shared proxy): `artifacts/api-server/`
  - Mia chat route: `src/routes/mia.ts`; system prompt/knowledge: `src/lib/mia-knowledge.ts`
- API contract (source of truth): `lib/api-spec/openapi.yaml` → codegen into `lib/api-zod` (zod) and `lib/api-client-react` (hooks)
- OpenAI integration wrapper lib: `lib/integrations-openai-ai-server`

## Architecture decisions

- Mia is a **stateless** assistant: no DB tables for conversations/messages. The client holds history and POSTs the full `messages` array each turn; the server streams a response. SSE endpoints are documented in the OpenAPI spec but have no generated response hook (codegen can't model SSE) — the client parses with `fetch` + manual SSE parsing.
- Mia uses the Replit OpenAI integration (model `gpt-5.4`, billed to Replit credits) — no user-supplied API key.
- The public `/mia/chat` endpoint has in-memory per-IP rate limiting (15 req/min) and aborts the upstream stream on real client disconnect (`res.on('close')`).
- Request-body component schemas in the OpenAPI spec use an `Input` suffix (e.g. `MiaChatInput`) to avoid an orval barrel name collision (see `.agents/memory/orval-barrel-name-collision.md`).

## Product

- **Home**: hero search-to-find unclaimed money (ATO/ASIC/banks) with trust signals.
- **Crypto**: lost/inaccessible crypto recovery guidance.
- **Finance**: Stratton-style loans/finance page (Erin Crofton, Wanneroo/Perth, ACL 364340) with imagery, loan-type cards, FinancialService JSON-LD, and finance-targeted SEO.
- **Contact / Privacy**: standard support and policy pages.
- **Mia**: site-wide floating AI assistant — finds unclaimed money, gives claim guidance, handles Stratton finance enquiries, and answers FAQs.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
