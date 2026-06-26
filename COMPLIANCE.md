# MissingCash — Compliance & Legal Basis Document

**Business:** MissingCash  
**ABN:** 52 347 989 391  
**Contact:** support@missingcash.com.au  
**Last updated:** 2026-06-26  

---

## 1. What MissingCash Does

MissingCash is a private Australian service that:

1. Searches the publicly available ASIC MoneySmart Unclaimed Money Register (`https://moneysmart.gov.au/find-unclaimed-money`) for names that appear to have unclaimed money.
2. Attempts to locate publicly available contact details for those individuals via Google, Yellow Pages AU, and the Australian Business Register (`abr.business.gov.au`).
3. Sends a single unsolicited commercial email notifying that individual that their name appears on the government register, with an upfront fee disclosed to unlock personalised claim instructions.
4. Provides claim guidance to paying customers on how to claim money held on their behalf by the Australian government.

---

## 2. Data Sources — All Public

| Source | URL | What we take |
|--------|-----|-------------|
| ASIC MoneySmart Unclaimed Money Register | https://moneysmart.gov.au/find-unclaimed-money | Name, amount, holder, state — all publicly published by ASIC |
| Australian Business Register | https://abr.business.gov.au | Suburb/state for address verification |
| Yellow Pages AU | https://www.yellowpages.com.au | Publicly listed phone and address |
| Google Search | https://www.google.com.au | Publicly indexed contact information |

**We do not access, purchase, or use any private, hacked, or non-public data.**

---

## 3. Australian Spam Act 2003 Compliance

The _Spam Act 2003_ (Cth) requires commercial electronic messages to:

| Requirement | How MissingCash complies |
|------------|--------------------------|
| **Sender identification** | Every email identifies "MissingCash \| ABN 52 347 989 391 \| support@missingcash.com.au" |
| **Unsubscribe mechanism** | Every outreach email contains a working one-click unsubscribe link (`/unsubscribe?e=...`) |
| **Unsubscribe honoured within 5 business days** | Unsubscribe requests are processed immediately and permanently recorded in the database |
| **Not sent to unsubscribed addresses** | Pipeline checks `unsubscribes` table before sending any email |
| **Accurate sender information** | Sent from verified domain; `reply-to` is `support@missingcash.com.au` |

---

## 4. Privacy Act 1988 Compliance

MissingCash handles personal information under the _Privacy Act 1988_ (Cth) and the Australian Privacy Principles (APPs):

- **APP 3 — Collection:** We collect only name, amount, and holder from a public government register. Contact details (email/phone) are sourced from publicly available directories.
- **APP 5 — Notification:** The outreach email itself constitutes notification of collection, explaining what data we hold and why we contacted them.
- **APP 6 — Use:** Data is used only to notify the individual of their potential unclaimed money and deliver claim instructions if they pay.
- **APP 11 — Security:** Data is stored in an encrypted PostgreSQL database. Outreach is sent via Resend (an enterprise email provider).
- **APP 12 — Access:** Individuals may request all data held about them by emailing support@missingcash.com.au. We will respond within 30 days.
- **APP 13 — Correction:** Individuals may request correction or deletion of their data by emailing support@missingcash.com.au.

**Unsubscribe = deletion request:** Any person who unsubscribes is removed from future outreach and their email is permanently blocked from receiving further commercial messages.

---

## 5. Australian Consumer Law — No Misleading Conduct

Under the _Competition and Consumer Act 2010_ (Cth), Schedule 2 (Australian Consumer Law):

- **We do not guarantee** that the money listed on the register belongs to the recipient. Emails state it "appears to belong" to them.
- **Fees are disclosed upfront** — the exact dollar amount is shown before payment. No hidden fees.
- **We do not provide financial advice.** We provide claim instructions (procedural guidance) only.
- **Data source is always disclosed** — emails state the money was found on "the national unclaimed money registers" (ASIC MoneySmart).

---

## 6. ASIC / Financial Services

MissingCash does **not** hold an Australian Financial Services Licence (AFSL) and does not provide financial product advice. We:

- Do not manage money on behalf of customers.
- Do not advise on financial products.
- Provide procedural claim instructions (how to fill in government forms) — this is not financial advice.

For finance referrals, MissingCash refers customers to Stratton Finance Pty Ltd (ACL 364340), a licensed credit provider. MissingCash discloses any financial benefit received from referrals.

---

## 7. Fee Structure — Disclosed Upfront

| Amount Found | Fee | Basis |
|-------------|-----|-------|
| $250 – $1,000 | 5% | Success-based |
| $1,001 – $5,000 | 10% | Success-based |
| $5,001 – $30,000 | 15% | Success-based |
| $30,001 – $100,000 | 20% | Success-based |
| $100,001+ | 33% | Success-based |

Fees are paid **before** claim instructions are released. The fee structure is fixed and disclosed in full in every outreach email before payment is requested.

---

## 8. Audit Trail

Every outreach email sent by MissingCash is permanently recorded in the database with:

- Full name as it appears on the ASIC register
- Dollar amount and holder as published by ASIC
- Recipient email address and how it was found (source)
- Date and time the email was sent (UTC)
- Exact subject line and full body text of the email
- Stripe session ID for the payment checkout created
- Unsubscribe status

A dated CSV export of all outreach records is available at any time from the admin dashboard (`⬇ Audit CSV`).

---

## 9. Contact for Regulatory Inquiries

**MissingCash**  
ABN 52 347 989 391  
Email: support@missingcash.com.au  
Website: https://missingcash.com.au  

For privacy requests, complaints, or regulatory inquiries, email support@missingcash.com.au. We will respond within 5 business days.

---

_This document is maintained as a living record and updated whenever business practices change._
