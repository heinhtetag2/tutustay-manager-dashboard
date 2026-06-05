import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  Search, ListFilter, BedDouble, CalendarClock, Calendar as CalendarIcon, X, Check, ChevronRight,
  TriangleAlert, Clock, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight, Hash, Mail, Phone,
  CalendarCheck, CreditCard, CalendarSearch, Rocket, Sparkles, ArrowRight, FlaskConical, Trash2,
  LayoutDashboard, ClipboardList, KeyRound, Star, UserPlus, LogIn, Ban,
} from 'lucide-react';
import { BrandSelect } from '@/shared/ui/brand-select';
import { Calendar } from '@/shared/ui/calendar';
import { Portal } from '@/shared/ui/portal';
import { InfoTooltip } from '@/shared/ui/info-tooltip';
import { Section, ComponentEntry, DemoLabel } from './_doc';

/* ============================================================================
   COMPOSED PAGE PATTERNS
   Faithful, interactive reconstructions of the recurring UI patterns used
   across the real product pages (dashboard, list pages, detail pages). These
   are documentation demos — the canonical source lives in src/pages/**.
   ============================================================================ */

const money = (n: number) => n.toLocaleString('en-US');
const moneyShort = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`);
const initialOf = (name: string) => name.trim().charAt(0).toUpperCase();

/* ----- shared small parts ------------------------------------------------- */

function Avatar({ name, size = 'w-10 h-10', text = 'text-sm' }: { name: string; size?: string; text?: string }) {
  return (
    <div className={`${size} rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center ${text} font-medium shrink-0`}>
      {initialOf(name)}
    </div>
  );
}

function DeltaChip({ delta, unit = 'percent' }: { delta: number; unit?: 'percent' | 'count' }) {
  const up = delta >= 0;
  const text = unit === 'count' ? `${up ? '+' : ''}${delta}` : `${Math.abs(delta).toFixed(1)}%`;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-medium tabular-nums ${up ? 'bg-[var(--success-tint)] text-[var(--success)]' : 'bg-[var(--danger-tint)] text-[var(--danger-strong)]'}`}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {text}
    </span>
  );
}

/* ========================================================================== */

export function ComposedPatterns() {
  return (
    <>
      <LayoutSection />
      <CardsSection />
      <TablesSection />
      <ChartsSection />
      <BannersSection />
    </>
  );
}

/* ===================== LAYOUT & NAVIGATION ================================= */

function LayoutSection() {
  const [tab, setTab] = React.useState('overview');
  return (
    <Section id="layout" title="Layout & Navigation" intro="The page-level scaffolding repeated across every screen: the serif page header, breadcrumbs, the underlined tab bar and the two-column detail grid.">
      <ComponentEntry name="Page header" path="src/pages/**/*.tsx (e.g. Reservations.tsx)" desc="A serif h1 with a muted one-line subtitle. Opens every list and detail page.">
        <div className="mb-2">
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">Reservation Management</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Stay on top of every arrival, in-house stay, and checkout as it happens.</p>
        </div>
      </ComponentEntry>

      <ComponentEntry name="Breadcrumb" path="src/pages/**/Detail.tsx" desc="Back-link to the list, a chevron separator, and the current record’s id as the active crumb.">
        <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)]">
          <button className="text-[13px] leading-none font-normal hover:text-[var(--text-primary)] transition-colors cursor-pointer">Reservation Management</button>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
          <span className="text-[13px] leading-none text-[var(--text-primary)] font-medium truncate">RSV-1090</span>
        </nav>
      </ComponentEntry>

      <ComponentEntry name="Tabs" path="src/pages/company-detail · src/pages/hotel/Rooms.tsx" desc="Underline-indicator tabs with an optional leading icon and a count. The active tab carries a brand-colored underline.">
        <div className="flex gap-1 border-b border-[var(--border-default)] overflow-x-auto">
          {[
            { id: 'overview', Icon: LayoutDashboard, label: 'Overview' },
            { id: 'surveys', Icon: ClipboardList, label: 'Bookings', count: 12 },
            { id: 'billing', Icon: CreditCard, label: 'Billing' },
          ].map((tn) => {
            const active = tab === tn.id;
            return (
              <button
                key={tn.id}
                onClick={() => setTab(tn.id)}
                className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
              >
                <tn.Icon className="w-4 h-4" />
                {tn.label}
                {tn.count !== undefined && <span className="text-[var(--text-secondary)] font-normal tabular-nums">({tn.count})</span>}
                {active && <span className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-[var(--brand-primary)] rounded-full" />}
              </button>
            );
          })}
        </div>
      </ComponentEntry>

      <ComponentEntry name="Two-column detail layout" path="src/pages/**/Detail.tsx" desc="A 3-col grid: main content spans 2 (lg:col-span-2), a sidebar takes the third. Collapses to one column on mobile.">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border-default)] rounded-md p-5 text-sm text-[var(--text-secondary)]">
            <div className="text-sm font-medium text-[var(--text-primary)] mb-1">Main column · lg:col-span-2</div>
            Reservation details, info cards, timelines.
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border-default)] rounded-md p-5 text-sm text-[var(--text-secondary)]">
            <div className="text-sm font-medium text-[var(--text-primary)] mb-1">Sidebar</div>
            Guest, payment, related records.
          </div>
        </div>
      </ComponentEntry>
    </Section>
  );
}

/* ===================== CARDS & STATS ====================================== */

function CardsSection() {
  const kpis = [
    { title: 'Revenue this month', value: '9,745,000', subtitle: 'Confirmed stays in June', delta: 2336.3, Icon: CreditCard },
    { title: 'Arrivals today', value: '1', subtitle: 'Guests checking in', delta: null, Icon: LogIn },
    { title: 'Pending requests', value: '25', subtitle: 'Awaiting your decision', delta: null, Icon: ClipboardList },
    { title: 'Occupancy', value: '25%', subtitle: '1/4 rooms tonight', delta: -4, Icon: KeyRound },
  ];
  const metrics = [
    { title: 'Occupancy', value: '25%', subtitle: '1/4 rooms tonight', glossary: 'The share of your bookable rooms that are filled tonight.' },
    { title: 'ADR', value: '108,596', subtitle: 'Avg. daily rate', glossary: 'Average Daily Rate: room revenue ÷ room-nights sold.' },
    { title: 'RevPAR', value: '81,208', subtitle: 'Revenue per room', glossary: 'Revenue Per Available Room: total room revenue ÷ every room you could sell.' },
    { title: 'In-house guests', value: '2', subtitle: 'Staying tonight', glossary: 'Guests staying with you tonight — checked in, not yet out.' },
  ];

  return (
    <Section id="cards" title="Cards & Stats" intro="The KPI card, the secondary metric strip, the trend chip, the info-row card and the avatar — the building blocks every page composes from.">
      <ComponentEntry name="KPI stat card" path="src/pages/dashboard/Dashboard.tsx · list & detail pages" desc="Big tabular number with a pill icon (brand on hover), an optional trend chip and a muted sublabel. Rendered in a responsive 1→2→4 column grid.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((c) => (
            <div key={c.title} className="bg-white border border-[var(--border-default)] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-[var(--text-secondary)]">{c.title}</span>
                <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors">
                  <c.Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-2xl font-medium text-[var(--brand-primary)] tabular-nums">{c.value}</div>
                {c.delta != null && c.delta !== 0 && <DeltaChip delta={c.delta} unit={Math.abs(c.delta) > 100 ? 'percent' : 'count'} />}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-2">{c.subtitle}</div>
            </div>
          ))}
        </div>
      </ComponentEntry>

      <ComponentEntry name="Secondary metric strip" path="src/pages/dashboard/Dashboard.tsx" desc="A single bordered bar split into four divided cells — each an icon, a label with an (i) glossary tooltip, a value and a sublabel.">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--surface-subtle)] bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
          {metrics.map((m) => (
            <div key={m.title} className="px-5 py-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-md bg-[var(--surface-subtle)] text-[var(--text-tertiary)] flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
                  {m.title}
                  <InfoTooltip label={m.glossary} />
                </div>
                <div className="text-lg font-medium text-[var(--text-primary)] tabular-nums leading-tight">{m.value}</div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 tabular-nums truncate">{m.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </ComponentEntry>

      <ComponentEntry name="Trend chip (delta)" path="src/pages/dashboard/Dashboard.tsx" desc="Up/down pill for period-over-period change. Green tint for positive, danger tint for negative. Supports percent or count.">
        <div className="flex flex-wrap items-center gap-3">
          <DeltaChip delta={12.4} />
          <DeltaChip delta={-4} unit="count" />
          <DeltaChip delta={2336.3} />
          <DeltaChip delta={-8.1} />
        </div>
      </ComponentEntry>

      <ComponentEntry name="Info card (icon · label · value rows)" path="src/pages/**/Detail.tsx — InfoRow" desc="A titled card whose body is a 2-column grid of rows: a rounded-square icon, a muted label and a value.">
        <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
            <h2 className="text-base font-medium text-[var(--text-primary)]">Reservation details</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Stay and room information</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
            <InfoRow Icon={Hash} label="Reservation code"><span className="text-sm text-[var(--text-primary)] tabular-nums">RSV-1090</span></InfoRow>
            <InfoRow Icon={BedDouble} label="Room"><span className="text-sm text-[var(--text-primary)]">Family · Room 413</span></InfoRow>
            <InfoRow Icon={Mail} label="Email"><span className="text-sm text-[var(--text-primary)]">beatrice.conti@example.com</span></InfoRow>
            <InfoRow Icon={Phone} label="Phone"><span className="text-sm text-[var(--text-tertiary)]">Not registered</span></InfoRow>
          </div>
        </section>
      </ComponentEntry>

      <ComponentEntry name="Avatar" path="rendered inline across tables & headers" desc="A rounded-square initial badge in brand tint. Sizes scale with context (w-9 in tables, w-14 in detail headers).">
        <div className="flex items-end gap-4">
          <div className="text-center"><Avatar name="Beatrice" size="w-9 h-9" /><div className="text-[11px] text-[var(--text-muted)] mt-1">w-9</div></div>
          <div className="text-center"><Avatar name="Marcus" size="w-10 h-10" /><div className="text-[11px] text-[var(--text-muted)] mt-1">w-10</div></div>
          <div className="text-center"><Avatar name="Sofia" size="w-14 h-14" text="text-xl" /><div className="text-[11px] text-[var(--text-muted)] mt-1">w-14</div></div>
        </div>
      </ComponentEntry>
    </Section>
  );
}

function InfoRow({ Icon, label, children }: { Icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-md bg-[var(--surface-subtle)] flex items-center justify-center shrink-0 text-[var(--text-tertiary)]">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-[var(--text-secondary)] mb-0.5">{label}</div>
        {children}
      </div>
    </div>
  );
}

/* ===================== TABLES & FILTERS =================================== */

type Row = { id: number; guest: string; email: string; code: string; room: string; roomNo: string; stay: string; nights: number; amount: number; status: string };
const ROWS: Row[] = [
  { id: 1, guest: 'Beatrice Conti', email: 'beatrice.conti@example.com', code: 'RSV-1090', room: 'Family', roomNo: '413', stay: 'Jun 30 – Jul 3, 2026', nights: 3, amount: 420000, status: 'Confirmed' },
  { id: 2, guest: 'Tariq Aziz', email: 'tariq.aziz@example.com', code: 'RSV-1089', room: 'Superior', roomNo: '220', stay: 'Jun 29 – Jun 30, 2026', nights: 1, amount: 90000, status: 'Confirmed' },
  { id: 3, guest: 'Sara Lindqvist', email: 'sara.lindqvist@example.com', code: 'RSV-1088', room: 'Deluxe', roomNo: '308', stay: 'Jun 29 – Jul 2, 2026', nights: 3, amount: 255000, status: 'Checked-in' },
  { id: 4, guest: 'Leila Haddad', email: 'leila.haddad@example.com', code: 'RSV-1086', room: 'Superior', roomNo: '211', stay: 'Jun 26 – Jun 27, 2026', nights: 1, amount: 90000, status: 'Cancelled' },
  { id: 5, guest: 'Victor Nguyen', email: 'victor.nguyen@example.com', code: 'RSV-1085', room: 'Deluxe', roomNo: '305', stay: 'Jun 26 – Jun 28, 2026', nights: 2, amount: 170000, status: 'Overdue' },
];

function statusStyle(s: string): string {
  switch (s) {
    case 'Confirmed': return 'bg-[var(--brand-tint)] text-[var(--brand-primary)]';
    case 'Checked-in': return 'bg-[var(--success-tint)] text-[var(--success)]';
    case 'Checked-out': return 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
    case 'Cancelled': return 'bg-[var(--danger-tint)] text-[var(--danger)]';
    case 'No-show': return 'bg-[var(--warning-tint)] text-[var(--warning-strong)]';
    case 'Overdue': return 'bg-[var(--danger-tint)] text-[var(--danger)]';
    default: return 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
  }
}

const STATUS_REF = [
  { label: 'Confirmed', cls: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]' },
  { label: 'Checked-in', cls: 'bg-[var(--success-tint)] text-[var(--success)]' },
  { label: 'Checked-out', cls: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]' },
  { label: 'Cancelled', cls: 'bg-[var(--danger-tint)] text-[var(--danger)]' },
  { label: 'No-show', cls: 'bg-[var(--warning-tint)] text-[var(--warning-strong)]' },
  { label: 'Overdue', cls: 'bg-[var(--danger-tint)] text-[var(--danger)]', Icon: TriangleAlert },
  { label: 'Pending', cls: 'bg-[var(--warning-tint)] text-[var(--warning-strong)]', Icon: Clock },
  { label: 'Approved', cls: 'bg-[var(--success-tint)] text-[var(--success)]', Icon: CheckCircle2 },
  { label: 'Declined', cls: 'bg-[var(--danger-tint)] text-[var(--danger)]', Icon: XCircle },
  { label: 'Active', cls: 'bg-[var(--success-tint)] text-[var(--success)]' },
  { label: 'Scheduled', cls: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]' },
  { label: 'Rejected', cls: 'bg-[var(--danger-tint)] text-[var(--danger)]' },
  { label: 'Expired', cls: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]' },
  { label: 'Paid', cls: 'bg-[var(--success-tint)] text-[var(--success)]' },
  { label: 'Processing', cls: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]' },
  { label: 'On hold', cls: 'bg-[var(--danger-tint)] text-[var(--danger)]' },
];

function TablesSection() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('All');
  const [type, setType] = React.useState('All');
  const [dateOpen, setDateOpen] = React.useState(false);
  const [datePos, setDatePos] = React.useState<{ top: number; right: number } | null>(null);
  const dateBtnRef = React.useRef<HTMLButtonElement>(null);
  const [range, setRange] = React.useState<{ from?: Date; to?: Date } | undefined>(undefined);
  const [page, setPage] = React.useState(1);

  const toggleDate = () => {
    setDateOpen((v) => {
      const next = !v;
      if (next && dateBtnRef.current) {
        const r = dateBtnRef.current.getBoundingClientRect();
        setDatePos({ top: r.bottom + 8, right: window.innerWidth - r.right });
      }
      return next;
    });
  };

  const filtered = ROWS.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesQ = !q || r.guest.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.roomNo.includes(q);
    const matchesS = status === 'All' || r.status === status;
    const matchesT = type === 'All' || r.room === type;
    return matchesQ && matchesS && matchesT;
  });
  const hasFilters = !!search || status !== 'All' || type !== 'All' || !!range?.from;
  const clear = () => { setSearch(''); setStatus('All'); setType('All'); setRange(undefined); };

  const PAGE_SIZE = 3;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <Section id="tables" title="Tables & Filters" intro="The list-page workhorses: the filter toolbar (search + dropdowns + date), the data table with avatar rows and status badges, pagination, the empty state, and the full status-badge tone reference.">
      <ComponentEntry name="Filter toolbar" path="src/pages/reservations/Reservations.tsx" desc="A search field with a leading icon, BrandSelect dropdown filters, a date-range button, and a round clear-all button that appears when any filter is active. Fully interactive — it filters the table below.">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by guest, code or room"
              className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
            />
          </div>
          <BrandSelect
            value={status}
            onValueChange={(v) => { setStatus(v); setPage(1); }}
            leftIcon={<ListFilter />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: 'All statuses' },
              { value: 'Confirmed', label: 'Confirmed' },
              { value: 'Checked-in', label: 'Checked-in' },
              { value: 'Cancelled', label: 'Cancelled' },
              { value: 'Overdue', label: 'Overdue' },
            ]}
          />
          <BrandSelect
            value={type}
            onValueChange={(v) => { setType(v); setPage(1); }}
            leftIcon={<BedDouble />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: 'All types' },
              { value: 'Deluxe', label: 'Deluxe' },
              { value: 'Superior', label: 'Superior' },
              { value: 'Family', label: 'Family' },
            ]}
          />
          <button
            ref={dateBtnRef}
            onClick={toggleDate}
            className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors cursor-pointer ${range?.from ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-tint)]' : 'border-[var(--border-default)] text-[var(--text-tertiary)] bg-white hover:bg-[var(--surface-subtle)]'}`}
          >
            <CalendarIcon className="w-4 h-4" />
            {range?.from ? 'Custom range' : 'Check-in date'}
          </button>
          {dateOpen && datePos && (
            <Portal>
              <div className="fixed inset-0 z-[60]" onClick={() => setDateOpen(false)} />
              <div
                className="fixed z-[61] bg-white border border-[var(--border-default)] rounded-md p-4 shadow-[0_8px_28px_rgba(44,38,39,0.14)]"
                style={{ top: datePos.top, right: datePos.right }}
              >
                <Calendar mode="range" selected={range as never} onSelect={(r) => setRange(r as never)} />
                <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-[var(--surface-subtle)]">
                  <button onClick={() => { setRange(undefined); }} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">Clear</button>
                  <button onClick={() => setDateOpen(false)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"><Check className="w-4 h-4" />Apply</button>
                </div>
              </div>
            </Portal>
          )}
          {hasFilters && (
            <button onClick={clear} title="Clear filters" className="flex items-center justify-center w-9 h-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-full transition-colors border border-transparent hover:border-[var(--border-default)] cursor-pointer shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </ComponentEntry>

      <ComponentEntry name="Data table" path="src/pages/reservations/Reservations.tsx" desc="Header row in uppercase micro-caps; body rows with an avatar + multi-line identity cell, multi-line room cell, a stay with a clock icon, a tabular amount and a status badge. Reflects the filters above, with pagination and an empty state.">
        <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)]">
                  {['No.', 'Guest', 'Room', 'Stay', 'Nights', 'Amount', 'Status'].map((h) => (
                    <th key={h} className={`py-4 px-6 font-medium text-[11px] tracking-wider uppercase ${h === 'Nights' ? 'text-center' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--surface-subtle)]">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <CalendarSearch className="w-8 h-8 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-medium text-[var(--text-primary)]">No reservations found</p>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">No reservations match these filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map((r, i) => (
                    <tr key={r.id} className="hover:bg-[var(--surface-muted)] transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-[var(--text-tertiary)] tabular-nums">{(current - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={r.guest} />
                          <div className="min-w-0">
                            <div className="font-medium text-[var(--text-primary)] truncate">{r.guest}</div>
                            <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5"><span className="tabular-nums">{r.code}</span> · {r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-primary)]">
                        <div>{r.room}</div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">Room {r.roomNo}</div>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-tertiary)]">
                        <span className="inline-flex items-center gap-2 tabular-nums">
                          <CalendarClock className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                          {r.stay}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-primary)] tabular-nums text-center">{r.nights} {r.nights === 1 ? 'night' : 'nights'}</td>
                      <td className="px-6 py-4 text-[var(--text-primary)] font-medium tabular-nums">{money(r.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusStyle(r.status)}`}>
                          {r.status === 'Overdue' && <TriangleAlert className="w-3 h-3" />}
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--surface-subtle)] bg-white">
            <span className="text-sm text-[var(--text-secondary)] tabular-nums">Showing {paged.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1} to {(current - 1) * PAGE_SIZE + paged.length} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1} className="h-8 px-3 inline-flex items-center text-sm border border-[var(--border-default)] rounded-md bg-white text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm font-medium border rounded-md tabular-nums transition-colors cursor-pointer ${p === current ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white' : 'border-[var(--border-default)] bg-white text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)]'}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={current === totalPages} className="h-8 px-3 inline-flex items-center text-sm border border-[var(--border-default)] rounded-md bg-white text-[var(--text-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">Next</button>
            </div>
          </div>
        </div>
      </ComponentEntry>

      <ComponentEntry name="Status badge — tone reference" path="statusStyle / couponStatusClass / settlementStatusClass + StatusBadge" desc="Every status pill across the product, with its exact tint/text token pairing. Some carry a leading icon (Pending, Approved, Declined, Overdue).">
        <div className="flex flex-wrap gap-2">
          {STATUS_REF.map((s) => (
            <span key={s.label} className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${s.cls}`}>
              {s.Icon && <s.Icon className="w-3 h-3" />}
              {s.label}
            </span>
          ))}
        </div>
      </ComponentEntry>
    </Section>
  );
}

/* ===================== CHARTS ============================================= */

const REVENUE_DATA: Record<string, { name: string; value: number; bookings: number }[]> = {
  this_month: [
    { name: 'Wk 1', value: 2300000, bookings: 9 }, { name: 'Wk 2', value: 3000000, bookings: 12 },
    { name: 'Wk 3', value: 2100000, bookings: 8 }, { name: 'Wk 4', value: 1900000, bookings: 6 },
    { name: 'Wk 5', value: 900000, bookings: 4 },
  ],
  '7d': [
    { name: 'Mon', value: 320000, bookings: 2 }, { name: 'Tue', value: 480000, bookings: 3 },
    { name: 'Wed', value: 260000, bookings: 1 }, { name: 'Thu', value: 540000, bookings: 3 },
    { name: 'Fri', value: 700000, bookings: 4 }, { name: 'Sat', value: 820000, bookings: 5 },
    { name: 'Sun', value: 410000, bookings: 2 },
  ],
};
const FLOW_DATA = [
  { name: 'Mon', arrivals: 1, departures: 0 }, { name: 'Tue', arrivals: 2, departures: 1 },
  { name: 'Wed', arrivals: 1, departures: 1 }, { name: 'Thu', arrivals: 2, departures: 1 },
  { name: 'Fri', arrivals: 1, departures: 1 }, { name: 'Sat', arrivals: 1, departures: 1 },
  { name: 'Sun', arrivals: 3, departures: 1 },
];

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: { value: number; bookings: number } }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[var(--text-primary)] text-white rounded-md px-3 py-2 text-xs shadow-lg">
      <div className="text-[var(--text-muted)] mb-1">{label}</div>
      <div className="font-medium tabular-nums">{money(p.value)}</div>
      <div className="text-[var(--text-muted)] mt-0.5 tabular-nums">{p.bookings} {p.bookings === 1 ? 'booking' : 'bookings'}</div>
    </div>
  );
}
function FlowTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: { arrivals: number; departures: number } }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[var(--text-primary)] text-white rounded-md px-3 py-2 text-xs shadow-lg">
      <div className="text-[var(--text-muted)] mb-1.5">{label}</div>
      <div className="flex items-center gap-2 tabular-nums"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--brand-primary)' }} />{p.arrivals} arrivals</div>
      <div className="flex items-center gap-2 tabular-nums mt-0.5"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--brand-accent)' }} />{p.departures} departures</div>
    </div>
  );
}

function ChartsSection() {
  const [range, setRange] = React.useState('this_month');
  const data = REVENUE_DATA[range];
  const total = data.reduce((s, d) => s + d.value, 0);
  const bookings = data.reduce((s, d) => s + d.bookings, 0);
  const avg = Math.round(total / data.length);

  return (
    <Section id="charts" title="Charts" intro="Recharts visualisations themed to the design tokens — a gradient revenue area chart with a range selector and an average reference line, and a grouped arrivals-vs-departures bar chart. Hover for the dark tooltips.">
      <ComponentEntry name="Revenue area chart" path="src/pages/dashboard/Dashboard.tsx" desc="AreaChart with a brand-primary gradient fill, dashed average ReferenceLine, abbreviated Y-axis (270K / 1.2M) and a custom dark tooltip. The BrandSelect swaps the range live.">
        <div className="bg-white border border-[var(--border-default)] rounded-md p-6 shadow-none">
          <div className="flex justify-between items-start mb-4 gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">Revenue</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-2">Confirmed bookings by check-in date</p>
              <div className="text-2xl font-medium text-[var(--brand-primary)] tabular-nums">{money(total)}</div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-1 tabular-nums flex-wrap">
                <span>{bookings} bookings</span>
                <span className="text-[var(--border-strong)]">·</span>
                <span>Avg {money(avg)} / {range === '7d' ? 'day' : 'week'}</span>
              </div>
            </div>
            <BrandSelect
              value={range}
              onValueChange={setRange}
              leftIcon={<CalendarIcon />}
              className="sm:w-auto"
              options={[{ value: 'this_month', label: 'This month' }, { value: '7d', label: 'Last 7 days' }]}
            />
          </div>
          <div className="h-[200px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dsColorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-subtle)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={(v: number) => moneyShort(v)} />
                <Tooltip cursor={{ stroke: 'var(--border-default)', strokeWidth: 1, strokeDasharray: '4 4' }} content={<RevenueTooltip />} />
                <ReferenceLine y={avg} stroke="var(--text-muted)" strokeDasharray="4 4" strokeWidth={1} label={{ value: `Avg ${moneyShort(avg)}`, position: 'right', fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Area type="monotone" dataKey="value" stroke="var(--brand-primary)" strokeWidth={2} fillOpacity={1} fill="url(#dsColorRevenue)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ComponentEntry>

      <ComponentEntry name="Arrivals & departures bar chart" path="src/pages/dashboard/Dashboard.tsx" desc="Grouped BarChart with rounded-top bars (brand-primary vs brand-accent), a header legend of colored dots, whole-number Y-axis and a custom tooltip.">
        <div className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">Arrivals &amp; departures</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Next 7 days</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] shrink-0">
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--brand-primary)' }} />Arrivals</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--brand-accent)' }} />Departures</span>
            </div>
          </div>
          <div className="px-4 sm:px-6 py-5 h-[220px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FLOW_DATA} margin={{ top: 6, right: 6, left: -20, bottom: 0 }} barGap={3} barCategoryGap="24%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-subtle)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip cursor={{ fill: 'var(--surface-subtle)' }} content={<FlowTooltip />} />
                <Bar dataKey="arrivals" fill="var(--brand-primary)" radius={[3, 3, 0, 0]} maxBarSize={14} isAnimationActive={false} />
                <Bar dataKey="departures" fill="var(--brand-accent)" radius={[3, 3, 0, 0]} maxBarSize={14} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ComponentEntry>
    </Section>
  );
}

/* ===================== BANNERS & OVERLAYS ================================= */

function BannersSection() {
  const [ribbon, setRibbon] = React.useState(true);
  const [collapsed, setCollapsed] = React.useState(false);
  const [selected, setSelected] = React.useState(2);
  const [confirm, setConfirm] = React.useState(false);

  const checklist = [
    { title: 'Add your first room type', done: true },
    { title: 'Set your pricing', done: true },
    { title: 'Connect a payout account', done: false },
  ];
  const timeline = [
    { Icon: UserPlus, tone: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]', label: 'Account created', detail: 'Joined TutuStay', date: 'Jan 12, 2026' },
    { Icon: CalendarCheck, tone: 'bg-[var(--success-tint)] text-[var(--success)]', label: 'First booking confirmed', detail: 'Deluxe · 2 nights', date: 'Feb 03, 2026' },
    { Icon: Star, tone: 'bg-[var(--warning-tint)] text-[var(--warning-strong)]', label: 'Left a 5-star review', date: 'Feb 10, 2026' },
  ];

  return (
    <Section id="banners" title="Banners & Overlays" intro="Page-spanning banners and floating surfaces: the sample-data ribbon, the collapsible Get-started checklist, the recommended-next-step CTA, the bulk-selection bar, the activity timeline, and the confirmation modal.">
      <ComponentEntry name="Sample-data ribbon" path="src/widgets/onboarding/demo-ribbon.tsx" desc="The dismissible brand-tint strip at the very top of the shell that flags demo data. Click ✕ to collapse it.">
        <AnimatePresence initial={false}>
          {ribbon ? (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border border-[var(--brand-border)] bg-[var(--brand-tint)] rounded-md">
              <div className="flex items-center gap-2.5 px-4 py-2">
                <FlaskConical className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
                <p className="text-xs text-[var(--text-secondary)] leading-snug min-w-0">
                  <span className="font-medium text-[var(--text-primary)]">You’re viewing sample data.</span>{' '}
                  Numbers, guests, and bookings here are examples so you can explore freely.
                </p>
                <button onClick={() => setRibbon(false)} aria-label="Dismiss" className="ml-auto p-1 rounded-md text-[var(--text-tertiary)] hover:bg-white/60 hover:text-[var(--text-primary)] transition-colors shrink-0"><X className="w-3.5 h-3.5" /></button>
              </div>
            </motion.div>
          ) : (
            <button onClick={() => setRibbon(true)} className="text-sm text-[var(--brand-primary)] hover:underline cursor-pointer">Restore ribbon</button>
          )}
        </AnimatePresence>
      </ComponentEntry>

      <ComponentEntry name="Get started progress banner" path="src/widgets/onboarding/quick-start-checklist.tsx" desc="A collapsible onboarding checklist with a rocket badge, a progress bar and check-circle list items (strikethrough when done). Click the header to expand.">
        <div className="bg-white border border-[var(--border-default)] rounded-md overflow-hidden">
          <button onClick={() => setCollapsed((c) => !c)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--surface-muted)] transition-colors">
            <div className="w-9 h-9 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0"><Rocket className="w-4 h-4" strokeWidth={1.75} /></div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-[var(--text-primary)]">Get started</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">2/3 done · Finish to go live and take bookings</div>
            </div>
            <div className="hidden sm:block w-28 h-1.5 rounded-full bg-[var(--surface-subtle)] overflow-hidden shrink-0">
              <div className="h-full bg-[var(--brand-primary)] rounded-full transition-all" style={{ width: '66%' }} />
            </div>
            <ChevronRight className={`w-4 h-4 text-[var(--text-tertiary)] shrink-0 transition-transform ${collapsed ? '' : 'rotate-90'}`} />
          </button>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <ul className="px-5 pb-4 pt-1 space-y-1 border-t border-[var(--surface-subtle)]">
                  {checklist.map((it) => (
                    <li key={it.title} className="flex items-center gap-3 px-2.5 py-2.5 rounded-md hover:bg-[var(--surface-muted)] transition-colors">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${it.done ? 'bg-[var(--success)] border-[var(--success)] text-white' : 'border-[var(--border-strong)] text-transparent'}`}><Check className="w-3 h-3" strokeWidth={3} /></span>
                      <span className={`text-sm ${it.done ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)] font-medium'}`}>{it.title}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ComponentEntry>

      <ComponentEntry name="Recommended next step" path="src/widgets/onboarding/recommended-next-step.tsx" desc="A brand-filled hero CTA: a sparkles badge, an uppercase eyebrow, a title/body and a white action button.">
        <div className="flex items-center gap-3 rounded-lg bg-[var(--brand-primary)] px-4 py-3.5 text-white">
          <div className="w-8 h-8 rounded-md bg-white/15 flex items-center justify-center shrink-0"><Sparkles className="w-4 h-4" /></div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wide text-white/70 font-medium">Recommended next step</div>
            <div className="text-sm font-medium leading-tight mt-0.5">Connect a payout account</div>
            <div className="text-xs text-white/80 mt-0.5 leading-snug">Add a bank account so you can get paid for completed stays.</div>
          </div>
          <button className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-white px-3 h-9 text-sm font-medium text-[var(--brand-primary)] hover:bg-white/90 transition-colors">Set up<ArrowRight className="w-4 h-4" /></button>
        </div>
      </ComponentEntry>

      <ComponentEntry name="Bulk selection bar" path="src/pages/customers/Customers.tsx" desc="Slides in when rows are selected: a brand-tint bar with a live count and bulk actions. Toggle the count with the buttons.">
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setSelected((n) => n + 1)} className="px-3 py-1.5 text-sm border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] cursor-pointer">Select one</button>
            <button onClick={() => setSelected(0)} className="px-3 py-1.5 text-sm border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] cursor-pointer">Deselect all</button>
          </div>
          <AnimatePresence initial={false}>
            {selected > 0 && (
              <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -6, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-[var(--brand-tint)] border border-[var(--brand-border)] rounded-md">
                  <span className="text-sm font-medium text-[var(--brand-primary)] tabular-nums">{selected} selected</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelected(0)} className="px-3 py-1.5 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white rounded-md transition-colors cursor-pointer">Clear</button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer"><Trash2 className="w-4 h-4" />Delete</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ComponentEntry>

      <ComponentEntry name="Activity timeline" path="src/pages/**/Detail.tsx" desc="A vertical event list: a tinted circular icon per event connected by a hairline, with a label, optional detail and a tabular date.">
        <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
            <h2 className="text-base font-medium text-[var(--text-primary)]">Activity</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Recent events</p>
          </div>
          <ol className="px-6 py-5">
            {timeline.map((e, i) => {
              const last = i === timeline.length - 1;
              return (
                <li key={e.label} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${e.tone}`}><e.Icon className="w-4 h-4" /></div>
                    {!last && <div className="w-px flex-1 bg-[var(--border-default)] my-1" />}
                  </div>
                  <div className={`flex-1 min-w-0 ${last ? '' : 'pb-5'}`}>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{e.label}</div>
                    {e.detail && <div className="text-xs text-[var(--text-secondary)] mt-0.5">{e.detail}</div>}
                    <div className="text-xs text-[var(--text-secondary)] mt-1 tabular-nums">{e.date}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </ComponentEntry>

      <ComponentEntry name="Confirmation modal" path="src/pages/**/Detail.tsx (Portal)" desc="A centered, Portal-rendered dialog with a tinted icon, a headline, supporting copy and a cancel / confirm pair. Backdrop click and Cancel both dismiss.">
        <button onClick={() => setConfirm(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer"><Trash2 className="w-4 h-4" />Delete coupon…</button>
        <Portal>
          <AnimatePresence>
            {confirm && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-[var(--text-primary)]/30 z-[60]" onClick={() => setConfirm(false)} />
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                  <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className="pointer-events-auto w-full max-w-sm bg-white border border-[var(--border-default)] rounded-md shadow-[0_8px_28px_rgba(44,38,39,0.14)] p-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-[var(--danger-tint)] text-[var(--danger)] flex items-center justify-center shrink-0"><Trash2 className="w-5 h-5" /></div>
                      <div className="min-w-0">
                        <h3 className="text-base font-medium text-[var(--text-primary)]">Delete coupon?</h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1 leading-snug">This will permanently remove <span className="font-medium text-[var(--text-primary)]">SUMMER25</span>. This action cannot be undone.</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-6">
                      <button onClick={() => setConfirm(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">Cancel</button>
                      <button onClick={() => setConfirm(false)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--danger)] rounded-md hover:bg-[var(--danger-strong)] transition-colors cursor-pointer"><Trash2 className="w-4 h-4" />Delete</button>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>
        </Portal>
      </ComponentEntry>
    </Section>
  );
}
