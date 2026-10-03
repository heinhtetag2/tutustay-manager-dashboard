# TutuStay — Case Study Copy

Paste-ready copy for the Figma case study (`Mock-Present`, frame `heindsgn`, node `56:653`).
Each block lists the Figma **node ID** → the new text. Sections not listed stay as-is.

Facts verified against the codebase on 2026-07-16 (commit `3f932b4`).

---

## 1. Hero

| Node | New text |
|---|---|
| `56:661` | `TutuStay` |
| `56:979` (sticky bar) | `TutuStay` |

Meta row — **keep as-is**, all three are accurate:
`Project Type: Full Build` · `Stage: MVP-ready` · `Deliverables: UX, Dashboard, Systems`

---

## 2. Introduction — `56:685`

> TutuStay brings calm to how hotels run day to day. It connects reservations, rooms, guests, and payouts in one workspace — so managers spend less time chasing screens and more time hosting.

---

## 3. The vision — `56:690`

> Build a system where a property runs itself — quietly, without operational noise.

---

## 4. Collaboration note — `56:695`

> TutuStay was shaped end to end — research, UX, design system, and front-end build. Working across every layer meant decisions stayed coherent: the same rules that shape the data model shape the interface.

---

## 5. The system mindset — `56:700`

> A hotel operations platform that balances the control a manager needs with the simplicity of a screen you can read in five seconds, between check-ins.

---

## 6. Problem / solution pair

**`56:714`**
> Hotel operations are fragmented — bookings in one tool, rooms in another, payouts in a spreadsheet. TutuStay was designed to bring structure to that sprawl, turning scattered daily tasks into one connected workflow.

**`56:716`**
> To support this, I built a flexible system that adapts across roles and property sizes, balancing control with simplicity while staying ready for what comes next.

---

## 7. Gallery closing — `56:769`

> By balancing structure and flexibility, TutuStay feels both controlled and human. Managers gain oversight, staff gain speed, and running a property becomes readable without unnecessary complexity.

---

## 8. Colour board — ✅ already done

`56:773` "Be in control of every stay" and the four swatches
(`DEEP OCEAN #1D3D58` · `COASTAL SKY #DAE5FC` · `CHARCOAL #2B2926` · `SAND #F8F7F7`)
are already correct. No change.

---

## 9. Feature deep-dive 1 — was "Course Management"

| Node | New text |
|---|---|
| `56:784` | `Reservation Management` |

**`56:786`**
> Structuring stays through clear statuses, requests, and workflows.

**`56:790`**
> Take a booking request, approve it, and manage the stay in one place. A reservation moves from request to confirmed to checked-out — and anything past its checkout date surfaces as overdue automatically.

**`56:804`**
> Structuring stays through clear statuses, requests, and workflows.

**`56:809`**
> TutuStay approaches the day through clarity — surfacing arrivals, departures, and the decisions waiting on you right now.

---

## 10. Think Different — heading `56:818` stays

**`56:820`**
> Surfacing the right number at the right moment turns a dashboard into a place a manager opens every morning — not just logs into.

**`56:824`**
> ADR, RevPAR and occupancy, computed live from real reservation data.

---

## 11. A System Designed to Scale — heading `56:836` and `56:838` stay

**`56:845`**
> As a product grows, design systems matter more than individual screens. TutuStay is built on a three-tier token architecture — primitive ramps, a semantic layer, and component bindings — so the entire product re-themes from one place.

**`56:847`**
> By prioritising consistency and adaptability, the system stays reliable for properties today while staying flexible for what ships next.

---

## 12. Impact section — ⚠️ NEEDS A REWRITE, NOT JUST NEW WORDS

The template carries App Store metrics: **4.9 stars · 43K ratings · Top 10 in Education**.
TutuStay is MVP-ready and unshipped — it has no App Store presence, no ratings, no ranking.
Publishing those numbers would be inventing a track record. Replace them with build facts
that are true and verifiable:

| Node | Was | New |
|---|---|---|
| `56:850` | Immediate disruption | `Built as a system` |
| `56:853` | Impact | `Scope` |
| `56:859` | 4.9 | `27` |
| `56:861` | Star rating on App Store | `Screens in the manager dashboard` |
| `56:864` | 43K | `221` |
| `56:866` | Ratings on App Store | `Design tokens across 23 palettes` |
| `56:869` | T10 | `3` |
| `56:871` | Top performing apps in Education | `Languages — English, Korean, Myanmar` |

**`56:855`**
> TutuStay was built to address real operational pain in independently-run hotels. Rather than shipping screens, the work went into a token architecture, an onboarding layer, and domain rules that hold up as a property grows.

---

## Verified numbers (safe to cite)

| Claim | Number |
|---|---|
| Routes in `src/app/routes.ts` | **31** (27 inside the app shell) |
| Reusable components in `src/shared/ui/` | **25** |
| CSS custom properties in `theme.css` | **336** |
| `--color-*` tokens | **221** |
| Primitive palettes | **23** (11 base + 10 data-viz + 2 brand) |
| Zustand stores | **11** |
| Languages | **3** (en / ko / my) |
| Currencies · date formats | **4** · **5** |
| Glossary definitions | **16** |
| Hotel setup wizard steps | **8** |
| LOC (excl. unrouted legacy) | **~32,900** |

## Do NOT claim

Verified as absent or inert in the codebase:

- **API mocking** — MSW is wired end-to-end but `handlers.ts` exports an empty array. Nothing is intercepted.
- **react-query data fetching** — provider is mounted, but there are no `useQuery` calls. Data flows through zustand.
- **Dark mode** — `theme.css` has a full `.dark` block, but there's no toggle and no `.dark` class setter.
- **Drag-and-drop** — `@dnd-kit` only appears in unrouted legacy survey code, unreachable from the hotel product.

Drag-resizable **sidebar** and **table columns** are real and shipped — those use a custom
`resizable-columns.tsx`, not dnd-kit, and are safe to show.
