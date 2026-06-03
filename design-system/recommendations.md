# Recommendations — Consistency & Maintainability

Prioritised by **impact ÷ effort**. Each item is concrete and references real evidence from the codebase. Nothing here is applied automatically — these are proposals for review.

| # | Recommendation | Impact | Effort | Theme |
|---|---|---|---|---|
| **R-1** | Make dark mode functional by overriding the semantic tier | 🔴 High | M | Correctness |
| **R-2** | Adopt the existing `Button` primitive (currently 0 imports) | 🔴 High | M | Consistency |
| **R-3** | Add elevation (shadow) tokens; replace 11 ad-hoc values | 🟠 Med | S | Consistency |
| **R-4** | Replace `bg-white`/`text-white` literals with surface tokens | 🟠 Med | S | Consistency + dark mode |
| **R-5** | Expose every semantic token as a Tailwind utility; drop `[var(--…)]` | 🟠 Med | S | DX / maintainability |
| **R-6** | Extract Card, Badge, Input, EmptyState, PageContainer primitives | 🟠 Med | M | Consistency |
| **R-7** | Fix token redundancy & the tertiary/secondary inversion | 🟡 Low | S | Hygiene |
| **R-8** | Tokenise the `10/11/13px` type steps | 🟡 Low | S | Hygiene |
| **R-9** | Refresh stale `FOUNDATION.md` (describes a different product) | 🟡 Low | S | Docs |

---

### R-1 — Make dark mode functional 🔴
**Problem:** `.dark` only overrides Tier-3 shadcn vars (`--background`, `--primary`…). The Tier-2 semantic layer (`--text-primary`, `--surface`, `--border-default`, the status tints) is defined **only** in `:root`. Product UI reads Tier-2 directly (800+ `var(--text-primary)`), so toggling `.dark` changes almost nothing on real screens.

**Fix:** add a Tier-2 block inside `.dark` that re-points semantics to dark-appropriate palette steps. Because the architecture is already aliased, this is purely additive — no component changes:
```css
.dark {
  --text-primary:     var(--color-base-sand-10);
  --text-secondary:   var(--color-base-sand-30);
  --text-tertiary:    var(--color-base-sand-40);
  --text-muted:       var(--color-base-sand-50);
  --surface:          var(--color-base-sand-80);
  --surface-subtle:   var(--color-base-sand-70);
  --surface-muted:    var(--color-base-sand-80);
  --border-default:   var(--color-base-sand-70);
  --border-strong:    var(--color-base-sand-60);
  --brand-primary:    var(--color-base-ocean-40);
  --brand-primary-hover: var(--color-base-ocean-30);
  --brand-tint:       var(--color-base-ocean-80);
  /* …status tints likewise re-point to dark variants */
}
```
*Prerequisite for R-4 to pay off.* If dark mode is **not** a near-term goal, document that explicitly so the half-wired `.dark` block isn't mistaken for working support.

---

### R-2 — Adopt the `Button` primitive 🔴
**Problem:** [`button.tsx`](../src/shared/ui/button.tsx) defines 6 variants × 4 sizes with cva, focus rings and disabled states — and is imported **0 times**. Pages instead hand-roll **412** `<button>`s, each repeating `inline-flex items-center gap-2 px-4 py-2 … hover:… transition-colors cursor-pointer`.

**Impact:** standardises height/padding/radius (resolves the `h-8/9/10/11/12` drift), guarantees a visible focus ring everywhere (accessibility), and removes ~412 copies of the same string.

**Fix:** align the primitive's tokens to the product (it currently uses shadcn `bg-primary`; the product's primary button uses `bg-[var(--brand-primary)]` — these resolve to the same color, so it already matches). Then codemod inline primary/secondary/ghost buttons to `<Button variant=…>`. Do it page-by-page; start with the highest-traffic pages.

---

### R-3 — Elevation tokens 🟠
**Problem:** 11 distinct `shadow-[0_…_rgba(44,38,39,a)]` arbitrary values; `shadow-none` forced 177×.

**Fix:** add 5 tokens (already specified in [`tokens.json`](./tokens.json) → `shadow.*`) and expose as Tailwind utilities:
```css
@theme inline {
  --shadow-xs:     0 4px 16px rgba(44,38,39,0.08);
  --shadow-sm:     0 4px 16px rgba(44,38,39,0.12);
  --shadow-md:     0 8px 28px rgba(44,38,39,0.12);
  --shadow-lg:     0 8px 28px rgba(44,38,39,0.16);
  --shadow-drawer: -8px 0 28px rgba(44,38,39,0.10);
}
```
Then `shadow-[0_4px_16px_rgba(44,38,39,0.08)]` → `shadow-xs`. The flat, border-first aesthetic (177× `shadow-none`) is a deliberate design stance — keep it; tokens just make the *exceptions* consistent.

---

### R-4 — Kill `bg-white` / `text-white` literals 🟠
**Problem:** `bg-white` used **485×**, `text-white` **162×**, plus ~22 raw hex (`#FFFFFF`, `#dc2626`, `#7c3aed`…). These bypass the token layer and are the main reason dark mode (R-1) won't fully land even after fixing the `.dark` block.

**Fix:** `bg-white` → `bg-surface` (= `--surface`); `text-white` on brand buttons → `text-[var(--text-on-brand)]` (new alias for `constants-light`); replace stray hex with the nearest semantic token. Mechanical find-and-replace, high consistency yield.

---

### R-5 — Expose all semantics as utilities; retire `[var(--…)]` 🟠
**Problem:** `@theme inline` exposes only ~12 of ~50 semantic tokens as clean utilities (`bg-brand-primary`, `text-success`). Pages therefore use the **verbose arbitrary form 5,000+ times**: `text-[var(--text-primary)]`, `bg-[var(--surface-subtle)]`. The clean utilities that *do* exist are barely used because coverage is partial.

**Fix:** complete the `@theme inline` map so **every** semantic token has a utility, then codemod:
```
text-[var(--text-primary)]   →  text-primary      (or text-ink)
bg-[var(--surface-subtle)]   →  bg-surface-subtle
border-[var(--border-default)] → border-default
```
Result: shorter, lintable, autocomplete-friendly class names; the token layer becomes the obvious path. *(Pick a naming scheme that avoids colliding with shadcn's `text-primary`=brand — e.g. namespace ink as `text-ink/ink-secondary`.)*

---

### R-6 — Extract the five recurring primitives 🟠
Per [`components.md`](./components.md), extract `Card`, `Badge` (cva `tone` variant), `Input`, `EmptyState`, `PageContainer`. These five cover the overwhelming majority of inline repetition. `Badge` especially: the `tint + border + foreground` status triplet is already uniform, so a `cva({ tone: success|danger|warning|brand|neutral })` is a near-mechanical lift that locks in correctness.

---

### R-7 — Token hygiene 🟡
- `--surface-muted` ≡ `--surface-subtle` (both sand-10) and `--brand-tint` ≡ `--brand-tint-2` (both ocean-20): either give them distinct values or collapse to one. Keeping identical-but-separate tokens invites future drift.
- `--text-tertiary` (sand-70, **darker**) is darker than `--text-secondary` (sand-60). Semantically, tertiary should be *lighter/less prominent*. Either swap the mappings or rename to reflect intent (e.g. `--text-strong`).

---

### R-8 — Tokenise small type steps 🟡
`text-[11px]` (166), `text-[13px]` (35), `text-[10px]` (30) are un-tokenised. Add `--text-2xs:10px`, `--text-xs2:11px`, `--text-sm2:13px` (names TBD) or fold into the nearest existing step. They're already specified in [`tokens.json`](./tokens.json) → `typography.fontSize`.

---

### R-9 — Refresh `FOUNDATION.md` 🟡
[`FOUNDATION.md`](../FOUNDATION.md) describes the **"iDap Business" portal** (expenses, funding, employees, Mongolian locale, `api.idap.mn`). The actual product is **TutuStay Hotel Manager** (bookings, reservations, coupons, payouts, hotel setup). The doc is a stale fork artifact — update or remove so it doesn't mislead onboarding.

---

## Suggested sequence
1. **R-9 + R-7 + R-8** — quick hygiene, no risk (an afternoon).
2. **R-3 + R-5** — token/utility completion (enables clean codemods).
3. **R-4** — literal → token sweep.
4. **R-2 + R-6** — component extraction & adoption (the big consistency win).
5. **R-1** — dark mode, once the semantic layer is the sole styling path.

Each phase leaves the system shippable; together they convert "consistent by discipline" into "consistent by construction."
