# TutuStay — Design System

The design language of the **TutuStay Hotel Manager Dashboard**, extracted from the codebase and organised for designer ↔ developer handoff.

## Contents

| Doc | For | What's inside |
|---|---|---|
| [**foundations.md**](./foundations.md) | Designers + Devs | Color, typography, spacing, radius, elevation, motion — every primitive & semantic token with values, usage counts, and roles |
| [**components.md**](./components.md) | Devs | Component inventory, the recurring inline patterns to extract, accessibility notes |
| [**recommendations.md**](./recommendations.md) | Tech lead + Designers | Prioritised consistency & maintainability roadmap (R-1…R-9), with code |
| [**tokens.json**](./tokens.json) | Tooling | Machine-readable tokens (DTCG format) — import into **Tokens Studio for Figma** or **Style Dictionary** |

## TL;DR — health of the system

The product runs on a mature, **three-tier token architecture** (primitive palette → semantic aliases → shadcn adapter) defined in [`src/styles/theme.css`](../src/styles/theme.css). Token *adoption is excellent*: ~5,000 references to CSS custom properties, near-zero raw hex.

**What's strong** 🟢
- Clean three-tier color architecture — re-theme by re-pointing one layer
- Disciplined 4px spacing grid; no arbitrary spacing
- Single radius knob (`--radius`) driving the whole scale
- One typeface, one icon library, an effective two-weight (400/500) system
- Consistent status convention (tint + border + foreground)

**What needs work** 🔴 (see [recommendations.md](./recommendations.md))
1. **Dark mode is non-functional** — `.dark` overrides the shadcn tier but not the semantic tier that UI actually uses *(R-1)*
2. **No component layer** — the only `cva` primitive (`Button`) has **0 imports**; 412 inline `<button>`s and ~28 hand-built cards re-declare the same styles *(R-2, R-6)*
3. **Verbose styling idiom** — `text-[var(--text-primary)]` ×5,000 because only ~12 of ~50 semantic tokens are exposed as Tailwind utilities *(R-5)*
4. **Untokenised elevation** — 11 ad-hoc shadow values *(R-3)* — and 485 `bg-white` literals bypassing the surface token *(R-4)*

> **One-line verdict:** the *values* are a design system; the *components* are not yet. Consistency today is upheld by team discipline (copy-paste), not by shared code. The roadmap converts it to "consistent by construction."

## Architecture at a glance

```
┌─────────────────────────────────────────────────────────────┐
│ Tier 1  PALETTE     --color-base-{ramp}-{step}   (primitive) │  ← never used directly
│         13 ramps × 8–10 steps + data-viz + external brand    │
├─────────────────────────────────────────────────────────────┤
│ Tier 2  SEMANTIC    --brand-*, --text-*, --surface-*,        │  ← what UI references
│         --success/danger/warning-*, --accent-*               │
├─────────────────────────────────────────────────────────────┤
│ Tier 3  SHADCN MAP  --primary, --background, --ring, …       │  ← adapter for Radix
└─────────────────────────────────────────────────────────────┘
            ↑ exposed to Tailwind via @theme inline (partial — see R-5)
```

## Source-of-truth files

| Concern | File |
|---|---|
| Color tokens + shadcn map + base layer | [`src/styles/theme.css`](../src/styles/theme.css) |
| Font faces (ABC Diatype) | [`src/styles/fonts.css`](../src/styles/fonts.css) |
| Tailwind v4 entry | [`src/styles/tailwind.css`](../src/styles/tailwind.css) |
| `cn()` class merge helper | [`src/shared/lib/cn.ts`](../src/shared/lib/cn.ts) |
| Button primitive (cva) | [`src/shared/ui/button.tsx`](../src/shared/ui/button.tsx) |

## Stack
Vite · React 18 · TypeScript (strict) · Tailwind CSS **v4** (`@theme`) · Radix UI · `class-variance-authority` · `tailwind-merge` + `clsx` · lucide-react · Framer Motion. Feature-Sliced Design layout.

---
*Generated from a design-system review of the codebase. Counts reflect the state of `main` at review time; re-run the scans in `recommendations.md` to refresh.*
