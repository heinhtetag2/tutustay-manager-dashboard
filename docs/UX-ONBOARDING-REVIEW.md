# TutuStay Manager Dashboard — First-Time User UX & Onboarding Review

*Reviewed as a first-time hotel manager who has never seen this product. Roles applied: Senior Product Designer · UX Researcher · Product Manager · Onboarding Specialist. Benchmarks: Atlassian, Notion, Linear, Stripe, Airbnb, HubSpot.*

> **Environment note:** This is a demo. The onboarding described here is designed to **re-appear on every refresh** (no "don't show again" persistence), so it must be *skippable in one click* and never block the product.

---

## 0. Executive Summary

**The good news:** The information architecture is genuinely strong. The sidebar is grouped sensibly (Overview / Team / Hotel / Marketing / Finance / Account), every list screen has empty states, every page has a title + one-line subtitle, there's a real 6-step **Property Setup** wizard with a live progress ring, and a 6-category **Help Center** with 24 articles. This is already ahead of most early-stage SaaS.

**The core problem:** *There is no first-run experience and the product assumes hotel-industry fluency.* A first-time user is dropped onto a dashboard full of pre-loaded demo data and unexplained jargon — **ADR, RevPAR, room-nights, occupancy, settlement, commission, net/gross, adjustments, prepaid/postpaid, session/day-use** — with zero orientation. They don't know what to do first, what the numbers mean, or that the data they're seeing is fake.

### The 7 highest-impact gaps

1. **No welcome / no product introduction.** The app opens straight onto the Dashboard. No "what is this, what can I do, where do I start." *(Atlassian/HubSpot always open with a welcome + checklist.)*
2. **No guided first task.** There's a Setup wizard, but nothing *points* a new user to it from the dashboard. The only hint is a small progress ring at the bottom of the sidebar.
3. **Jargon with no glossary or info-icons.** KPIs like *ADR / RevPAR / Room-nights* appear as bare numbers. Hotel veterans know them; independent guesthouse owners (the likely user) often don't.
4. **No "this is demo data" signposting.** The dashboard shows realistic revenue and bookings. A new user can't tell what's real vs. sample, and there's no "explore with sample data / clear it" guidance. *(Notion, Linear seed sample data but label it.)*
5. **Color-coded statuses are never explained.** Confirmed / Checked-in / Checked-out / Cancelled / No-show / Overdue / Pending / Approved / Declined are used as colored pills everywhere — with no legend or tooltip defining them.
6. **Inconsistent metric definitions across screens.** "Arrivals" on the Dashboard, the Sales Calendar, and reservations are computed from different status sets; "Confirmed stays" (Dashboard) vs "Excludes cancellations" (Calendar) describe the same idea in two ways. This erodes trust in the numbers.
7. **Currency is invisible.** Most amounts render as bare numbers (e.g., `80,000`) with no `MMK`. Only a couple of inputs show the prefix. A first-time user doesn't know the unit.

### Recommended response (in priority order)
- **P0:** Welcome modal → Quick-start checklist (reuses the real Setup steps) → "demo data" banner → glossary tooltips on every KPI.
- **P1:** Dashboard product tour (coach marks), status legend component, consistent metric labels + currency everywhere, contextual empty-state CTAs.
- **P2:** Feature-discovery nudges (Coupons, Settlement), per-screen "first task" hints, "Was this helpful" loops feeding Help.

---

## 1. Cross-Cutting Findings (apply to *every* screen)

These recur on most screens; fix them once with shared components rather than per-page.

| # | Issue | Evidence | Fix |
|---|-------|----------|-----|
| C1 | **Hotel jargon never defined** | `ADR`, `RevPAR`, `Room-nights`, `Occupancy`, `Session/Day-use`, `Weekend uplift`, `Settlement`, `Commission`, `Gross/Net`, `Adjustments`, `Prepaid/Postpaid`, `Sub-manager`, `Repeat guests` all appear bare | Shared `<MetricLabel info="…">` with an `(i)` tooltip; a glossary article in Help |
| C2 | **Color-status pills have no legend** | Statuses across Dashboard, Calendar, Reservations, Requests, Coupons, Settlements | Reusable `<StatusLegend>` + tooltip on each pill (`title` exists on calendar only) |
| C3 | **Currency unit missing** | Most amounts show `80,000`, `2,500,000` with no `MMK`; only some Money inputs prefix it | Always render currency via one formatter that includes the unit (or a clear once-per-card unit label) |
| C4 | **Metric definitions inconsistent across screens** | Dashboard "Arrivals today" (Confirmed+Checked-in) vs Departures (Checked-in+Checked-out); "Confirmed stays in June" vs Calendar "Excludes cancellations" | Centralize metric definitions; use identical labels + the same `(i)` copy everywhere |
| C5 | **No info-icons on any KPI card** | All KPI cards are label + number + sub-label only | Add optional `(i)` to the KPI card component |
| C6 | **Demo data is unlabeled** | Dashboard, lists pre-populated with realistic data | A dismissible "You're viewing sample data" ribbon |
| C7 | **No first-run orientation anywhere** | No welcome, tour, or checklist exists in code | See §3 onboarding design |
| C8 | **Empty states describe, but rarely *act*** | e.g. "Reservations will appear here." | Add a CTA + a "why" (e.g. link to Booking Requests, or explain bookings flow in) |

---

## 2. Screen-by-Screen Analysis

*Each screen answers the brief's 12 questions, folded into a consistent template: **Clear / Confusing / Missing / Won't-understand / Jargon / Tooltips to add / Empty states / Helper & system messages / Onboarding hook**.*

---

### 2.0 Global App Shell (sidebar, top bar, notifications)

- **Immediately clear:** Grouped nav with icons + labels; active state; collapsible sidebar; a bottom "Property setup" progress ring; notifications bell; profile menu with name/email.
- **Confusing:** **"Dev Handoff"** (→ `/design-system`) is a *developer* artifact sitting in primary nav next to Help — a real hotel manager will click it and be baffled. The **setup progress ring** at the very bottom is easy to miss and its label ("Property setup · 83%") only appears on hover when collapsed.
- **Missing:** No global search (every list has its own search, but there's no command-palette / cross-entity search — Linear/Notion set this expectation). No way to tell the demo data is demo. No "Getting started" entry point in the nav.
- **First-timer won't understand:** Why "Property setup" is *below* the fold under Settings rather than being the first thing surfaced; what "Dev Handoff" is.
- **Tooltips to add:** On collapsed nav icons (some exist); on the setup ring always (not just hover); hide/relabel "Dev Handoff" as "Developer / Design tokens" behind a dev flag.
- **Onboarding hook:** The welcome modal (§3.1) should *originate* the tour from here and spotlight the setup ring.
- **Priority:** Hide "Dev Handoff" from production nav — **High**. Surface setup more prominently — **High**.

---

### 2.1 Dashboard (`/`)

- **Immediately clear:** Friendly header "Welcome back, {name}" + "Your day at a glance…"; 4 big KPI cards (Revenue this month, Arrivals today, Departures today, Pending requests); Revenue area chart; Arrivals & Departures bar chart; Occupancy forecast; Reservation status donut (with legend); Revenue by room type; Recent activity feed. Charts have hover tooltips. Delta chips ("+5.2% vs last month") are a nice touch.
- **Confusing:**
  - **Performance strip — `Occupancy / ADR / RevPAR / In-house`** — three of four are unexplained acronyms/terms. ADR and RevPAR look almost identical (both currency) with no hint why they differ.
  - "Revenue this month" sub-label says **"Confirmed stays in June"** — but the underlying logic also counts Checked-in/Checked-out. The word "Confirmed" reads like the *status* "Confirmed," which is narrower. Trust gap.
  - Revenue chart range presets bucket differently ("Last 7 days" = daily, "Last 30 days" = weekly) with no note.
- **Missing:** What time scope the donut covers ("All reservations by status" — all time? this month?). No "these are sample numbers" cue. No definition of occupancy basis (occupied ÷ active rooms; falls back to all rooms).
- **First-timer won't understand:** ADR vs RevPAR; why arrivals ≠ departures logic; whether day-use sessions are in revenue.
- **Metrics/charts needing descriptions:** **ADR, RevPAR, Occupancy, RevPAR vs ADR, Revenue ("confirmed" definition), Reservation status scope.**
- **Tooltips to add (exact copy ready in §3.5):** `(i)` on ADR, RevPAR, Occupancy, In-house, Revenue, each chart title.
- **Empty states:** Already has "No confirmed revenue yet." and "No recent activity." — good. Add a *new-account* hero state: "No bookings yet — finish setup to go live."
- **Helper & messages:** None today. Add the demo-data ribbon and a one-time "Reading your dashboard" coach mark.
- **Onboarding hook:** This is the home of the **product tour** (§3.3) and the **Quick-start checklist** (§3.7) — anchor both here.
- **Priority:** Glossary tooltips — **High**; demo ribbon — **High**; metric-label consistency — **Medium**.

---

### 2.2 Sales Calendar (`/sales-calendar`)

- **Clear:** Excellent subtitle ("A month-by-month view of your bookings and revenue, day by day"); month nav + Today; 4 KPIs; per-day cells with revenue badges + status pills; a status **legend below the grid**; a rich day-detail side sheet with status filters and search.
- **Confusing:** **"Room-nights"** KPI — users conflate with "nights." "Arrivals — Confirmed & in-house" is clearer than the Dashboard's version, which exposes the cross-screen inconsistency (C4).
- **Missing:** No hint that empty days are clickable only when they have bookings; the legend is small/easy to miss.
- **Won't understand:** Room-nights vs nights; why some days aren't clickable.
- **Tooltips to add:** `(i)` on "Room-nights" ("Rooms sold × nights stayed. A 2-room, 3-night booking = 6 room-nights."). Make the status legend a shared, slightly more prominent component.
- **Empty states:** Day sheet has "No bookings match your filters." — good.
- **Onboarding hook:** Coach mark on first visit: "Click any day with bookings to see the guest list and daily revenue."
- **Priority:** Room-nights tooltip — **Medium**; legend prominence — **Low**.

---

### 2.3 Employee Management (`/agents`)

- **Clear:** Title + helpful subtitle; 4 KPIs (Total / Active / Managers / Inactive); Export CSV; **New** button; rich filters (role, status, hire-date range); resizable table; pagination; bulk-delete with confirm; a clean **2-step create modal** (Profile → Credentials).
- **Confusing:** Nav label is **"Employee Management"** but the route/code calls them **"agents"**, and the Managers KPI sub-label says **"Manager & sub-manager"** — three vocabularies for staff. "Sub Manager" is undefined (what can they do?). The **New** button is just "New" (new *what?*).
- **Missing:** No explanation of roles/permissions (what a Manager vs Sub Manager vs Staff can actually do). No hint that Step 1 leads to a Step 2 (credentials) until you click Continue. Employee ID "Auto if empty" — auto *what format*? Resident ID field has no format help beyond a placeholder.
- **Won't understand:** Role capabilities; that this is where staff *logins* are created.
- **Tooltips to add:** `(i)` next to **Role** in the form explaining each role's access; relabel button **"New employee."**
- **Empty states:** Good — "Add your first employee to get started." / "No employees match these filters."
- **Helper & messages:** Password mismatch error exists ("Passwords don't match"). **Missing:** success toast after creating ("James Carter added — they can now log in with their credentials"). No success confirmation anywhere in the app is a recurring gap.
- **Onboarding hook:** Feature-discovery nudge only after setup is done.
- **Priority:** Button relabel + role tooltip — **Medium**; success toasts — **Medium**.

---

### 2.4 Customer Management (`/customers`)

- **Clear:** Subtitle; 4 KPIs (Total customers / Total bookings / Total revenue / Repeat customers); filters (segment, sort, booking-date); table with notes; pagination; bulk delete.
- **Confusing:** **"Repeat guests"** / **"Repeat customers"** assume the reader knows the definition (>1 booking). Column header **"Total booking"** (singular) shows plural values. "Total revenue / Total payment" have no currency unit.
- **Missing:** Definition of "Repeat" and "Inactive" segments; what a "customer" is vs a "guest" vs a booking request sender.
- **Won't understand:** Why some customers are "Inactive"; how customers get *created* (they appear after booking — not stated).
- **Tooltips to add:** `(i)` on "Repeat customers" ("Guests with more than one completed booking."). Fix header to "Total bookings."
- **Empty states:** Good — "Customers will appear here once they book."
- **Priority:** Label fixes + tooltip — **Low/Medium**.

---

### 2.5 Customer Reviews (`/reviews`)

- **Clear:** Subtitle; 4 KPIs (Average rating with stars / Total reviews / Awaiting reply / Response rate); filters (rating, reply-status, sort, date); review cards with reply composer, hide/show toggle, status badges.
- **Confusing:** **"Response rate"** undefined (% of reviews you've replied to). **"Hidden"** state's effect ("hidden from public listings") only appears *after* you hide — pre-emptive explanation missing. Three statuses (Replied/Awaiting/Hidden) with no legend.
- **Missing:** Guidance that replying publicly builds loyalty (the subtitle hints, but no nudge on *awaiting* reviews).
- **Won't understand:** What "Hidden" does to the guest-facing listing; whether the guest sees the reply.
- **Tooltips to add:** `(i)` on Response rate; on the hide toggle ("Hidden reviews stay in your dashboard but are removed from your public page").
- **Empty states:** Good — "Guest reviews will appear here."
- **Helper & messages:** Add success toast on "Send reply" ("Reply posted — the guest will be notified").
- **Priority:** Hide-toggle tooltip — **Medium**; Response-rate tooltip — **Low**.

---

### 2.6 Room Management (`/hotel/rooms`) — Rooms & Room Types tabs

- **Clear:** Two tabs (Rooms / Room Types); 4 KPIs; deep filters (amenity multiselect, status, type, floor, occupancy); tables with photo, capacity, amenity chips, price, status; "Hotel setup" + "Add Room / Add Room Type" actions. **This area has the best inline help in the product** — the Add Room Type form has genuinely good tooltips: *"Regular = standard nightly rate. Session = sell short hourly blocks. Weekend = an uplift applied to both…"* and warning boxes ("Set the Regular and Session rates first…"), a live weekend-rate preview, and "Session length is managed in Settings."
- **Confusing:**
  - KPI sub-label **"Pricing tiers"** for Room Types — a user won't equate "Room Types" with "pricing tiers."
  - The **Rooms vs Room Types** mental model is the single biggest conceptual hurdle: a *Room Type* defines pricing/beds/amenities; a *Room* is a physical instance that inherits them. Nothing explains this relationship up front — you only discover it when adding a Room ("Sets pricing, beds, occupancy and amenities for this room").
  - **Session length is locked** (gray, lock icon) with "managed in Settings" — looks broken/disabled without the explanation being obvious.
  - Weekend uplift modes "% over base" vs "+ Amount" — adequate, but no one-liner on when to use which.
  - Bed types (Single/Double/Queen/King/Twin/Bunk) listed with no sizing guidance.
- **Missing:** An upfront "How rooms work here" explainer (Type → Rooms). Currency unit consistency.
- **Won't understand:** Why they must create a Room Type *before* a Room; why session length can't be set per type.
- **Tooltips to add:** `(i)` on the Rooms/Room Types tab bar: "A **Room Type** sets pricing, beds and amenities. A **Room** is a physical room of that type (e.g. Room 201)." Relabel "Pricing tiers" → "Room types."
- **Empty states:** "No rooms match these filters." / "No room types found." — fine, but the **zero-room-types** state should teach: "Create your first room type to start pricing rooms."
- **Onboarding hook:** This is a top **first-task** candidate after Setup ("Add your first room type"). Coach mark on the tabs explaining Type vs Room.
- **Priority:** Type-vs-Room explainer — **High**; "Pricing tiers" relabel — **Low**.

---

### 2.7 Reservation Management (`/reservations`)

- **Clear:** Subtitle; 4 KPIs (Total / **Overdue** / Upcoming / Revenue); filters (status, room type, duration, check-in range); table (Guest, Room, Stay, Duration, Amount, Status); rate chips ("Day use", "Weekend rate"); status badges; pagination.
- **Confusing:** **"Overdue"** ("Past checkout, not closed") — a user won't know this means *you forgot to check the guest out*, nor what to do about it. **"Day use"** appears as a chip with no link to the "Session" concept. Statuses are colored pills with no legend.
- **Missing:** What action resolves an Overdue reservation (Check out). That reservations are *created from* booking requests / direct bookings — you can't add one here, but the empty state doesn't say so.
- **Won't understand:** Overdue meaning + remedy; Day-use = Session; why there's no "Add reservation."
- **Tooltips to add:** `(i)` on Overdue KPI and the Overdue pill ("Checkout date has passed but the guest hasn't been checked out. Open the reservation and Check out to close it."). `(i)` on "Day use" → "A short, same-day session booking (no overnight stay)."
- **Empty states:** "Reservations will appear here." → improve to "Reservations appear here once a booking request is approved or a guest books directly."
- **Onboarding hook:** Status-legend coach mark on first visit.
- **Priority:** Overdue explanation — **High**; status legend — **Medium**.

---

### 2.8 Booking Requests (`/booking-requests`)

- **Clear:** Strong subtitle ("approve or decline to keep your calendar moving"); 4 KPIs (Pending / Approved / Declined / **Pending value** "If all approved"); card list with guest note, Approve/Decline, "Reset to pending"; sort options. This is the most action-oriented screen and reads well.
- **Confusing:** Relationship to **Reservations** is implicit — approving a request *creates a reservation*, but that consequence isn't stated. "Pending value — If all approved" is clever but needs a beat to parse.
- **Missing:** Confirmation/consequence messaging on Approve ("This confirms the booking and blocks those dates") and Decline ("The guest will be notified").
- **Won't understand:** That Approve → a Confirmed reservation appears under Reservations; whether the guest is auto-notified.
- **Tooltips/messages to add:** Confirmation toast on Approve/Decline with the consequence; `(i)` on "Pending value."
- **Empty states:** Good — "Incoming requests will appear here."
- **Onboarding hook:** Prime **first-task** ("You have N requests waiting — approve or decline") — this is the most natural "first real action."
- **Priority:** Approve/Decline consequence messaging — **High**.

---

### 2.9 Coupon Management (`/coupons`) + New Coupon form

- **Clear:** Subtitle; 4 KPIs (Total / Active / Redemptions / Expiring soon "Within 14 days"); filters (status, validity range); table (Code, Discount, Applies to, Validity, Usage, Status); "New coupon"; a well-built form with good helper text ("Leave all unselected to apply to every room type", "Leave blank for unlimited redemptions") and a clear approval banner ("This coupon will be submitted to the super-admin and goes live once approved").
- **Confusing:** **The approval workflow is a surprise.** A first-timer expects "Create" → live. Instead it's "Submit for approval" → **Pending review** → maybe **Rejected**. The *existence* of a "super-admin" who gates your coupons is a significant model that's only revealed at submit time. Statuses (Active/Pending review/Scheduled/Rejected/Expired/Disabled) are many and unexplained. **"Redemptions"** = times used (clear-ish) but unlabeled as such on the card.
- **Missing:** Up-front "coupons need approval" expectation *before* the user invests in filling the form; what "Scheduled" vs "Active" means; currency on min-spend / fixed amount.
- **Won't understand:** Who the super-admin is and why they gate coupons; the 6-state lifecycle.
- **Tooltips to add:** `(i)` on the status column header linking to a lifecycle explainer; surface the "needs approval" note at the *top* of the list (not only inside the form).
- **Empty states:** "No coupons match your filters." → for a *zero-coupon* account: "Create your first coupon to attract and retain guests. New coupons are reviewed before going live."
- **Helper & messages:** Add success toast ("Coupon submitted for approval — we'll notify you when it's reviewed").
- **Onboarding hook:** Feature-discovery nudge (Medium priority — not a day-one task).
- **Priority:** Pre-form approval expectation + status legend — **Medium**.

---

### 2.10 Settlement (`/settlements`)

- **Clear:** Excellent subtitle ("See how each booking becomes a payout — gross revenue, commission, and what lands in your account"); 4 KPIs (Paid out / Pending payout / This month gross / Platform fees); two charts (Net payout by period, Payout composition donut with gross/net/commission legend); filters (status, period, amount); table (Reference, Period, Bookings, Gross, Commission, Net payout, Status); Export CSV; detail page with a full payout breakdown and itemized bookings.
- **Confusing:** Dense financial vocabulary with **no definitions**: Gross, Commission, **Net payout**, **Adjustments** ("Refunds & cancellations" — only learnable from the sub-label), platform fee %, bi-weekly periods, "On hold." Payout method shows masked "**KB ••3921**" — "KB" is unexplained.
- **Missing:** A one-line "how settlement works" primer at the top (the Help article exists, but isn't linked from here); the commission rate isn't visible in the list, only in detail.
- **Won't understand:** Gross vs Net; what Adjustments are; settlement period cadence; "On hold" cause/remedy.
- **Tooltips to add:** `(i)` on each KPI and column: Gross ("Total booking revenue before fees"), Commission ("TutuStay's platform fee, currently 12%"), Net payout ("What lands in your bank: gross − commission − adjustments"), Adjustments ("Refunds and cancellations deducted from this payout").
- **Empty states:** "No settlements match your filters." → zero-state: "Your first payout will appear here after your first completed stays."
- **Onboarding hook:** Feature-discovery; link to the "How settlement works" Help article inline.
- **Priority:** Glossary tooltips on financial terms — **High** (money clarity = trust); inline Help link — **Medium**.

---

### 2.11 Settings (`/settings`)

- **Clear:** Left-nav grouped sections (Account, Payment methods, Booking defaults, Notifications, Language & region, Privacy & data, Sessions); rich per-section content; good descriptive text on Booking defaults ("Day-use sessions sell a room in short blocks of hours…").
- **Confusing:** **"Booking defaults"** overlaps conceptually with the Setup wizard and with per-room-type pricing — a user won't know that *session length set here* is what's *locked* in the Room Type form. The link between Settings ↔ Room Types ↔ Setup isn't drawn.
- **Missing:** Cross-links explaining that these defaults flow into room creation; what "Feature my property in promotions" / "Share anonymized benchmarks" actually do.
- **Won't understand:** Why session length lives here rather than per room type; the downstream effect of weekend-day defaults.
- **Tooltips to add:** `(i)` on Booking defaults explaining the flow ("New room types inherit these. Existing types keep their own settings.").
- **Helper & messages:** Validation exists ("Pick at least one weekend day, or weekend pricing won't apply"). Add a save-confirmation toast.
- **Priority:** Cross-link copy — **Low/Medium**.

---

### 2.12 Property Setup / Setup Hub (`/setup`, `/hotel/setup`)

- **Clear:** **This is the best-onboarded part of the app.** Hub page with state-aware copy (draft/submitted/approved/rejected), a 6-step journey checklist with "X of Y done," an animated progress ring, a "What finishing unlocks" card (Go live / Take bookings / Get paid), and a clean wizard with success screen. Steps: Property basics → Property type → Address & map → Policies & amenities → Owner/business/contract → Settlement (optional).
- **Confusing:** Why **Settlement is "optional"** during setup when "Get paid" is listed as a thing finishing unlocks — mixed message. The hub lives behind a small sidebar ring, so users may never find it.
- **Missing:** A push *to* this flow from the dashboard for brand-new accounts. A "resume where you left off" nudge.
- **Won't understand:** That this is the *required first thing*; that the property isn't visible to guests until it's submitted and approved.
- **Onboarding hook:** **This wizard is the backbone of the Quick-start checklist (§3.7).** Don't rebuild it — *surface* it.
- **Priority:** Surface from dashboard + welcome — **High**; clarify Settlement-optional copy — **Low**.

---

### 2.13 Help (`/help`)

- **Clear:** Search; 6 categories (Getting Started, Reservations & Calendar, Booking Requests, Rooms & Pricing, Coupons & Promotions, Settlement & Payouts); popular articles; contact (chat/email, "Under 4 hours"); "Was this helpful?" article footer. Genuinely solid.
- **Confusing:** Nothing major — this screen is well done.
- **Missing:** A **glossary** article for the jargon in C1; deep-links *from* product screens *into* the relevant article (Help is a destination, but the product never points to it contextually).
- **Onboarding hook:** Seed the welcome modal's "Learn the basics" link to the "Reading your dashboard" + "Reservation statuses explained" articles.
- **Priority:** Contextual deep-links from screens — **Medium**; glossary article — **Medium**.

---

## 3. First-Time User Onboarding Design

A complete, demo-friendly onboarding system. **Because onboarding re-appears every refresh, every element is one-click-skippable and state is held in memory only (no permanent dismissal).** Sequence: **Welcome → Quick-start checklist (persistent) → contextual coach marks on first visit to each screen → glossary tooltips (always on) → empty/zero states → feature-discovery nudges.**

Format for each item: **Location · Trigger · Copy · Why · Priority.**

### 3.1 Welcome Screen (modal)

- **Location:** Centered modal over the Dashboard, on app load.
- **Trigger:** App mount / refresh (demo: every time). Dismiss → checklist remains.
- **Copy:**
  > **Welcome to TutuStay 👋**
  > Your command center for running the property — bookings, rooms, guests, payouts, all in one place.
  > You're currently exploring with **sample data**, so feel free to click around.
  > **[ Take the 60-second tour ]   [ Skip — I'll explore ]**
- **Why:** Sets context, names the product's purpose, and immediately defuses the "is this data real?" confusion (gap #4). Industry standard (HubSpot, Stripe open this way).
- **Priority:** **High.**

### 3.2 Product Introduction (3-slide carousel, inside the welcome modal "Take the tour" path)

- **Location:** Same modal, paginated.
- **Trigger:** User clicks "Take the tour."
- **Copy:**
  1. **"Run your day from one screen."** The Dashboard shows arrivals, revenue, and requests waiting on you.
  2. **"Three things to know:"** **Booking Requests** come in → you **Approve** → they become **Reservations** → completed stays roll up into **Settlements** (your payouts).
  3. **"Set up once, then you're live."** Finish the 6-step property setup to start taking real bookings. *(button: "Show me the checklist")*
- **Why:** Teaches the core mental model (request → reservation → settlement) that the product currently never states. This single flow underlies half the confusion in §2.
- **Priority:** **High.**

### 3.3 Dashboard Walkthrough (coach marks / spotlight tour)

- **Location:** Sequential spotlights on the Dashboard.
- **Trigger:** End of the product intro, or "Take the tour" from welcome. (Demo: replays each refresh; always Esc-skippable.)
- **Steps & copy:**
  1. Spotlight **KPI cards:** "Your day's headline numbers. Hover any **(i)** to learn what a metric means."
  2. Spotlight **Performance strip:** "ADR, RevPAR and Occupancy — hotel performance terms. We'll define each one inline."
  3. Spotlight **sidebar groups:** "Everything's grouped: Overview, your Team, Hotel operations, Marketing, and Finance."
  4. Spotlight **setup ring (bottom of sidebar):** "Start here — finish setting up your property to go live. *[Go to setup]*"
- **Why:** Orients spatially and routes the user to the real first task (gap #2). Coach marks > one big modal for retention (Linear/Notion pattern).
- **Priority:** **High** for steps 1 & 4; **Medium** for 2 & 3.

### 3.4 Quick-Start Checklist (persistent launchpad)

- **Location:** A collapsible "Get started" card pinned to the top of the Dashboard **and** mirrored by the sidebar setup ring. *Reuses the real 6 setup steps + 2 first actions.*
- **Trigger:** Visible whenever setup is incomplete (demo: always, since it resets). Collapses to a small "Setup 3/8" pill.
- **Copy (checklist items):**
  - ☐ Add your property basics — *name, photo, rating*
  - ☐ Pick your property type
  - ☐ Confirm your address on the map
  - ☐ Set policies & amenities
  - ☐ Add owner & contract details
  - ☐ Connect your settlement bank *(optional)*
  - ☐ **Create your first room type** *(→ Room Management)*
  - ☐ **Review a booking request** *(→ Booking Requests)*
  - Footer: "Finishing setup unlocks going live, taking bookings, and getting paid."
- **Why:** The single most effective onboarding mechanic in SaaS (HubSpot, Atlassian, Stripe all use a checklist). The app *already has* the steps — this just surfaces them and adds the two natural "first real actions." Directly fixes gaps #1, #2, #4.
- **Priority:** **High.**

### 3.5 Glossary Tooltips & Coach Marks (always-on `(i)` icons)

- **Location:** Inline `(i)` on every jargon term / KPI across the app (see C1, C5).
- **Trigger:** Hover/tap — always available (not just onboarding).
- **Copy (ready to ship):**
  - **ADR** — "Average Daily Rate: room revenue ÷ number of room-nights sold. The average you earn per occupied room per night."
  - **RevPAR** — "Revenue Per Available Room: total room revenue ÷ all rooms you *could* have sold. Unlike ADR, it's dragged down by empty rooms — so it reflects both price *and* occupancy."
  - **Occupancy** — "Share of your bookable rooms that are filled tonight (occupied ÷ active rooms)."
  - **Room-nights** — "Rooms sold × nights stayed. A 2-room, 3-night booking = 6 room-nights."
  - **Day use / Session** — "A short, same-day booking sold in blocks of hours — no overnight stay."
  - **Weekend uplift** — "An extra amount or % added on top of your nightly and session rates on the days you choose."
  - **Overdue** — "The checkout date has passed but the guest hasn't been checked out. Open the reservation and Check out to close it."
  - **Gross revenue** — "Total booking revenue before any fees."
  - **Commission / Platform fee** — "TutuStay's fee, currently 12% of gross."
  - **Adjustments** — "Refunds and cancellations deducted from this payout."
  - **Net payout** — "What actually lands in your bank: gross − commission − adjustments."
  - **Repeat guest** — "A customer with more than one completed booking."
  - **Sub-manager** — "A staff role with manager access minus billing and settings. *(adjust to real permissions)*"
- **Why:** Removes the single biggest comprehension barrier without cluttering the UI. Stripe-grade inline definitions.
- **Priority:** **High** (financial + ADR/RevPAR/Overdue); **Medium** (the rest).

### 3.6 Empty States (zero-data, new-account)

Replace generic "X will appear here" with **teach + act**. Distinguish *filtered-empty* (keep current copy) from *truly-empty* (new account).

| Screen | Zero-state copy | CTA | Priority |
|--------|-----------------|-----|----------|
| Dashboard | "No bookings yet. Finish setting up your property to go live and start taking reservations." | Finish setup | High |
| Rooms (Room Types) | "Create your first room type to set pricing, beds, and amenities — then add rooms of that type." | Add room type | High |
| Reservations | "Reservations appear here once you approve a booking request or a guest books directly." | View requests | Medium |
| Booking Requests | "No requests yet. Once you're live, guest requests land here for you to approve or decline." | — | Medium |
| Coupons | "Create your first coupon to attract and bring back guests. New coupons are reviewed before going live." | New coupon | Medium |
| Settlements | "Your first payout will appear here after guests complete their stays." | How settlement works | Medium |
| Customers / Reviews | *(current copy is fine)* | — | Low |

- **Why:** Empty states are prime teaching real estate (Notion/Airbnb). Each should explain *how data arrives* and offer the next action — fixing gap #8/C8.

### 3.7 Feature Discovery (post-setup nudges)

- **Location:** Small, dismissible tip banners or a "What's next" section, surfaced **after** core setup is complete.
- **Trigger:** Setup ≥ done AND the feature is untouched.
- **Copy:**
  - Coupons: "💡 Slow week ahead? Create a coupon to fill rooms — it just needs a quick review before going live."
  - Reviews: "⭐ You have {n} reviews awaiting a reply. Responding publicly builds trust with future guests."
  - Settlement: "🏦 Connect your bank in Settlement to receive payouts automatically."
  - Employees: "👥 Add your front-desk team so they can manage bookings with their own logins."
- **Why:** Drives adoption of secondary features without overwhelming day one (HubSpot's staged disclosure). Prevents Coupons/Settlement from being "discovered" only by accident.
- **Priority:** **Medium.**

### 3.8 Sample / Demo Data Guidance

- **Location:** A slim, dismissible ribbon under the top bar on data screens; reinforced in the welcome modal.
- **Trigger:** Demo mode (always, in this environment).
- **Copy:**
  > 🧪 **You're viewing sample data** so you can explore freely. Numbers, guests, and bookings here are examples. *[Learn what's real]*
- **Why:** Directly resolves gap #4 — users currently can't tell demo from real, which undermines trust in every number. Notion/Linear always label seeded data.
- **Priority:** **High.**

### 3.9 First-Task Recommendations (the "do one real thing" nudge)

- **Location:** Top of Dashboard, below the checklist, as a single highlighted "Recommended next step."
- **Trigger:** Picks the highest-value incomplete action in priority order.
- **Logic & copy:**
  1. If setup incomplete → "**Finish your property setup** ({x}/6) so you can go live. *[Continue]*"
  2. Else if no room types → "**Add your first room type** to start pricing rooms. *[Add room type]*"
  3. Else if pending requests > 0 → "**You have {n} booking requests waiting.** Approve or decline to keep your calendar moving. *[Review requests]*"
  4. Else → "**You're all set.** Explore your dashboard or create a coupon to drive bookings."
- **Why:** Reduces "what do I do now?" to a single obvious action — the highest-leverage onboarding pattern (Linear's "next action," Atlassian's guided setup).
- **Priority:** **High.**

---

## 4. Prioritized Roadmap

| Priority | Item | Effort | Section |
|----------|------|--------|---------|
| **P0 — Orientation** | Welcome modal + product-intro carousel (request→reservation→settlement model) | S | 3.1, 3.2 |
| **P0 — Orientation** | Quick-start checklist surfacing the existing setup steps + 2 first actions | M | 3.4 |
| **P0 — Trust** | "Sample data" ribbon | S | 3.8 |
| **P0 — Comprehension** | Glossary `(i)` tooltips — financial terms, ADR/RevPAR, Overdue first | M | 3.5, C1, C5 |
| **P0 — First action** | "Recommended next step" on Dashboard | S | 3.9 |
| **P1** | Dashboard coach-mark tour | M | 3.3 |
| **P1** | Status legend component + per-pill tooltips | S | C2 |
| **P1** | Consistent metric labels + currency unit everywhere | M | C3, C4 |
| **P1** | Teach-and-act zero-state empty screens | M | 3.6 |
| **P1** | Room-Type-vs-Room explainer coach mark | S | 2.6 |
| **P1** | Approve/Decline & Submit success/consequence toasts | M | 2.8, 2.3, 2.5, 2.9 |
| **P1** | Hide "Dev Handoff" from production nav | XS | 2.0 |
| **P2** | Feature-discovery nudges (Coupons, Settlement, Reviews, Team) | M | 3.7 |
| **P2** | Contextual deep-links from screens into Help articles | S | 2.10, 2.13 |
| **P2** | Glossary article in Help | S | 2.13, C1 |
| **P2** | Coupon approval-expectation banner before the form | S | 2.9 |

### Guiding principles (the SaaS bar to hit)
- **Reuse, don't rebuild:** the setup wizard, progress ring, and Help center already exist — onboarding should *surface and connect* them, not duplicate.
- **Teach in context:** prefer always-on `(i)` tooltips and teach-on-empty over front-loaded modals.
- **One next action at a time:** never show the user a wall of options; show the single highest-value step.
- **Define every number and status:** money and status clarity is trust; never show a bare metric or colored pill without a way to learn what it means.
- **Demo honesty:** always label sample data.

---

*End of review.*
