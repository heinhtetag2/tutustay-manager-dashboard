# Components — Inventory & Patterns

> What exists, what's reused, and what's re-implemented inline across 70 `.tsx` files.

## The headline finding

The codebase is **token-rich but component-poor.** Design *values* are well-tokenised (CSS custom properties used 5,000+ times), but there is **almost no shared component layer** to enforce how those tokens combine. Concretely:

- **1** component uses `class-variance-authority` (`button.tsx`) — and it is imported by **0** files.
- **412** raw inline `<button>` elements exist across pages, each re-declaring padding, height, radius, color and hover.
- The classic shadcn primitives — **Card, Input, Badge, Dialog, Select, Table, Tabs, Tooltip** — are **not present as files** despite all the underlying `@radix-ui/*` packages being installed.

The result: every page hand-assembles the same patterns from Tailwind utilities. They look consistent today because the team is disciplined, but consistency is enforced by **copy-paste, not by code** — which is the core maintainability risk this system faces.

---

## What IS shared (`src/shared/ui/`)

These are **composite, app-specific** components — not foundational primitives:

| File | Type | Role |
|---|---|---|
| `button.tsx` | primitive (cva) | 6 variants × 4 sizes. **Defined but unused** — adopt it (R-2). |
| `side-sheet.tsx` | layout primitive | Right-edge drawer shell; basis of all `*-drawer` composites |
| `drawer.tsx` | layout primitive | Vaul-based bottom/side drawer |
| `two-step-drawer.tsx` | pattern | Two-pane drawer flow |
| `brand-select.tsx` | form | Styled select wrapper |
| `multi-select.tsx` | form | Multi-value select |
| `calendar.tsx` | form | react-day-picker wrapper |
| `portal.tsx` | utility | Portal mount |
| `resizable-columns.tsx` | utility hook | Table column resize |
| `booking-toasts.tsx` | feature | `useBookingToasts` — stacked toast system (Framer Motion) |
| `*-drawer.tsx` (×8) | feature composites | Company info, change email/password, delete account, invite friends, trust level, quality guidelines, blocked companies |

**Observation:** the shared layer skews toward **drawers and settings flows** (the recently-active feature area) and lacks the everyday primitives that pages actually need most.

---

## Recurring inline patterns (candidates for extraction)

These are assembled by hand on nearly every page. Each should become one component. Canonical class strings observed in the code:

### Card / Panel  — *28 files re-implement this*
```html
<div class="bg-white rounded-md border border-[var(--border-default)] overflow-hidden shadow-none">
```
→ Extract as `<Card>`. Note the literal `bg-white` (should be `--surface`, breaks dark mode).

### Primary button  — *part of 412 inline buttons*
```html
<button class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] rounded-md
               text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)]
               transition-colors cursor-pointer">
```
→ This is **exactly** `Button variant="default"`. Replace with the primitive.

### Status badge  — status-tinted pill
```html
<span class="rounded-full text-xs font-medium px-2 py-0.5
             bg-[var(--success-tint)] text-[var(--success)] border border-[var(--success-border)]">
```
→ Extract as `<Badge tone="success|danger|warning|brand|neutral">`. The tint+border+fg triplet is uniform across statuses — perfect for a `cva` `tone` variant.

### Empty state
```html
<div class="bg-white border border-[var(--border-default)] rounded-md p-12 text-center">
```
→ Extract as `<EmptyState>`.

### Page container
```html
<div class="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
```
→ Extract as `<PageContainer>` (46 occurrences).

### Control heights — ⚠️ inconsistent
Inline interactive controls use mixed heights: `h-8` (76) · `h-10` (58) · `h-9` (52) · `h-11` (4) · `h-12` (7). The `Button` primitive already standardises these as `sm=h-8 / default=h-9 / lg=h-10`. Adopting it resolves the drift.

---

## Iconography
**lucide-react** (single icon library) — sizes via `[&_svg]:size-4` convention and `w-4 h-4` inline. Consistent. Keep one library.

---

## Accessibility notes
- Radix primitives bring focus management, roles and keyboard nav **for the composites that use them** — but the 412 hand-rolled `<button>`s rely on native semantics only (acceptable for true buttons, risky where `<div onClick>` is used instead).
- Focus ring is tokenised (`--ring` → `focus-visible:ring-[3px]`) in the Button primitive; inline buttons frequently **omit a visible focus style**. Adopting the primitive fixes this app-wide.
- `cursor-pointer` is applied manually 456× — a side-effect of using `<button>`/`<div>` without the primitive's baked-in styling.
