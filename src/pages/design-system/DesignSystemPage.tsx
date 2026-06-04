import React from 'react';
import { Button } from '@/shared/ui/button';

/* ============================================================================
   LIVE DESIGN SYSTEM REFERENCE  —  route: /design-system
   Renders from the real CSS variables in src/styles/theme.css and the live
   ABC Diatype font, so it can never drift from production tokens. Reference /
   handoff surface only — not part of the product nav.
   ============================================================================ */

/* ----- helpers ------------------------------------------------------------ */

function rgbToHex(rgb: string): string {
  const m = rgb.match(/\d+(\.\d+)?/g);
  if (!m) return rgb;
  const [r, g, b, a] = m.map(Number);
  const hex = (n: number) => n.toString(16).padStart(2, '0');
  const base = `#${hex(r)}${hex(g)}${hex(b)}`;
  return a !== undefined && a < 1 ? `${base} · ${Math.round(a * 100)}%` : base;
}

/** Reads the *resolved* color of a `var(--token)` by probing a real element. */
function useResolved(cssValue: string, prop: 'backgroundColor' | 'color' = 'backgroundColor') {
  const ref = React.useRef<HTMLDivElement>(null);
  const [val, setVal] = React.useState('');
  React.useEffect(() => {
    if (ref.current) setVal(rgbToHex(getComputedStyle(ref.current)[prop]));
  }, [cssValue, prop]);
  return { ref, val };
}

/* ----- primitives for the doc itself -------------------------------------- */

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 mb-16">
      <h2 className="text-2xl font-medium text-[var(--text-primary)] mb-1">{title}</h2>
      {intro && <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-2xl">{intro}</p>}
      {children}
    </section>
  );
}

function ColorSwatch({ token, label }: { token: string; label?: string }) {
  const { ref, val } = useResolved(`var(${token})`);
  return (
    <div className="flex flex-col">
      <div
        ref={ref}
        className="h-16 w-full rounded-md border border-[var(--border-default)]"
        style={{ background: `var(${token})` }}
      />
      <div className="mt-2 text-[13px] font-medium text-[var(--text-primary)]">{label ?? token}</div>
      <div className="text-[11px] text-[var(--text-muted)] font-mono">{token}</div>
      <div className="text-[11px] text-[var(--text-tertiary)] font-mono tabular-nums">{val}</div>
    </div>
  );
}

function Ramp({ name, steps }: { name: string; steps: { step: string; hex: string }[] }) {
  return (
    <div className="mb-4">
      <div className="text-[13px] font-medium text-[var(--text-primary)] mb-1 capitalize">{name}</div>
      <div className="flex rounded-md overflow-hidden border border-[var(--border-default)]">
        {steps.map((s) => (
          <div key={s.step} className="flex-1 group relative" title={`${name}-${s.step} ${s.hex}`}>
            <div className="h-12" style={{ background: s.hex }} />
            <div className="text-[10px] text-center text-[var(--text-muted)] py-0.5 font-mono">{s.step}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----- token data --------------------------------------------------------- */

const SEMANTIC_GROUPS: { group: string; tokens: { token: string; label: string }[] }[] = [
  {
    group: 'Brand',
    tokens: [
      { token: '--brand-primary', label: 'Primary' },
      { token: '--brand-primary-hover', label: 'Primary Hover' },
      { token: '--brand-accent', label: 'Accent' },
      { token: '--brand-tint', label: 'Tint' },
      { token: '--brand-border', label: 'Border' },
    ],
  },
  {
    group: 'Text / Ink',
    tokens: [
      { token: '--text-primary', label: 'Primary' },
      { token: '--text-secondary', label: 'Secondary' },
      { token: '--text-tertiary', label: 'Tertiary ⚠' },
      { token: '--text-muted', label: 'Muted' },
    ],
  },
  {
    group: 'Surface & Border',
    tokens: [
      { token: '--surface', label: 'Surface' },
      { token: '--surface-subtle', label: 'Subtle' },
      { token: '--surface-muted', label: 'Muted (dup)' },
      { token: '--border-default', label: 'Border' },
      { token: '--border-strong', label: 'Border Strong' },
    ],
  },
  {
    group: 'Success',
    tokens: [
      { token: '--success', label: 'Default' },
      { token: '--success-strong', label: 'Strong' },
      { token: '--success-tint', label: 'Tint' },
      { token: '--success-border', label: 'Border' },
    ],
  },
  {
    group: 'Danger',
    tokens: [
      { token: '--danger', label: 'Default' },
      { token: '--danger-strong', label: 'Strong' },
      { token: '--danger-deep', label: 'Deep' },
      { token: '--danger-tint', label: 'Tint' },
      { token: '--danger-border', label: 'Border' },
    ],
  },
  {
    group: 'Warning',
    tokens: [
      { token: '--warning', label: 'Default' },
      { token: '--warning-strong', label: 'Strong' },
      { token: '--warning-deep', label: 'Deep' },
      { token: '--warning-tint', label: 'Tint' },
    ],
  },
  {
    group: 'Accents',
    tokens: [
      { token: '--accent-violet', label: 'Violet' },
      { token: '--accent-violet-deep', label: 'Violet Deep' },
      { token: '--accent-violet-tint', label: 'Violet Tint' },
      { token: '--accent-teal', label: 'Teal' },
      { token: '--accent-teal-strong', label: 'Teal Strong' },
    ],
  },
];

const RAMPS: Record<string, { step: string; hex: string }[]> = {
  sand: [['0','#ffffff'],['10','#f8f7f7'],['20','#ebebea'],['30','#d8d6d4'],['40','#b0adab'],['50','#77736e'],['60','#585450'],['70','#3f3c39'],['80','#2b2926'],['90','#000000']].map(([step,hex])=>({step,hex})),
  ocean: [['10','#ecf3fe'],['20','#dae5fc'],['30','#a8c3eb'],['40','#6697c9'],['50','#447aaf'],['60','#2b5782'],['70','#1d3d58'],['80','#122536']].map(([step,hex])=>({step,hex})),
  rust: [['10','#fff1ee'],['20','#fedbd7'],['30','#fea99f'],['40','#e86f5f'],['50','#d14532'],['60','#9e3225'],['70','#6a2419'],['80','#451610']].map(([step,hex])=>({step,hex})),
  pebble: [['10','#f6f2ef'],['20','#e8e2d8'],['30','#cdbea8'],['40','#a7906c'],['50','#867250'],['60','#66583d'],['70','#493b2c'],['80','#2f271c']].map(([step,hex])=>({step,hex})),
  iris: [['10','#f5f1fd'],['20','#e4dcf9'],['30','#c3b8f4'],['40','#9d84dc'],['50','#7f63c5'],['60','#603fab'],['70','#3f2b73'],['80','#291c4a']].map(([step,hex])=>({step,hex})),
  evergreen: [['10','#ebf4eb'],['20','#d8e8da'],['30','#a5caa9'],['40','#62a265'],['50','#4b814f'],['60','#396039'],['70','#274427'],['80','#1b2d1b']].map(([step,hex])=>({step,hex})),
  ember: [['10','#f9f1ed'],['20','#f3e2d3'],['30','#e4bc9b'],['40','#ce8345'],['50','#b16120'],['60','#884411'],['70','#602f0c'],['80','#402007']].map(([step,hex])=>({step,hex})),
  tropic: [['10','#ebf4f4'],['20','#d3e7e9'],['30','#99cbcc'],['40','#5a9ea0'],['50','#487e7f'],['60','#355d5f'],['70','#294343'],['80','#192929']].map(([step,hex])=>({step,hex})),
};

const TYPE_SCALE = [
  { cls: 'text-3xl', px: '30px', role: 'Display / KPI figures' },
  { cls: 'text-2xl', px: '24px', role: 'h1' },
  { cls: 'text-xl', px: '20px', role: 'h2' },
  { cls: 'text-lg', px: '18px', role: 'h3' },
  { cls: 'text-base', px: '16px', role: 'h4 · body · inputs' },
  { cls: 'text-sm', px: '14px', role: 'Default UI text' },
  { cls: 'text-xs', px: '12px', role: 'Meta · captions' },
];

const SPACING = [
  ['1','4'],['1.5','6'],['2','8'],['3','12'],['4','16'],['5','20'],['6','24'],['8','32'],['12','48'],
];

const RADII = [
  { cls: 'rounded-sm', px: '10px' },
  { cls: 'rounded-md', px: '12px (default · 808 uses)' },
  { cls: 'rounded-lg', px: '14px' },
  { cls: 'rounded-xl', px: '18px' },
  { cls: 'rounded-full', px: 'pill' },
];

const SHADOWS = [
  { name: 'xs', css: '0 4px 16px rgba(44,38,39,0.08)', role: 'Resting cards / dropdowns' },
  { name: 'sm', css: '0 4px 16px rgba(44,38,39,0.12)', role: 'Raised cards' },
  { name: 'md', css: '0 8px 28px rgba(44,38,39,0.12)', role: 'Popovers / panels' },
  { name: 'lg', css: '0 8px 28px rgba(44,38,39,0.16)', role: 'Modals / toasts' },
  { name: 'drawer', css: '-8px 0 28px rgba(44,38,39,0.10)', role: 'Side sheets' },
];

const NAV = [
  ['colors', 'Colors'],
  ['typography', 'Typography'],
  ['spacing', 'Spacing'],
  ['radius', 'Radius'],
  ['elevation', 'Elevation'],
  ['components', 'Components'],
];

/* ----- status badge preview (the proposed <Badge> primitive) -------------- */
function Badge({ tone, children }: { tone: 'success' | 'danger' | 'warning' | 'brand' | 'neutral'; children: React.ReactNode }) {
  const map: Record<string, string> = {
    success: 'bg-[var(--success-tint)] text-[var(--success)] border-[var(--success-border)]',
    danger: 'bg-[var(--danger-tint)] text-[var(--danger)] border-[var(--danger-border)]',
    warning: 'bg-[var(--warning-tint)] text-[var(--warning)] border-[var(--warning-border)]',
    brand: 'bg-[var(--brand-tint)] text-[var(--brand-primary)] border-[var(--brand-border)]',
    neutral: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]',
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${map[tone]}`}>{children}</span>;
}

/* ----- page --------------------------------------------------------------- */

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-muted)] text-[var(--text-primary)]">
      {/* sticky section nav */}
      <header className="sticky top-0 z-10 bg-[var(--surface)]/90 backdrop-blur border-b border-[var(--border-default)]">
        <div className="max-w-6xl mx-auto px-6 md:px-8 xl:px-12 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-lg font-medium">TutuStay · Design System</div>
            <div className="text-xs text-[var(--text-muted)]">Live reference — rendered from <span className="font-mono">theme.css</span></div>
          </div>
          <nav className="flex flex-wrap gap-1">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="px-3 py-1.5 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors">{label}</a>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-8 xl:px-12 py-12">
        {/* COLORS */}
        <Section id="colors" title="Color" intro="Semantic tokens (Tier 2) are what UI references. Each resolves to a primitive ramp step (Tier 1) shown below. Re-theme by re-pointing the semantic layer.">
          {SEMANTIC_GROUPS.map((g) => (
            <div key={g.group} className="mb-8">
              <h3 className="text-base font-medium mb-3">{g.group}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {g.tokens.map((t) => <ColorSwatch key={t.token} token={t.token} label={t.label} />)}
              </div>
            </div>
          ))}

          <h3 className="text-base font-medium mb-3 mt-10">Primitive ramps (Tier 1)</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-2xl">Sand = neutral ink/surfaces · Ocean = brand · Evergreen/Ember = success/warning. Rust, pebble, iris, tropic are defined reserves (not yet aliased).</p>
          {Object.entries(RAMPS).map(([name, steps]) => <Ramp key={name} name={name} steps={steps} />)}
        </Section>

        {/* TYPOGRAPHY */}
        <Section id="typography" title="Typography" intro="ABC Diatype (self-hosted), with Inter → Noto Sans KR fallbacks. Effective two-weight system: Regular 400 + Medium 500. All sizes use line-height 1.5.">
          <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] divide-y divide-[var(--border-default)]">
            {TYPE_SCALE.map((t) => (
              <div key={t.cls} className="flex items-baseline gap-4 px-5 py-4">
                <div className={`${t.cls} font-medium flex-1 truncate`}>The quick brown fox · Аяны зам</div>
                <div className="text-xs text-[var(--text-muted)] font-mono w-20 text-right">{t.px}</div>
                <div className="text-xs text-[var(--text-tertiary)] w-44 hidden md:block">{t.role}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-5">
            {[['Light','font-light','300'],['Regular','font-normal','400'],['Medium','font-medium','500'],['Bold','font-bold','700']].map(([n,c,w])=>(
              <div key={n} className="text-center">
                <div className={`text-2xl ${c}`}>Aa</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{n} · {w}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* SPACING */}
        <Section id="spacing" title="Spacing" intro="4px base grid (Tailwind default). 8px and 12px carry the rhythm. Page container: px-6 md:px-8 xl:px-12 py-8.">
          <div className="space-y-2">
            {SPACING.map(([unit, px]) => (
              <div key={unit} className="flex items-center gap-4">
                <div className="w-16 text-xs font-mono text-[var(--text-tertiary)]">{unit} · {px}px</div>
                <div className="h-4 rounded-sm bg-[var(--brand-primary)]" style={{ width: `${px}px` }} />
              </div>
            ))}
          </div>
        </Section>

        {/* RADIUS */}
        <Section id="radius" title="Radius" intro="Driven by one knob: --radius = 0.875rem (14px). rounded-md (12px) is the default for cards, buttons and inputs.">
          <div className="flex flex-wrap gap-6">
            {RADII.map((r) => (
              <div key={r.cls} className="text-center">
                <div className={`size-20 ${r.cls} bg-[var(--brand-tint)] border border-[var(--brand-border)]`} />
                <div className="text-[13px] font-mono mt-2">{r.cls}</div>
                <div className="text-[11px] text-[var(--text-muted)]">{r.px}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ELEVATION */}
        <Section id="elevation" title="Elevation" intro="Proposed tokens that consolidate the 11 ad-hoc shadow values found in code (all ink rgba(44,38,39,a)). The product favours a flat, border-first look — shadow-none is used 177×.">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {SHADOWS.map((s) => (
              <div key={s.name} className="text-center">
                <div className="size-24 mx-auto rounded-md bg-[var(--surface)]" style={{ boxShadow: s.css }} />
                <div className="text-[13px] font-mono mt-3">shadow-{s.name}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{s.role}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* COMPONENTS */}
        <Section id="components" title="Components" intro="Button is the live primitive (src/shared/ui/button.tsx). Badge, Card and EmptyState below are proposed extractions previewing the recurring inline patterns.">
          <h3 className="text-base font-medium mb-3">Button — variants</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <h3 className="text-base font-medium mb-3">Button — sizes</h3>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>

          <h3 className="text-base font-medium mb-3">Badge — status tones</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge tone="success">Confirmed</Badge>
            <Badge tone="danger">Cancelled</Badge>
            <Badge tone="warning">Pending</Badge>
            <Badge tone="brand">New</Badge>
            <Badge tone="neutral">Draft</Badge>
          </div>

          <h3 className="text-base font-medium mb-3">Card &amp; Empty state</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[var(--surface)] rounded-md border border-[var(--border-default)] p-5">
              <div className="text-sm font-medium">Card</div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">surface + border + rounded-md. The everyday container (~28 inline copies today).</p>
            </div>
            <div className="bg-[var(--surface)] rounded-md border border-[var(--border-default)] p-10 text-center">
              <p className="text-sm text-[var(--text-secondary)]">No results found.</p>
              <Button variant="outline" size="sm" className="mt-3">Reset filters</Button>
            </div>
          </div>
        </Section>

        <footer className="border-t border-[var(--border-default)] pt-6 text-xs text-[var(--text-muted)]">
          Full token tables, component inventory and the consistency roadmap live in <span className="font-mono">/design-system/*.md</span> at the repo root.
        </footer>
      </main>
    </div>
  );
}
