# TutuStay — Hotel Manager Dashboard
### Product Design Case Study & UX Audit · Executive Edition

> A visual, stakeholder-ready teardown of the product, its UX, its design system, and its portfolio strength.
> Prepared in the voice of a Design Director for executives, stakeholders, and portfolio reviewers.

---

## 📌 At-a-Glance Scorecard

| Dimension | Rating | One-line verdict |
|---|:---:|---|
| **Product Strategy** | ●●●●○ | Clear take-rate model; own the booking→payout loop |
| **Information Architecture** | ●●●●● | Grouped by operator mental model — genuinely strong |
| **UX / Flows** | ●●●○○ | Great bones, but no first-run & jargon-heavy |
| **UI / Visual Craft** | ●●●●○ | Calm, flat, confident — polished |
| **Design System (foundation)** | ●●●●● | 3-tier tokens, self-audited — senior-grade |
| **Design System (component layer)** | ●●○○○ | Token-rich, component-poor — consistency by copy-paste |
| **Accessibility** | ●●○○○ | Color-only status, inconsistent focus, broken dark mode |
| **Onboarding & Comprehension** | ●●●○○ | Strong wizard exists but under-surfaced |

**Legend:** ●●●●● Excellent · ●●●●○ Strong · ●●●○○ Average · ●●○○○ Weak · ●○○○○ Poor

---

## 🧭 Reader's Map

| # | Section | Headline Visual |
|---|---|---|
| 1 | Product Understanding | Business ↔ User objectives table |
| 2 | UX Analysis | Journey map + user-flow diagram |
| 3 | Product Thinking | Feature priority matrix |
| 4 | UI Analysis | Screen inventory + IA diagram |
| 5 | Design System | Token table + component inventory |
| 6 | Heuristic Evaluation | Nielsen scorecard |
| 7 | SWOT | Four-quadrant |
| 8 | Case Study | Problem→Impact cards |
| 9 | Portfolio Review | Maturity ladder |
| 10 | Roadmap | Prioritized timeline |

---

# 1 · Product Understanding

**Executive Summary** — TutuStay is a single-property operations cockpit for independent hotel/guesthouse owners in **Myanmar** (MMK currency; Burmese + Korean locales). It is a **take-rate marketplace**: the product's job is to convert scattered demand into completed, paid stays — because that's where commission is captured.

### Business ↔ User Objectives

| | 🎯 Business Objective | 🙋 User Objective | 📊 Success Metric |
|---|---|---|---|
| **Acquire** | Activate new properties → live | "How do I start?" | Setup completion %, time-to-live |
| **Convert** | Max booking throughput (GMV) | Don't lose bookings | Request→approval rate |
| **Monetize** | Capture commission per stay | Understand my earnings | Dispute rate, payout clarity |
| **Retain** | Lock-in via payouts + data | Run my day in one place | DAU/WAU, return rate |

### ⭐ North-Star Candidate

```
  Weekly completed, paid room-nights per active property
  └─ captures activation × engagement × monetization in one number
```

**Key Insights**
- 🔑 The product is **capability-ahead, comprehension-behind** — features exceed most early-stage SaaS; orientation lags.
- 🔑 Primary persona (independent owner) is **operationally expert but not revenue-management fluent** — the core design tension.

**Recommendations**
- ✅ Instrument the North-Star + activation funnel before adding features.
- ✅ Treat comprehension (jargon, money clarity) as a first-class metric, not polish.

---

# 2 · UX Analysis

**Executive Summary** — The IA and repeating screen grammar make the product learnable from one screen. The journey is well-modeled but **never taught**, and bare jargon erodes trust in the numbers.

### 🗺️ User Journey Map — Owner-Operator

| Stage | 1 · Set Up | 2 · Receive | 3 · Decide | 4 · Fulfill | 5 · Get Paid |
|---|---|---|---|---|---|
| **Action** | Complete 6-step wizard | Booking request lands | Approve / Decline | Check in → Check out | Review settlement |
| **Screen** | Setup Hub | Booking Requests | Booking Requests | Reservations | Settlements |
| **Emotion** | 😟 "Where do I start?" | 🙂 "A booking!" | 😐 "What happens if I approve?" | 😬 "What's *Overdue*?" | 🤔 "Gross vs net?" |
| **Friction** | Wizard hidden in sidebar ring | — | No consequence messaging | Status undefined | Finance jargon undefined |
| **Opportunity** | Surface as dashboard checklist | Demo-data label | Success/consequence toast | Status legend + tooltip | Glossary on money terms |

### 🔀 Flow · Core Value Chain

```
  ┌──────────────┐   approve    ┌──────────────┐   check-out   ┌──────────────┐
  │   BOOKING     │ ───────────▶ │  RESERVATION  │ ───────────▶ │  SETTLEMENT   │
  │   REQUEST     │              │  (Confirmed)  │              │  (Net payout) │
  └──────────────┘              └──────────────┘              └──────────────┘
        │ decline                      │ no checkout                   │
        ▼                              ▼                               ▼
     Notify guest                  ⚠ OVERDUE                     gross − commission
                                                                  − adjustments
  ⚠ This entire chain is NEVER explained to the user in-product.
```

### Pain → Need → Solution

| 😣 Pain Point | 🎯 Underlying Need | 🛠️ Product Response | Status |
|---|---|---|---|
| Ops scattered across WhatsApp/paper | "What needs me today?" | Dashboard day-at-a-glance | ✅ Solved |
| Bookings slip away | Convert demand fast | Booking Requests queue | ✅ Solved |
| Pricing is complex | Model nightly/session/weekend | Room-Type editor (live preview) | ✅ Excellent |
| Money is opaque | "What do I earn, when?" | Settlement gross→net breakdown | ✅ Solved |
| No idea what to do first | Orientation | Setup wizard *(under-surfaced)* | ⚠ Partial |
| Bare jargon & statuses | Comprehension | Glossary tooltips *(now extended)* | ⚠ In progress |

**Key Insights**
- 🔑 The **request→reservation→settlement** mental model underlies half of all user confusion — and is invisible.
- 🔑 Friction clusters at **transitions** (approve, check-out, payout), not within screens.

**Recommendations**
- ✅ Teach the value chain once (3-slide intro) → resolves downstream confusion cheaply.
- ✅ Add consequence messaging at every irreversible transition.

---

# 3 · Product Thinking

**Executive Summary** — Strategy is **"own the loop to earn the right to own the money."** Scope discipline is good: single-property, no premature OTA/multi-property sprawl.

### 🎛️ Feature Priority Matrix (Value × Effort)

```
  HIGH VALUE
     │  Booking Requests ●        ● Settlements
     │  Setup Wizard ●            ● Room-Type Pricing
     │           Dashboard ●
     │                              ● Reviews
     │   Coupons ●        ● Customers
     │                    ● Employees
     │  ────────────────────────────────────────
     │        (deferred) Channel/OTA sync ○
     │        (deferred) Multi-property ○
  LOW VALUE
     └──────────────────────────────────────────
       LOW EFFORT                      HIGH EFFORT
```

### Per-Feature Decision Ledger

| Feature | Why built | Solves (User) | Solves (Business) | Measured by |
|---|---|---|---|---|
| **Booking Requests** | Convert demand fast | Don't lose bookings | GMV throughput | Approval rate |
| **Settlements** | Money transparency | "What did I earn?" | Trust = lock-in | Dispute rate |
| **Room-Type Pricing** | Model complex rates | Price right | Higher ADR → fee | Rate completeness |
| **Setup Wizard** | Activation | "How do I start?" | Signup → live | Completion % |
| **Coupons** | Fill soft demand | Fill slow weeks | Stimulate GMV | Redemption lift |
| **Reviews** | Reputation loop | Manage my rep | Marketplace trust | Response rate |
| **Employees** | Delegation | Staff help safely | Stickier accounts | Seats/property |

### MoSCoW Scope

| Must (the loop) | Should (trust) | Could (growth) | Won't (yet) |
|---|---|---|---|
| Requests · Reservations · Calendar · Pricing · Settlements · Setup | Reviews · Customers · Employees · Settings · Help | Coupons · Occupancy forecast | OTA sync · Multi-property · Messaging · Native app |

**Key Insights**
- 🔑 **Settlement transparency** is a strategic trust bet — showing the take-rate reduces dispute load.
- 🔑 **Approval-gated coupons** trade autonomy for brand control — sound decision, disclosed too late.

**Recommendations**
- ✅ Keep deferring OTA/multi-property — scope discipline is a strength.
- ✅ Move coupon-approval expectation *before* the form, not at submit.

---

# 4 · UI Analysis

**Executive Summary** — One repeating screen grammar gives the product a consistent rhythm: learn one screen, learn them all.

### 🧱 The Screen Grammar (the product's strongest UI decision)

```
  ┌─────────────────────────────────────────────┐
  │  Title (h1)  +  one-line subtitle            │  ← orientation
  ├─────────────────────────────────────────────┤
  │  [ KPI ]  [ KPI ]  [ KPI ]  [ KPI ]          │  ← "how am I doing"
  ├─────────────────────────────────────────────┤
  │  🔍 search   ▾ filter   ▾ filter   📅 range  │  ← narrow
  ├─────────────────────────────────────────────┤
  │  Table / Card list  ───▶  Detail or SideSheet│  ← act
  └─────────────────────────────────────────────┘
```

### 🗂️ Information Architecture

```
  TutuStay
  ├── 📊 OVERVIEW   → Dashboard · Sales Calendar
  ├── 👥 TEAM       → Employees (Agents)
  ├── 🏨 HOTEL      → Rooms · Room Types · Reservations · Booking Requests
  ├── 📣 MARKETING  → Coupons · Reviews · Customers
  ├── 💰 FINANCE    → Settlements
  └── ⚙️ ACCOUNT    → Settings · Help · [Dev Handoff ⚠ remove from prod]
```

### Screen Inventory & Task Fit

| Screen | Primary Task | Pattern | Craft | Risk Flag |
|---|---|---|:---:|---|
| Dashboard | Daily triage | KPI + charts + feed | ●●●●○ | ADR/RevPAR jargon |
| Sales Calendar | Forecast demand | Month grid + day sheet | ●●●●● | "Room-nights" |
| Booking Requests | Decide fast | Decision card queue | ●●●●● | No consequence msg |
| Reservations | Track fulfillment | Table + rate chips | ●●●●○ | "Overdue" no remedy |
| Room-Type Editor | Price rooms | Form + live preview | ●●●●● | Type vs Room model |
| Settlements | Verify money | KPI + charts + table | ●●●●○ | Finance jargon |
| Setup Wizard | Activate | 6-step + progress ring | ●●●●● | Under-surfaced |
| Help | Self-serve support | Search + categories | ●●●●○ | No deep-links in |

### Design Principles Applied

| Principle | Where | Effect |
|---|---|---|
| Progressive disclosure | Overview → filter → detail | Reduces cognitive load |
| Recognition over recall | Calendar, rate chips, grouped nav | Less memory burden |
| Glanceability | `text-3xl` tabular KPIs | 5-second triage |
| Goal-gradient | Setup progress ring | Drives completion |
| Hick's Law | Approve/Decline (2 choices) | Fast decisions |

**Key Insights**
- 🔑 Consistency is the product's biggest usability asset — and its biggest *maintenance risk* (enforced by discipline, not code).
- 🔑 Side-sheet vs full-page split is well-judged: peeks vs heavy records.

**Recommendations**
- ✅ Remove "Dev Handoff" from production nav (XS effort).
- ✅ Add a "Type vs Room" explainer — the single biggest conceptual hurdle.

---

# 5 · Design System Audit

**Executive Summary** — A **senior-grade foundation** (3-tier tokens, self-documented) sitting under a **junior-grade component layer**. The bones are excellent; the muscle isn't built.

### 🏗️ Token Architecture

```
  Tier 1 · PALETTE      --color-base-{ramp}-{step}     13+ ramps, theme-invariant
              ↓ aliased by
  Tier 2 · SEMANTIC     --brand-primary, --text-*, …   ← what UI references
              ↓ aliased by
  Tier 3 · SHADCN MAP   --primary, --background, …     adapter for Radix
  ───────────────────────────────────────────────────────────────────
  Re-theme the whole product = re-point Tier 2.  ✅ Correct architecture.
```

### Token Coverage Table

| Token Group | System | Maturity | Note |
|---|---|:---:|---|
| Color | 3-tier, 13+ ramps, status triplet | ●●●●● | Uniform tint+border+fg convention |
| Typography | ABC Diatype, 2-weight (400/500) | ●●●●○ | 10/11/13px steps un-tokenised |
| Spacing | 4px grid, ~zero arbitrary | ●●●●● | Exceptional discipline |
| Radius | 1 knob (`--radius: 14px`) | ●●●●● | `rounded-md` = 808 uses |
| Elevation | 11 ad-hoc shadows, no token | ●●○○○ | Flat-by-design; tokenise exceptions |
| Dark mode | Tier-3 only, Tier-2 missing | ●○○○○ | **Non-functional on real screens** |

### 🧩 Component Inventory — "Token-rich, component-poor"

| Reality | Count | Verdict |
|---|:---:|---|
| Token references across code | 5,000+ | ✅ Values well-systematised |
| `cva` Button primitive — **imports** | **0** | 🔴 Built then never adopted |
| Hand-rolled inline `<button>` | **412** | 🔴 Copy-paste consistency |
| `bg-white` / `text-white` literals | 485 / 162 | 🟠 Bypass tokens, break dark mode |
| Missing primitives (Card/Badge/Input/EmptyState) | — | 🟠 Re-implemented per page |
| `shadow-none` forced | 177 | ℹ️ Deliberate flat aesthetic |

**Key Insights**
- 🔑 Consistency today = **discipline, not construction** — the core maintainability risk.
- 🔑 Dark mode advertises a capability that doesn't exist — worse than absent.

**Recommendations (Impact ÷ Effort)**

| # | Action | Impact | Effort |
|---|---|:---:|:---:|
| R-1 | Wire dark mode at Tier-2 (or remove + document) | 🔴 | M |
| R-2 | Adopt the 0-import Button primitive | 🔴 | M |
| R-6 | Extract Card · Badge · Input · EmptyState | 🟠 | M |
| R-4 | Kill `bg-white`/`text-white` literals | 🟠 | S |
| R-3 | Add elevation tokens | 🟠 | S |

---

# 6 · Heuristic Evaluation (Nielsen's 10)

**Executive Summary** — Strong on consistency, control, and aesthetics; weak on feedback (silent actions), error recovery, and real-world language (jargon).

### Nielsen Scorecard

| # | Heuristic | Score | Evidence |
|---|---|:---:|---|
| 1 | Visibility of status | ●●●○○ | Pills/deltas ✅ but **no success toasts** |
| 2 | Match real world | ●●●○○ | IA ✅ but ADR/RevPAR/gross jargon |
| 3 | User control & freedom | ●●●●○ | Reset, confirm dialogs, dismissible sheets |
| 4 | Consistency & standards | ●●●●○ | Visual ✅; metric defs drift cross-screen |
| 5 | Error prevention | ●●●●○ | Form validation, confirm-on-delete |
| 6 | Recognition over recall | ●●●●○ | Strong; no global search |
| 7 | Flexibility & efficiency | ●●●○○ | Filters/export; few shortcuts/bulk |
| 8 | Aesthetic & minimalist | ●●●●● | Flat, calm, polished |
| 9 | Error recovery | ●●○○○ | "Overdue"/"On hold" name problems, no fix |
| 10 | Help & documentation | ●●●●○ | Real Help center; not deep-linked |

### ♿ Accessibility Flags

| Risk | Severity | Fix |
|---|:---:|---|
| Status by **color only** (no icon/legend) | 🔴 High | Add icon + text redundancy |
| Inconsistent focus on inline buttons | 🟠 Med | Adopt Button primitive |
| Dark mode non-functional | 🟠 Med | Wire Tier-2 or remove |
| Muted text contrast at small sizes | 🟡 Low | Spot-check WCAG AA |

**Key Insights** — 🔑 The two cheapest, highest-trust wins are **success toasts** and **glossary tooltips** (latter now extended across all KPI screens).

**Recommendations** — ✅ Toasts → ✅ status legend + icons → ✅ centralized metric/currency formatter.

---

# 7 · SWOT Analysis

| 💪 STRENGTHS | ⚠️ WEAKNESSES |
|---|---|
| • 3-tier token system + self-audit | • Component layer: 412 inline buttons, 0-import primitive |
| • IA grouped by operator mental model | • No first-run / orientation by default |
| • Consistent, learnable screen grammar | • Bare hotel/finance jargon; metric drift |
| • Settlement transparency (trust) | • Dark mode non-functional |
| • Polished, flat visual craft | • Silent actions (no success feedback) |
| **🚀 OPPORTUNITIES** | **🧨 THREATS / RISKS** |
| • Surface existing setup as checklist | • Trust erosion from inconsistent numbers (money product!) |
| • Always-on glossary (low cost, high trust) | • Maintainability debt from copy-paste consistency |
| • Status legends + icon redundancy | • Accessibility exposure (color-only, focus) |
| • Reuse Help center via deep-links | • Fork debt (iDap artifacts in repo/nav) |

---

# 8 · Case Study (Portfolio-Ready)

### Problem → Impact, as Cards

| 🎯 PROBLEM | Independent Myanmar property owners run ops on WhatsApp + paper — no source of truth for arrivals, confirmations, or money. |
|---|---|
| **🥅 GOAL** | One cockpit: 5-second triage · low-friction demand→payout loop · money legible to non-experts · a token system for fast, consistent shipping. |
| **🔬 RESEARCH** | Benchmarked Atlassian, Notion, Linear, Stripe, Airbnb, HubSpot. Cold first-run review: capabilities ahead of peers, comprehension scaffolding missing. |
| **💡 INSIGHTS** | (1) Assumes hotel fluency the persona lacks · (2) Mental model invisible · (3) Trust fragile (metric drift, no currency) · (4) Activation funnel hidden · (5) Silent actions. |
| **🎨 SOLUTION** | Consistent screen grammar · decision-queue for requests · live-preview pricing · transparent settlement · layered onboarding that *surfaces existing capability*. |
| **🛠️ PROCESS** | Domain model → IA → visual language → 3-tier tokens → screen templates → hi-fi on mock API → heuristic audit → prioritized roadmap. |
| **🧱 DESIGN SYSTEM** | 3-tier tokens, one radius knob, 4px grid, status triplet, machine-readable `tokens.json`. |
| **📈 IMPACT (projected)** | Activation ↑ (setup-as-checklist) · comprehension ↑ (inline glossary) · trust ↑ (one formatter) · velocity ↑ (component adoption). *Label as projected — no production telemetry.* |

### ✅ Shipped in This Engagement (verified)

- [x] Extended always-on glossary `(i)` tooltips to **5 KPI screens** (Calendar, Customers, Reviews, Booking Requests, Coupons)
- [x] Added 3 missing definitions (Response rate, Pending value, Redemptions)
- [x] Verified in-browser: correct icon per metric, correct copy, correct positioning
- [x] `npm run typecheck` clean · recorded as a reusable codebase convention

---

# 9 · Portfolio Review — Maturity Ladder

```
  LEAD / PRINCIPAL   ❌  Needs real user research, measured impact, cross-functional influence
        ▲
  SENIOR PD          ⚠️  Clears WITH the right write-up (research→insight→decision + projected metrics)
        ▲
  MID-LEVEL          ✅  Clears comfortably — coherent product, real system, working flows
        ▲
  JUNIOR             ✅  Far exceeds — polish, token literacy, real components
```

### What Reads Senior vs Junior

| ✅ Feels Senior | ⚠️ Feels Junior |
|---|---|
| 3-tier token architecture | 0-import primitive + 412 inline buttons |
| IA & activation-funnel thinking | Half-wired (broken) dark mode |
| Self-authored design-system audit | Cross-screen metric inconsistency |
| "Surface, don't rebuild" instinct | Silent actions (no feedback) |
| Deliberate flat aesthetic | Fork debt left in repo/nav |

### To Reach Senior+ in a Portfolio

- [ ] Add a real research artifact (even 5 interviews) + a user quote
- [ ] Show one full **before→after** (onboarding is the hero story)
- [ ] Projected metrics **with** an instrumentation plan, labeled as projections
- [ ] Feature the design-system spread (tokens → semantic → component)
- [ ] Cut iDap fork artifacts so the product reads as coherent

---

# 10 · Prioritized Roadmap

### Timeline (Impact-first)

```
  P0 · ORIENTATION & TRUST  ──────────────────────────────  (weeks 1–2)
   ├─ Glossary (i) tooltips on every KPI        [DONE ✅ extended]
   ├─ "Sample data" ribbon                      [exists ✅]
   ├─ Welcome + product-intro carousel          [exists ✅]
   ├─ Quick-start checklist (surface setup)     [exists ✅]
   └─ Success / consequence toasts              [TODO]

  P1 · CONSISTENCY & A11Y  ───────────────────────────────  (weeks 3–5)
   ├─ Adopt Button primitive + extract Card/Badge/Input
   ├─ Status legend + icon redundancy
   ├─ One metric + currency formatter everywhere
   └─ Wire dark mode at Tier-2 (or formally defer)

  P2 · DISCOVERY & HYGIENE  ──────────────────────────────  (weeks 6–7)
   ├─ Feature-discovery nudges (Coupons, Settlement)
   ├─ Contextual deep-links into Help
   ├─ Remove "Dev Handoff" from prod nav
   └─ Clean iDap fork artifacts (FOUNDATION.md, orphan routes)
```

### Quick-Win Checklist (this sprint)

- [x] Glossary tooltips across KPI screens
- [ ] Success toasts on Approve / Decline / Save / Reply
- [ ] Status legend component + per-pill tooltips
- [ ] Hide "Dev Handoff" behind a dev flag
- [ ] "Type vs Room" explainer coach mark

---

# 🧾 Final Summary

| Lens | Verdict |
|---|---|
| **Executive** | Design-led ops cockpit for Myanmar properties; senior foundation, junior follow-through; the gap is mostly *additive surfacing*, not rebuilds. |
| **Product** | Single-property PMS-lite monetized on commission; owns booking→payout loop; scope discipline is a strength. |
| **UX** | Strong IA + learnable grammar; undermined by no first-run, jargon, metric drift, silent feedback. |
| **UI** | Flat, calm, confident; KPI/table/side-sheet rhythm tuned for triage. |
| **Design System** | Standout asset (layered tokens, self-audit); held back by token-rich/component-poor reality + broken dark mode. |

**Top 3 Strengths** — 🥇 Token architecture · 🥈 Operator-aligned IA · 🥉 Consistent screen grammar
**Top 3 Weaknesses** — ⚠️ No first-run by default · ⚠️ Unadopted component layer · ⚠️ Color-only status & broken dark mode
**Next 3 Moves** — ✅ Success toasts · ✅ Adopt Button + extract primitives · ✅ Centralize metric/currency formatter

---

*Document owner: Design Direction · Source of truth in code: `src/styles/theme.css`, `design-system/`, `docs/UX-ONBOARDING-REVIEW.md`. Ratings are point-in-time and should be re-scored after each roadmap phase.*
