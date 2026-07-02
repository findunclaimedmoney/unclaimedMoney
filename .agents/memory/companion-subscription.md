---
name: Companion subscription model
description: Stripe subscription tiers, paywall logic, and HeyGen video call for the AI Companion app.
---

## Tiers
- Free: text only, Mia/Alex, no custom persona
- Spark $9.99/mo: voice (200/month), 1 custom persona from photo
- Flame $19.99/mo: unlimited voice, 3 custom personas, HeyGen video calls

## Stripe products
- Seeded with `companion_tier: "spark"` / `"flame"` metadata via `scripts/src/seed-companion-products.ts`
- Checkout looks up price by metadata — no hardcoded price IDs needed

## DB
- `companion_subscribers` table: email (UNIQUE PK), stripe_customer_id, stripe_subscription_id, tier, active, voiceMessagesThisMonth, voiceMonthResetAt
- Email-based — no auth, user enters email to activate on any device

## Backend routes (all under /api/companion/subscribe/*)
- POST checkout → { tier, email? } → Stripe checkout URL
- POST verify → { sessionId } → reads Stripe session, saves subscriber to DB
- POST status → { email } → returns { tier, active, voiceRemaining, voiceLimit }
- POST portal → { email } → Stripe billing portal URL

## Webhook
- `stripe-webhook.ts` now handles `customer.subscription.created/updated/deleted` → calls `handleCompanionSubscriptionWebhook` in companion-subscribe.ts

## Frontend
- `use-subscription.ts` hook: manages status, checkout, verify (handles ?session_id on load), portal
- `Pricing.tsx`: 3-tier comparison page + "already subscribed? enter email" activation flow
- `PersonaSelect.tsx`: Crown + lock on custom persona if !canUseCustomPersona
- `ChatScreen.tsx`: voice mic shows Crown icon + paywall modal if !canUseVoice; video call button (Video icon in header) for Flame only

## HeyGen video call
- POST /api/companion/video → { text, personaId }
- Uses avatar `05f1da4dc12744c087dace9e0651a6e0` for all personas (only one avatar ID available)
- Polls every 3s up to 40 attempts (~2 min timeout)
- Frontend shows overlay with autoplay video; loading spinner in header while generating

**Why:** No auth system — email-based ties subscription to user without login friction. Race condition between webhook and verify is handled: verify creates subscriber if webhook hasn't fired yet.
