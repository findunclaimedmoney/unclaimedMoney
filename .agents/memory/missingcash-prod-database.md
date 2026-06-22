---
name: MissingCash production database (connected via Publish)
description: How the prod DB gets connected and the only correct way to change its schema.
---

The production database is connected through Replit's **Publish flow** — publishing provisions/migrates the prod DB; the agent must never script prod migrations, add startup DDL, or push schema in the deploy build (see database-migrations-on-publish reference).

**Verified working in production (June 2026):** prod DB has tables `email_alerts`, `finance_enquiries`, `search_submissions`; a live `POST /api/finance/enquiry` returned `{success,enquiryId,emailSent:true}` and the row landed in the prod DB. So the lead pipeline (DB write + email) works end-to-end on the live site.

**Earlier failure mode to remember (now resolved):** before the prod DB was connected, DB-writing routes 500'd because `DATABASE_URL` pointed at a dev-only single-label host (`helium`/`heliumdb`) that doesn't resolve inside deployments (`getaddrinfo EAI_AGAIN helium`), so leads were lost. The fix was always **re-publish**, never a migration script.

**Also:** a live deployment can serve STALE code/data until re-published (e.g. an old phone number lingered in the live error message after the workspace code was fixed). Re-publishing ships the latest code too.

**Note on test data:** prod `finance_enquiries` contains agent test rows (clearly marked TEST/IGNORE). Production is read-only via `executeSql({environment:"production"})`, so the agent cannot DELETE prod rows — cleanup needs a dev-side path or an in-app admin action, not the prod query tool.
