# Foundations — TutuStay Hotel Manager

> The primitive and semantic decisions that everything else is built from.
> Source of truth in code: [`src/styles/theme.css`](../src/styles/theme.css) and [`src/styles/fonts.css`](../src/styles/fonts.css).
> Machine-readable mirror: [`tokens.json`](./tokens.json).

The system is **three-tiered**, which is the right architecture and worth preserving:

```
Tier 1 — Palette      --color-base-{ramp}-{step}     primitive, theme-invariant
            ↓ aliased by
Tier 2 — Semantic     --brand-primary, --text-*, …   what UI references
            ↓ aliased by
Tier 3 — shadcn map   --primary, --background, …     adapter for Radix primitives
```

Re-theming the whole product = re-point Tier 2. UI never reads Tier 1 directly.

---

## 1. Color

### Brand & ink (the everyday 90%)

| Semantic token | Value (light) | Palette source | Used for |
|---|---|---|---|
| `--brand-primary` | `#1d3d58` | ocean-70 | Primary buttons, active nav, key accents (512 refs) |
| `--brand-primary-hover` | `#2b5782` | ocean-60 | Hover state of the above |
| `--brand-accent` | `#447aaf` | ocean-50 | Focus ring, softer accent |
| `--brand-tint` | `#dae5fc` | ocean-20 | Selected/active background wash (125 refs) |
| `--brand-border` | `#dae5fc` | ocean-20 | Border on brand surfaces |
| `--text-primary` | `#2b2926` | sand-80 | Body & headings (848 refs) |
| `--text-secondary` | `#585450` | sand-60 | Secondary copy, labels (771 refs) |
| `--text-tertiary` | `#3f3c39` | sand-70 | Tertiary copy (417 refs) ⚠️ *darker than secondary — see R-7* |
| `--text-muted` | `#77736e` | sand-50 | Placeholder, disabled, meta |
| `--surface` | `#ffffff` | sand-0 | Page/card base |
| `--surface-subtle` | `#f8f7f7` | sand-10 | Zebra rows, wells, hover (639 refs) |
| `--surface-muted` | `#f8f7f7` | sand-10 | Page background ⚠️ *duplicate of subtle — see R-7* |
| `--border-default` | `#ebebea` | sand-20 | Default hairline (536 refs) |
| `--border-strong` | `#d8d6d4` | sand-30 | Emphasised divider |

### Status colors

| Family | default | strong | tint | border | Palette |
|---|---|---|---|---|---|
| **Success** | `--success` evergreen-60 | `--success-strong` evergreen-50 | `--success-tint` evergreen-20 | `--success-border` evergreen-30 | Evergreen |
| **Danger** | `--danger` red-60 | `--danger-strong` red-50 / `--danger-deep` red-70 | `--danger-tint` red-10 | `--danger-border` red-20 | Data·Red |
| **Warning** | `--warning` ember-60 | `--warning-strong` ember-50 / `--warning-deep` ember-70 | `--warning-tint` ember-20 | `--warning-border` ember-20 | Ember |
| **Accent·Violet** | `--accent-violet` violet-40 | `--accent-violet-deep` iris-70 | `--accent-violet-tint` iris-10 | — | Iris/Violet |
| **Accent·Teal** | `--accent-teal` turquoise-60 | `--accent-teal-strong` turquoise-50 | — | — | Turquoise |

**Convention** (consistent and good): each status reads `*-tint` background + `*-border` border + `*` (or `*-strong`) foreground for badges/banners.

### Full primitive ramps

13 neutral/brand/data ramps live in `theme.css`, each `10→80` (sand goes `0→90`). Ramps: **sand** (neutral), **ocean** (brand), **rust, pebble, sakura, iris, moss, tropic, evergreen, ember, sunbeam**, plus 11 **data-viz** ramps (yellow, olive, green, turquoise, blue, violet, purple, pink, red, orange). See [`tokens.json`](./tokens.json) for every step.

> Most palette ramps (rust, pebble, sakura, moss, tropic, sunbeam…) are defined but **not yet referenced by any semantic token** — they're an intentional reserve for future categorisation/labels. Keep them in Tier 1; only promote to Tier 2 when a real use appears.

### Chart sequence
`--chart-1…5` = blue-50 · green-50 · yellow-40 · violet-40 · orange-50.

---

## 2. Typography

**Typeface:** ABC Diatype (self-hosted `.otf`, `/public/fonts`), with `Inter` → `Noto Sans KR` → system fallbacks. Four weights loaded: **300 / 400 / 500 / 700**. Regular + Medium are `<link rel=preload>`'d in `index.html` to prevent heading FOUT.

**Weights in practice:** `font-medium` (500) is the workhorse — **1125 uses** and the default for every heading, label, button and input via `@layer base`. `font-normal` (400) for body, `font-semibold` (600) rare (11). There is effectively a **two-weight system (400/500)**; treat 600/700 as exceptional.

**Type scale (observed usage, most→least):**

| Token | Size / line-height | Uses | Role |
|---|---|---|---|
| `text-sm` | 14 / 1.5 | 875 | **Default UI text** |
| `text-xs` | 12 / 1.5 | 430 | Meta, captions |
| `text-[11px]` | 11 | 166 | Dense labels ⚠️ *un-tokenised* |
| `text-base` | 16 / 1.5 | 97 | Body, `h4`, inputs |
| `text-lg` | 18 / 1.5 | 52 | `h3` |
| `text-2xl` | 24 / 1.5 | 41 | `h1` |
| `text-3xl` | 30 | 40 | Display figures (KPIs) |
| `text-[13px]` | 13 | 35 | ⚠️ *un-tokenised* |
| `text-[10px]` | 10 | 30 | ⚠️ *un-tokenised* |
| `text-xl` | 20 / 1.5 | 13 | `h2` |

**Element defaults** (in `@layer base`, overridable by utilities): `h1`=text-2xl, `h2`=text-xl, `h3`=text-lg, `h4`/`label`/`button`=text-base, all weight 500, line-height 1.5; `input`=text-base/400.

**Font features:** `kern` on globally; `tabular-nums` opted-in per element (good for tables/money). No Inter-specific stylistic sets applied (correct for Diatype).

---

## 3. Spacing

Clean **4px base grid** (Tailwind default, `0.25rem` steps). No arbitrary spacing exists except `m-[1px]` (4×, hairline alignment) — excellent discipline.

Observed gap scale, most→least: `gap-2`(8) ›`gap-3`(12) ›`gap-1.5`(6) ›`gap-4`(16) ›`gap-1`(4) ›`gap-6`(24). **8px and 12px are the rhythm.**

**Page container idiom** (46 occurrences, the de-facto layout primitive):
```
px-6 md:px-8 xl:px-12 py-8   →   24/32/48px responsive horizontal, 32px vertical
```

---

## 4. Radius

Driven by one knob: `--radius: 0.875rem` (14px). Tailwind maps `sm/md/lg/xl` as computed offsets.

| Utility | Computed | Uses | Role |
|---|---|---|---|
| `rounded-md` | 12px | **808** | Default — cards, buttons, inputs, fields |
| `rounded-full` | pill | **222** | Pills, avatars, status dots, icon buttons |
| `rounded-lg` | 14px | 9 | Larger containers |
| `rounded-sm` | 10px | 4 | Small chips |

⚠️ Strays: `rounded-[4px]`, `rounded-[5px]`, `rounded-[1px]`, `rounded-xl`, `rounded-2xl` (1 each) — round these to the scale.

---

## 5. Elevation (shadows)

There is **no shadow token** today — 11 distinct arbitrary `rgba(44,38,39,a)` values are sprinkled inline, plus `shadow-none` is applied **177 times** to forcibly flatten shadcn defaults (a strong signal the system wants a flat, border-first aesthetic).

The 11 values collapse cleanly into **4 elevation steps + 1 drawer shadow** — see `shadow.*` in [`tokens.json`](./tokens.json) and R-3 in [`recommendations.md`](./recommendations.md). Ink color is always `#2c2627`; only Y-offset (4/8px), blur (16/28px) and alpha (.08–.18) vary.

---

## 6. Motion

Minimal and consistent: `transition-colors` (607 uses) for hover/state, `transition-all` on buttons, `duration-300` (7) for the few timed animations. `motion` (Framer) is a dependency for richer sequences (e.g. stacked booking toasts). No easing tokens defined — acceptable at current scale.

---

## 7. Dark mode — ⚠️ incomplete

`.dark` overrides only the **Tier-3 shadcn vars** (in `oklch`). It does **not** redefine the **Tier-2 semantic layer** (`--text-primary`, `--surface`, `--border-default`, …), which is set only under `:root`. Because product UI references Tier 2 directly (800+ `var(--text-primary)`, 485 `bg-white`), **dark mode is currently non-functional for real screens.** This is the single biggest structural gap — see R-1.
