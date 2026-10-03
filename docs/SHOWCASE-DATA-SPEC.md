# TutuStay — Showcase Data & Content Spec

What the product actually is, and what the demo data and showcase copy must look like
for `/showcase` (and the social cards) to read as true.

Verified against the codebase on **2026-09-22**. Every number below was counted from
source, not carried over from an earlier doc.

---

# Part 1 · The product

## One paragraph

TutuStay is a single-property operations cockpit for an independent hotel or guesthouse.
It is a **take-rate marketplace**, not a licence sale: the platform earns a **12% commission**
(`COMMISSION_RATE`) on completed stays, so the product's whole job is to move demand through
one loop — *request → reservation → settlement* — without anything falling out along the way.
The manager persona is operationally expert but not revenue-management fluent, which is why
22 jargon terms sit behind inline `(i)` tooltips.

## The core loop — the one thing the showcase must teach

```
BOOKING REQUEST          RESERVATION                      SETTLEMENT
Pending                  Confirmed                        Pending
Approved      ─approve─▶ Checked-in       ─check-out─▶     Processing
Declined                 Checked-out                      Paid
                         Cancelled                        On hold
                         No-show
                         + payment: Paid | Unpaid
```

Three status vocabularies, one colour grammar. Settlements are **derived**, not authored:
`settlements-data.ts` buckets checked-out reservations into bi-weekly periods (1st–15th,
16th–end), applies commission, books cancellations as adjustments at
`CANCELLATION_REFUND_RATE` 50%, and pays out `PAYOUT_DELAY_DAYS` 2 days after the period
closes. `net = gross − commission − adjustments`.

That derivation is the strongest engineering story in the project: **change one reservation
and the money moves by itself.** The showcase currently buries it.

## Domain model

| Entity | File | Records | Key states |
|---|---|---:|---|
| Reservation | `reservations-data.ts` | 43 | Confirmed · Checked-in · Checked-out · Cancelled · No-show; payment Paid/Unpaid; rate Regular/Session/Weekend |
| Booking request | `booking-requests-data.ts` | 6 | Pending · Approved · Declined |
| Settlement | `settlements-data.ts` | *derived* | Paid · Processing · Pending · On hold |
| Customer | `customers-data.ts` | 7 | Active · Inactive |
| Review | `reviews-data.ts` | 6 | hide: none · pending · hidden |
| Coupon | `coupons-data.ts` | 9 | Active · Pending review · Scheduled · Rejected · Expired · Disabled |
| Employee | `agents-data.ts` | 9 | — |
| Property | `hotel-data.ts` | 1 | Draft · Submitted · Approved · Rejected |

Two-sided moderation is a real and under-sold feature: coupons and review-hiding both need
super-admin approval, and a live listing distinguishes a content edit that triggers re-review
from a housekeeping edit that doesn't.

## Shipped IA (sidebar, 12 destinations)

```
OVERVIEW    Dashboard · Sales Calendar
TEAM        Employee Management · Customer Management · Customer Reviews
HOTEL       Room Management · Reservation Management · Booking Requests
MARKETING   Coupon Management
FINANCE     Settlement
—           Property setup (progress ring) · Dev Handoff
```

## What is real vs. staged

**Real:** KPI maths (Occupancy, ADR, RevPAR, in-house guests are computed live from
reservations in `Dashboard.tsx`); settlement derivation; 3-tier token architecture;
i18n across en/ko/my; resizable sidebar and table columns; the 8-step setup wizard.

**Not real — never imply otherwise:** MSW is wired but `handlers.ts` exports an empty array,
so nothing is intercepted; react-query is mounted with zero `useQuery` calls; dark mode has a
`.dark` block but no toggle and no Tier-2 values; `@dnd-kit` appears only in unrouted legacy
survey code. State is in-memory and resets on refresh.

---

# Part 2 · What's wrong with the data today

Five defects, all confirmed in source. The first is disqualifying for a showcase.

### 🔴 1. The dataset is 81 days stale, and decays further every day

| Dataset | Span | vs today (2026-09-22) |
|---|---|---|
| Reservation check-ins | 2026-05-12 → 2026-06-30 | ended 84 days ago |
| Reservation check-outs | 2026-05-15 → 2026-07-03 | ended 81 days ago |
| Requests | 2026-06-01 → 2026-06-15 | ended 99 days ago |
| Reviews | 2025-12-20 → 2026-05-29 | ended 116 days ago |

`Dashboard.tsx:114` ticks on real `new Date()`, and the Reservations filters
(`Today`, `Next 7 days`, `Next 30 days`) resolve against real today. So the hero screen of
the product currently renders **0 rooms tonight, 0 in-house guests, an empty arrivals feed,
and empty date filters.** 6 of 9 coupons have already expired; a 7th expires in 8 days.

**Fix:** seed relative to `new Date()`, not absolute ISO strings. Define one `DEMO_TODAY`
anchor and express every date as an offset from it, so the demo is evergreen and the
dashboard always has a tonight.

### 🔴 2. Dangling foreign keys

Reservations reference `c1…c9`, but `customers-data.ts` only defines `c1…c7`.
**`c8` and `c9` point at customers that do not exist** — any cross-navigation from those
reservations dead-ends.

### 🟠 3. The repeat-guest story cannot be demonstrated

43 reservations carry **43 distinct guest names** — not one repeat. Only 10 of 43 have a
`customerId` at all. Yet the glossary defines *"Repeat guest: a customer with more than one
completed booking"* and the product ships a **Repeat customers** KPI. The feature is real;
the data can't show it.

### 🟠 4. The market story contradicts the money layer

Burmese locale (`my.json`), KBZPay and uab bank logos in `assets/logos/banks/`, and
`country: 'Myanmar'` on the demo property all say **Myanmar**. But `currency.ts` ships
`KRW | USD | JPY | EUR` with **`DEFAULT_CURRENCY = 'KRW'`** — no MMK — and the settlement
payout method reads `Bank transfer · KB ••3921`. Guest names are uniformly Western
(Daniel Foster, Sofia Marin, Elena Rossi). A reviewer who looks twice sees a product that
doesn't know where it operates.

**Pick one market and make everything agree.** If Myanmar: add MMK, default to it, use
Burmese guest names, keep KBZPay/uab. If Korea: drop the Burmese locale and bank logos.

### 🟡 5. Dataset volumes are uneven

43 reservations against 6 requests, 6 reviews, 7 customers. Screens with 6 rows look like
unfinished features next to a 43-row table, and they make filters, pagination, and empty
states impossible to demonstrate.

---

# Part 3 · What the showcase data should be

## Volume targets

| Dataset | Now | Target | Why |
|---|---:|---:|---|
| Reservations | 43 | 40–60 | Enough to fill a month grid and paginate |
| Booking requests | 6 | 12–15 | 5–7 Pending, so the decision queue has weight |
| Customers | 7 | 25–30 | Every `customerId` resolves; repeat guests possible |
| Reviews | 6 | 18–24 | Makes response-rate KPI meaningful |
| Coupons | 9 | 9 | Fine — fix the date windows |
| Employees | 9 | 9 | Fine |

## Composition rules

1. **Anchor every date to a rolling `DEMO_TODAY`.** Target shape: ~8 stays in house tonight,
   3–5 arrivals today, 2–3 departures today, one *Overdue* (checkout passed, not checked out)
   so the status is demonstrable, and 4–6 weeks of forward bookings so the calendar isn't bare.
2. **Referential integrity is non-negotiable.** Every `customerId` resolves. Add `c8`/`c9` or
   repoint them.
3. **Seed repeat guests deliberately.** 5–6 customers with 2–4 completed stays each, so
   *Repeat customers* and customer lifetime value are non-zero.
4. **Spread statuses across the whole enum.** Every status a filter offers should match at
   least one row — including No-show and On hold.
5. **Keep coupon windows relative** so nothing is pre-expired, and keep one of each derived
   status live: Active, Scheduled, Pending review, Rejected, Expired.
6. **Names and places must match the chosen market**, and reviews should read like a real
   guest wrote them — specific, occasionally three stars. All-5-star demo data reads fake.
7. **Make money internally consistent.** Amounts ÷ nights should land on a believable nightly
   rate per room type, and room-type rates should actually produce the ADR the dashboard shows.

---

# Part 4 · Verified claim inventory

Safe to publish — counted from source on 2026-09-22.

| Claim | Number | Source |
|---|---:|---|
| Route entries | 32 | `routes.ts` (31 excl. catch-all; **23 are hotel-domain** — 4 are survey-fork orphans) |
| Reusable components | 25 | `src/shared/ui/` |
| CSS custom properties | 336 | `theme.css` |
| `--color-*` tokens | 221 | `theme.css` |
| Zustand stores | 11 | imports of `zustand` |
| Glossary definitions | 22 | `glossary.ts` |
| Languages | 3 | en · ko · my |
| Currencies · date formats | 4 · 5 | `currency.ts`, `date-format.ts` |
| Setup wizard steps | 8 | `HotelSetupPage` |
| Commission rate | 12% | `COMMISSION_RATE` |
| Total TS/TSX lines | 43,412 | incl. unrouted legacy; **~32,900** hotel-only |

**Correction to earlier docs:** `SHOWCASE-COPY.md` states 16 glossary terms — it is 22.
It also describes the market as *"Myanmar (MMK currency)"*; **MMK does not exist in the
codebase.** Fix that line before reusing the doc.

## Never claim

No user counts, no ratings, no revenue processed, no "trusted by N hotels", no App Store
metrics, no before/after percentages. TutuStay is **unshipped with zero production
telemetry**; any such number is invented. Impact must be labelled *projected* and paired
with how it would be measured.

---

# Part 5 · Social cards (the Instagram-style format)

The reference format — one oversized number, one short claim — works, but the reference
copy ("500k+ happy customers") is exactly the fabrication banned above. Use **build facts
and product mechanics**, which are just as concrete and are true:

| Number | Line | Backing |
|---|---|---|
| **12%** | The commission, shown to the hotel in full | `COMMISSION_RATE`, settlement breakdown |
| **221** | Colour tokens, one semantic layer | `theme.css` |
| **3** | Statuses, one shared vocabulary | request / reservation / settlement enums |
| **22** | Terms of jargon, defined inline | `glossary.ts` |
| **8** | Steps from signup to a live listing | setup wizard |
| **EN·KO·MY** | Three languages, one interface | `i18n.ts` |

Card grammar: number in the display serif at ~30% of card height, claim in one line beneath,
product mark bottom-left, no stock photography of people the product has never had.
One fact per card — the reference's biggest strength is that it never puts two numbers
on one card.

---

*Owner: design direction. Source of truth is the code — re-verify counts before publishing.*
