---
name: MissingCash finance lead emails (Resend)
description: Which from-address sends, what's verified, and what gates the branded sender + Erin CC.
---

Lead emails send via Resend (`RESEND_API_KEY`). **`lensflow.com.au` IS verified and sending works in production** — confirmed by a live `POST /api/finance/enquiry` returning `emailSent:true`. Leads currently send FROM `leads@lensflow.com.au` TO `admin@missingcash.com.au`, `replyTo` = customer. The send runs independently of the DB insert (resilient: 201 if either path succeeds), so an email failure no longer blocks the lead.

**Not yet verified:** `missingcash.com.au` (the branded sender). Verifying it (add DKIM/SPF DNS records) is required before switching to an `@missingcash.com.au` from-address AND before CC'ing Erin — compliance: Stratton leads must originate from missingcash, not lensflow (see stratton-integration.md).

**The switch is one env flag:** set `MISSINGCASH_DOMAIN_VERIFIED=true` and redeploy AFTER the domain shows Verified in Resend → branded `leads@missingcash.com.au` sender + Erin CC turn on together. Do NOT flip it before verification or sends fail.
