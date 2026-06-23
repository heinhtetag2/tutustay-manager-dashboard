import React from 'react';
import { AnimatePresence } from 'motion/react';
import type { DateRange } from 'react-day-picker';
import {
  Building2, Tag, Plus, Trash2, Download, ArrowRight, Bell,
  LogIn, LogOut, Ban, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { BrandSelect } from '@/shared/ui/brand-select';
import { MultiSelect } from '@/shared/ui/multi-select';
import { InfoTooltip, Term } from '@/shared/ui/info-tooltip';
import { Calendar } from '@/shared/ui/calendar';
import { useBookingToasts } from '@/shared/ui/booking-toasts';
import { useResizableColumns, ColResizeHandle } from '@/shared/ui/resizable-columns';
import { Section, ComponentEntry, DemoLabel } from './_doc';
import { ComposedPatterns } from './composed-patterns';
import { RoomTypeEditor } from '@/pages/hotel/RoomTypeEditor';
import { RoomEditor } from '@/pages/hotel/room-editors';
import { CouponFormSheet } from '@/pages/coupons/CouponFormSheet';
import { EmployeeEditor } from '@/pages/agents/EmployeeEditor';
import { emptyRoomType, type Room } from '@/pages/hotel/hotel-data';
import { useHotel } from '@/pages/hotel/use-hotel';
import type { Employee } from '@/pages/agents/agents-data';
import { SalesDayDetailSheet } from '@/pages/sales-calendar/SalesDayDetailSheet';
import type { Reservation } from '@/pages/reservations/reservations-data';

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
  ['buttons', 'Buttons'],
  ['forms', 'Forms'],
  ['feedback', 'Feedback'],
  ['containers', 'Containers'],
  ['drawers', 'Drawers'],
  ['layout', 'Layout'],
  ['cards', 'Cards & Stats'],
  ['tables', 'Tables & Filters'],
  ['charts', 'Charts'],
  ['banners', 'Banners & Overlays'],
];

/**
 * Sticky "On this page" rail (Polaris-style). Lists every section and
 * highlights the one currently in view via an IntersectionObserver.
 * Hidden below xl — the horizontal header nav covers narrower screens.
 */
function OnThisPage() {
  const [active, setActive] = React.useState<string>(NAV[0][0]);

  React.useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );
    NAV.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <aside className="hidden xl:block w-52 shrink-0">
      <div className="sticky top-24">
        <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-tertiary)] mb-3">On this page</div>
        <nav className="flex flex-col border-l border-[var(--border-default)]">
          {NAV.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={`-ml-px pl-3 py-1.5 text-[13px] border-l-2 transition-colors ${
                active === id
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-medium'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

/* ----- page --------------------------------------------------------------- */

export default function DesignSystemPage() {
  // Interactive demo state for the live component gallery.
  const [roomType, setRoomType] = React.useState('deluxe');
  const [amenities, setAmenities] = React.useState<string[]>(['Wi-Fi', 'Breakfast']);
  const [day, setDay] = React.useState<Date | undefined>(new Date(2026, 5, 9));
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const [productForm, setProductForm] = React.useState<string | null>(null);
  const pushToast = useBookingToasts((s) => s.push);

  // Real product create/edit forms reuse the live hotel store.
  const { roomTypes, property } = useHotel();
  const newRoomType = () => ({ ...emptyRoomType(), weekendDays: [...property.defaultWeekendDays], sessionHours: property.defaultSessionHours });
  const emptyRoom = (): Room => ({ id: '', floor: 1, number: '', typeName: roomTypes[0]?.name ?? '', beds: 1, occupancy: 2, amenities: [], price: roomTypes[0]?.regularPrice ?? 0, status: 'Active' });
  const emptyEmployee = (): Employee => ({ id: '', employeeId: '', fullName: '', email: '', phone: '', role: 'Staff', hireDate: '', status: 'Active' });
  const closeForm = () => setProductForm(null);

  // Sample bookings for the Sales Calendar day-detail demo.
  const sampleDay = new Date('2026-06-03T00:00:00');
  const sampleBookings: Reservation[] = [
    { id: 'demo-1', code: 'RSV-1057', guestName: 'Noah Williams', guestEmail: 'noah.williams@example.com', roomType: 'Standard', roomNo: '112', checkIn: '2026-06-03T10:00:00', checkOut: '2026-06-03T15:00:00', nights: 0, guests: 1, amount: 35000, rateType: 'Session', status: 'Confirmed', createdAt: '2026-05-20T09:00:00' },
    { id: 'demo-2', code: 'RSV-1058', guestName: 'Yuki Sato', guestEmail: 'yuki.sato@example.com', roomType: 'Deluxe', roomNo: '309', checkIn: '2026-06-03T14:00:00', checkOut: '2026-06-06T12:00:00', nights: 3, guests: 2, amount: 255000, status: 'Confirmed', createdAt: '2026-05-21T11:30:00' },
  ];

  const fireToast = () =>
    pushToast({
      requestId: 'demo',
      guest: 'Aria Nguyen',
      initial: 'A',
      roomType: 'Deluxe',
      nights: 2,
      guests: 2,
      checkIn: 'Jun 11',
      amount: '160,000',
    });

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

      <div className="max-w-[88rem] mx-auto px-6 md:px-8 xl:px-12 py-12 flex gap-12">
       <main className="min-w-0 flex-1">
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

        {/* ============================ COMPONENTS ============================ */}

        {/* BUTTONS & ACTIONS */}
        <Section id="buttons" title="Buttons & Actions" intro="Button is the live, theme-bound primitive. Every variant, size and state below renders the real component.">
          <ComponentEntry
            name="Button"
            path="src/shared/ui/button.tsx"
            desc="6 variants × 4 sizes, with icon and disabled states. asChild renders the styles onto any child element (e.g. a router link)."
            code={`import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';

// Default
<Button>New room</Button>

// Variant + size
<Button variant="outline" size="sm">Export</Button>

// With a leading icon (auto-sized to 16px)
<Button><Plus /> New room</Button>

// Icon-only — always pass an aria-label
<Button size="icon" aria-label="Add"><Plus /></Button>

// asChild: render button styles onto a router link
<Button asChild><Link to="/rooms">View rooms</Link></Button>`}
            props={[
              { name: 'variant', type: "'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'", default: "'default'", desc: 'Visual weight. Use default for the primary action, outline/ghost for secondary, destructive for irreversible actions.' },
              { name: 'size', type: "'default' | 'sm' | 'lg' | 'icon'", default: "'default'", desc: 'Height and padding. icon renders a square button for an icon-only action.' },
              { name: 'asChild', type: 'boolean', default: 'false', desc: 'Render the button styles onto the single child element instead of a <button> (e.g. a router Link).' },
              { name: 'disabled', type: 'boolean', default: 'false', desc: 'Disables interaction and dims the button to 50% opacity.' },
              { name: '...props', type: 'React.ComponentProps<"button">', desc: 'All native button attributes — onClick, type, aria-label, etc.' },
            ]}
          >
            <DemoLabel>Variants</DemoLabel>
            <div className="flex flex-wrap gap-3 mb-5">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <DemoLabel>Sizes</DemoLabel>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Add"><Plus /></Button>
            </div>
            <DemoLabel>With icon · disabled</DemoLabel>
            <div className="flex flex-wrap items-center gap-3">
              <Button><Plus /> New room</Button>
              <Button variant="outline"><Download /> Export</Button>
              <Button variant="destructive"><Trash2 /> Delete</Button>
              <Button disabled>Disabled</Button>
            </div>
          </ComponentEntry>

          <ComponentEntry name="Status action buttons" path="src/pages/reservations/ReservationDetail.tsx" desc="Lifecycle actions on a record header. Color and icon carry the meaning: danger-outline to cancel, green to check in, orange to check out, and a muted label once the stay is closed. These are hand-styled (not the Button primitive) so the semantic colors match the status badges.">
            <DemoLabel>Reservation lifecycle</DemoLabel>
            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer">
                <Ban className="w-4 h-4" /> Cancel
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--success-strong)] rounded-md hover:bg-[var(--success)] transition-colors cursor-pointer">
                <LogIn className="w-4 h-4" /> Check in
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-data-orange-50)] rounded-md hover:bg-[var(--color-data-orange-60)] transition-colors cursor-pointer">
                <LogOut className="w-4 h-4" /> Check out
              </button>
              <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <CheckCircle2 className="w-4 h-4" /> Closed
              </span>
            </div>
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Check out uses <span className="font-mono">--color-data-orange-50</span> (hover <span className="font-mono">--color-data-orange-60</span>) · Check in uses <span className="font-mono">--success-strong</span> · Cancel uses <span className="font-mono">--danger</span> on <span className="font-mono">--danger-border</span>.
            </p>
          </ComponentEntry>
        </Section>

        {/* FORMS & INPUTS */}
        <Section id="forms" title="Forms & Inputs" intro="Selection and date primitives. These are fully interactive — pick values and watch the state update.">
          <ComponentEntry
            name="BrandSelect"
            path="src/shared/ui/brand-select.tsx"
            desc="Single-select dropdown (Radix Select) with optional left icon and brand-tinted active state."
            code={`import { BrandSelect } from '@/shared/ui/brand-select';
import { Building2 } from 'lucide-react';

const [roomType, setRoomType] = useState('deluxe');

<BrandSelect
  value={roomType}
  onValueChange={setRoomType}
  leftIcon={<Building2 />}
  ariaLabel="Room type"
  options={[
    { value: 'deluxe', label: 'Deluxe' },
    { value: 'suite', label: 'Suite' },
  ]}
/>`}
            props={[
              { name: 'value', type: 'string', required: true, desc: 'The currently selected option value (controlled).' },
              { name: 'onValueChange', type: '(value: string) => void', required: true, desc: 'Fires with the new value when the selection changes.' },
              { name: 'options', type: 'BrandSelectOption[]', required: true, desc: 'Selectable options — each { value: string; label: ReactNode }.' },
              { name: 'placeholder', type: 'string', desc: 'Shown on the trigger when no value is selected.' },
              { name: 'leftIcon', type: 'React.ReactNode', desc: 'Optional icon rendered inside the trigger, before the label.' },
              { name: 'disabled', type: 'boolean', default: 'false', desc: 'Disables the trigger.' },
              { name: 'ariaLabel', type: 'string', desc: 'Accessible label for the trigger when there is no visible label.' },
              { name: 'className', type: 'string', desc: 'Extra classes for the trigger.' },
            ]}
          >
            <div className="max-w-xs">
              <BrandSelect
                value={roomType}
                onValueChange={setRoomType}
                leftIcon={<Building2 />}
                ariaLabel="Room type"
                options={[
                  { value: 'deluxe', label: 'Deluxe' },
                  { value: 'superior', label: 'Superior' },
                  { value: 'suite', label: 'Suite' },
                  { value: 'standard', label: 'Standard' },
                ]}
              />
              <div className="mt-2 text-xs text-[var(--text-muted)] font-mono">value: {roomType}</div>
            </div>
          </ComponentEntry>

          <ComponentEntry
            name="MultiSelect"
            path="src/shared/ui/multi-select.tsx"
            desc="Searchable multi-select with checkboxes, a selected-count label and a clear-all action."
            code={`import { MultiSelect } from '@/shared/ui/multi-select';
import { Tag } from 'lucide-react';

const [amenities, setAmenities] = useState<string[]>([]);

<MultiSelect
  values={amenities}
  onChange={setAmenities}
  leftIcon={<Tag />}
  placeholder="Amenities"
  options={['Wi-Fi', 'Breakfast', 'Parking', 'Pool']}
/>`}
            props={[
              { name: 'values', type: 'string[]', required: true, desc: 'Currently selected values (controlled).' },
              { name: 'onChange', type: '(values: string[]) => void', required: true, desc: 'Fires with the next selection whenever an option is toggled or cleared.' },
              { name: 'options', type: 'string[]', required: true, desc: 'All selectable options.' },
              { name: 'placeholder', type: 'string', required: true, desc: 'Shown on the trigger when nothing is selected.' },
              { name: 'leftIcon', type: 'React.ReactNode', desc: 'Optional icon rendered inside the trigger.' },
              { name: 'searchPlaceholder', type: 'string', default: "'Search'", desc: 'Placeholder for the in-dropdown search field.' },
              { name: 'className', type: 'string', desc: 'Extra classes for the trigger.' },
            ]}
          >
            <div className="max-w-xs">
              <MultiSelect
                values={amenities}
                onChange={setAmenities}
                leftIcon={<Tag />}
                placeholder="Amenities"
                options={['Wi-Fi', 'Breakfast', 'Parking', 'Pool', 'Gym', 'Airport shuttle', 'Pet friendly']}
              />
              <div className="mt-2 text-xs text-[var(--text-muted)] font-mono">[{amenities.join(', ')}]</div>
            </div>
          </ComponentEntry>

          <ComponentEntry
            name="Calendar"
            path="src/shared/ui/calendar.tsx"
            desc="react-day-picker styled to the design system. Supports single-date and range selection."
            code={`import { Calendar } from '@/shared/ui/calendar';
import type { DateRange } from 'react-day-picker';

// Single date
const [day, setDay] = useState<Date>();
<Calendar mode="single" selected={day} onSelect={setDay} />

// Date range
const [range, setRange] = useState<DateRange>();
<Calendar mode="range" selected={range} onSelect={setRange} />`}
            props={[
              { name: 'mode', type: "'single' | 'range' | 'multiple'", default: "'single'", desc: 'Selection behaviour. Forwarded to react-day-picker.' },
              { name: 'selected', type: 'Date | DateRange | Date[]', desc: 'The current selection — shape depends on mode.' },
              { name: 'onSelect', type: '(value) => void', desc: 'Fires with the new selection when the user picks a day or range.' },
              { name: '...props', type: 'DayPickerProps', desc: 'All other react-day-picker props (disabled, numberOfMonths, etc.) pass through.' },
            ]}
          >
            <div className="flex flex-wrap gap-8">
              <div>
                <DemoLabel>Single</DemoLabel>
                <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] inline-block">
                  <Calendar mode="single" selected={day} onSelect={setDay} />
                </div>
              </div>
              <div>
                <DemoLabel>Range</DemoLabel>
                <div className="rounded-md border border-[var(--border-default)] bg-[var(--surface)] inline-block">
                  <Calendar mode="range" selected={range} onSelect={setRange} />
                </div>
              </div>
            </div>
          </ComponentEntry>
        </Section>

        {/* FEEDBACK */}
        <Section id="feedback" title="Status & Feedback" intro="Status pills, inline help and the stacked booking-toast notifications.">
          <ComponentEntry
            name="InfoTooltip & Term"
            path="src/shared/ui/info-tooltip.tsx"
            desc="The (i) affordance reveals a definition on hover, focus or tap. Term looks copy up from the shared glossary."
            code={`import { InfoTooltip, Term } from '@/shared/ui/info-tooltip';

// Standalone (i) tooltip next to a label
Occupancy <InfoTooltip label="Share of bookable rooms filled tonight." />

// Glossary-backed term (definition pulled from the shared GLOSSARY)
This month's <Term name="ADR">ADR</Term> is trending up.`}
            props={[
              { name: 'InfoTooltip · label', type: 'string', required: true, desc: 'The explanatory text revealed on hover/focus/tap.' },
              { name: 'InfoTooltip · side', type: "'top' | 'bottom'", default: "'top'", desc: 'Which side of the trigger the tooltip opens on.' },
              { name: 'Term · name', type: 'keyof typeof GLOSSARY', required: true, desc: 'Glossary key whose definition is shown on hover.' },
              { name: 'Term · children', type: 'React.ReactNode', desc: 'Visible text. Defaults to the glossary key if omitted.' },
              { name: 'className', type: 'string', desc: 'Extra classes for the wrapper (both components).' },
            ]}
          >
            <div className="flex flex-col gap-3 text-sm text-[var(--text-primary)]">
              <span className="inline-flex items-center gap-1">
                Occupancy <InfoTooltip label="The share of your bookable rooms that are filled tonight." />
              </span>
              <span>This month's <Term name="ADR">ADR</Term> and <Term name="RevPAR">RevPAR</Term> are trending up.</span>
            </div>
          </ComponentEntry>

          <ComponentEntry
            name="Booking Toasts"
            path="src/shared/ui/booking-toasts.tsx"
            desc="A zustand store + host that stacks incoming-booking notifications top-right (newest in front; hover to fan out). Click to fire one."
            code={`import { useBookingToasts, BookingToastHost } from '@/shared/ui/booking-toasts';

// Mount the host once, near the app root
<BookingToastHost />

// Push a toast from anywhere
const push = useBookingToasts((s) => s.push);
push({
  requestId: 'req_123',
  guest: 'Aria Nguyen', initial: 'A',
  roomType: 'Deluxe', nights: 2, guests: 2,
  checkIn: 'Jun 11', amount: '160,000',
});`}
            props={[
              { name: 'push', type: "(b: Omit<BookingToast, 'id'>) => void", desc: 'Store action — enqueues a new toast. Read it via useBookingToasts((s) => s.push).' },
              { name: 'dismiss', type: '(id: string) => void', desc: 'Store action — removes a single toast.' },
              { name: 'dismissAll', type: '() => void', desc: 'Store action — clears the whole stack.' },
              { name: '<BookingToastHost />', type: 'Component', desc: 'Renders the stacked toasts. Mount once near the app root.' },
            ]}
          >
            <Button onClick={fireToast}><Bell /> Push a booking toast</Button>
          </ComponentEntry>
        </Section>

        {/* CONTAINERS & LAYOUT */}
        <Section id="containers" title="Containers & Layout" intro="The everyday container, the empty state, and resizable table columns.">
          <ComponentEntry name="Card & Empty state" path="(inline pattern · surface + border)" status="proposed" desc="surface + border + rounded-md — the everyday container (~28 inline copies). Empty state pairs a message with a reset action.">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[var(--surface)] rounded-md border border-[var(--border-default)] p-5">
                <div className="text-sm font-medium">Card</div>
                <p className="text-sm text-[var(--text-secondary)] mt-1">The everyday container for grouped content.</p>
              </div>
              <div className="bg-[var(--surface)] rounded-md border border-[var(--border-default)] p-10 text-center">
                <p className="text-sm text-[var(--text-secondary)]">No results found.</p>
                <Button variant="outline" size="sm" className="mt-3">Reset filters</Button>
              </div>
            </div>
          </ComponentEntry>

          <ComponentEntry name="Resizable columns" path="src/shared/ui/resizable-columns.tsx" desc="Hook + handle for design-system table column resizing. Hover a header edge and drag to resize.">
            <ResizableTableDemo />
          </ComponentEntry>
        </Section>

        {/* FEATURE DRAWERS */}
        <Section id="drawers" title="Feature Drawers" intro="Self-contained, stateful slide-in flows. The product create/edit forms below are the real editors from the app — opening one launches the exact same side sheet a manager uses.">
          <h3 className="text-base font-medium text-[var(--text-primary)] mb-1">Product forms — create &amp; edit</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-2xl">The live create/edit side sheets a hotel manager actually uses. Each opens the real component with an empty draft.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {[
              ['room-type', 'Add Room Type', 'hotel/RoomTypeEditor.tsx', 'Amenities, pricing tabs, beds & occupancy'],
              ['room', 'Add Room', 'hotel/room-editors.tsx', 'Room number, type, beds & status'],
              ['coupon', 'Add Coupon', 'coupons/CouponFormSheet.tsx', 'Discount, validity & room scope'],
              ['employee', 'Add Employee', 'agents/EmployeeEditor.tsx', 'Two-step staff profile + credentials'],
            ].map(([key, name, file, blurb]) => (
              <button
                key={key}
                onClick={() => setProductForm(key)}
                className="text-left rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-4 hover:border-[var(--brand-border)] hover:bg-[var(--brand-tint)]/40 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{name}</span>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors" />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{blurb}</p>
                <div className="text-[11px] font-mono text-[var(--text-muted)] mt-2">{file}</div>
              </button>
            ))}
            <button
              onClick={() => setProductForm('sales-day')}
              className="text-left rounded-md border border-[var(--border-default)] bg-[var(--surface)] p-4 hover:border-[var(--brand-border)] hover:bg-[var(--brand-tint)]/40 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-primary)]">Sales Calendar — day detail</span>
                <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors" />
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Day breakdown side sheet — revenue tiles, status filter, booking list</p>
              <div className="text-[11px] font-mono text-[var(--text-muted)] mt-2">sales-calendar/SalesDayDetailSheet.tsx</div>
            </button>
          </div>
        </Section>

        {/* ===================== COMPOSED PAGE PATTERNS ===================== */}
        <ComposedPatterns />

        <footer className="border-t border-[var(--border-default)] pt-6 text-xs text-[var(--text-muted)]">
          Full token tables, component inventory and the consistency roadmap live in <span className="font-mono">/design-system/*.md</span> at the repo root.
        </footer>
       </main>

        {/* sticky "On this page" rail (Polaris-style) — xl and up */}
        <OnThisPage />
      </div>

      {/* ----- live product create/edit forms ----- */}
      {productForm === 'room-type' && (
        <RoomTypeEditor initial={newRoomType()} onClose={closeForm} onSave={closeForm} />
      )}
      {productForm === 'room' && (
        <RoomEditor initial={emptyRoom()} roomTypes={roomTypes} onClose={closeForm} onSave={closeForm} />
      )}
      {productForm === 'coupon' && (
        <CouponFormSheet coupon={null} onClose={closeForm} />
      )}
      {productForm === 'employee' && (
        <EmployeeEditor mode="new" initial={emptyEmployee()} onClose={closeForm} onSave={closeForm} />
      )}
      <AnimatePresence>
        {productForm === 'sales-day' && (
          <SalesDayDetailSheet day={sampleDay} bookings={sampleBookings} onClose={closeForm} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ----- live demo: resizable table columns --------------------------------- */
function ResizableTableDemo() {
  const { widths, onResizeStart } = useResizableColumns([
    { key: 'guest', w: 160, min: 90 },
    { key: 'room', w: 120, min: 80 },
    { key: 'status', w: 120, min: 80, resizable: false },
  ]);
  const rows = [
    ['Marcus Lee', 'Deluxe', 'Confirmed'],
    ['Grace Park', 'Superior', 'Pending'],
    ['Sofia Marin', 'Suite', 'Confirmed'],
  ];
  return (
    <div className="overflow-x-auto rounded-md border border-[var(--border-default)]">
      <table className="table-fixed border-collapse" style={{ width: widths.guest + widths.room + widths.status }}>
        <colgroup>
          <col style={{ width: widths.guest }} />
          <col style={{ width: widths.room }} />
          <col style={{ width: widths.status }} />
        </colgroup>
        <thead>
          <tr className="group/head bg-[var(--surface-subtle)] text-left">
            <th className="group/col relative px-3 py-2 text-xs font-medium text-[var(--text-secondary)]">
              Guest<ColResizeHandle onPointerDown={(e) => onResizeStart('guest', e)} />
            </th>
            <th className="group/col relative px-3 py-2 text-xs font-medium text-[var(--text-secondary)]">
              Room<ColResizeHandle onPointerDown={(e) => onResizeStart('room', e)} />
            </th>
            <th className="px-3 py-2 text-xs font-medium text-[var(--text-secondary)]">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t border-[var(--border-default)]">
              <td className="px-3 py-2 text-sm text-[var(--text-primary)] truncate">{r[0]}</td>
              <td className="px-3 py-2 text-sm text-[var(--text-secondary)] truncate">{r[1]}</td>
              <td className="px-3 py-2 text-sm text-[var(--text-secondary)] truncate">{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
