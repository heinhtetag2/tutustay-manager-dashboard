import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpRight, X, ArrowRight, AlertCircle, Target, Lightbulb, FlaskConical, Route, BookOpen, Calculator, Rocket, Layers, BedDouble, TriangleAlert, Eye, type LucideIcon } from 'lucide-react';

/* ============================================================================
   PROJECT SHOWCASE  —  route: /showcase  (full page, outside the app shell)
   A long-form, honest case study for TutuStay, modelled on the JoanX case
   study: sticky chapter nav (left), "on this page" rail (right), a one-
   paragraph summary, a decisions table, evidence labels ("Interpretation" /
   "Gap") and diagrams that explain the mechanism rather than decorate it.

   Images are captured from the running dashboard at one size (1440 x 900, or
   a 470px-wide side sheet) so every frame is consistent:
     /showcase/now/*     the current build
     /showcase/before/*  earlier commits, run from git worktrees
   ============================================================================ */

const now = (n: string) => `/showcase/now/${n}.jpg`;
const before = (n: string) => `/showcase/before/${n}.jpg`;

const BG = '#0a0f15';
const PANEL = '#101a25';
const PANEL2 = '#0d1520';
const LINE = 'rgba(168,195,235,0.14)';
const TEXT = '#ecf3fe';
const BODY = 'rgba(236,243,254,0.82)';
const MUTED = '#8fa3b8';
const ACCENT = '#6697c9';
const GOOD = '#7fd1a8';
const WARN = '#e8b36a';
const BAD = '#e58f8f';
const INFO = '#a8c3eb';

const CHAPTERS: { group: string; items: { id: string; label: string }[] }[] = [
  { group: 'Context', items: [
    { id: 'overview', label: 'Overview' },
    { id: 'problem', label: 'The problem' },
    { id: 'how', label: 'How TutuStay works' },
  ] },
  { group: 'The product', items: [
    { id: 'decisions', label: 'Six key decisions' },
    { id: 'rooms', label: 'The hardest screen: rooms' },
    { id: 'money', label: 'Money, trust and moderation' },
  ] },
  { group: 'How it was made', items: [
    { id: 'process', label: 'Process and iteration' },
    { id: 'system', label: 'Design system and AI' },
  ] },
  { group: 'Results', items: [
    { id: 'results', label: 'Results and evidence' },
    { id: 'next', label: 'Reflection and next steps' },
  ] },
];

/* ── Text blocks ────────────────────────────────────────────────────────── */

function Chapter({ id, n, kicker, title, lead, children }: { id: string; n: number; kicker: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t py-16" style={{ borderColor: LINE }}>
      <p className="text-xs uppercase tracking-[0.14em]" style={{ color: MUTED }}>Chapter {n} · {kicker}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {lead && <p className="mt-4 max-w-2xl text-lg leading-8" style={{ color: MUTED }}>{lead}</p>}
      <div className="mt-8 space-y-6 text-[15px] leading-7" style={{ color: BODY }}>{children}</div>
    </section>
  );
}

const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="pt-6 text-xl font-semibold tracking-tight" style={{ color: TEXT }}>{children}</h3>
);

const Label = ({ children }: { children: ReactNode }) => (
  <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: MUTED }}>{children}</p>
);

function Tag({ kind, children }: { kind: 'Gap' | 'Interpretation'; children: ReactNode }) {
  const color = kind === 'Gap' ? WARN : INFO;
  return (
    <p className="rounded-lg border px-4 py-3 text-sm leading-6" style={{ borderColor: LINE, backgroundColor: PANEL }}>
      <span className="mr-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 align-middle text-[11px] font-semibold uppercase tracking-wide" style={{ color, backgroundColor: `${color}22` }}>
        {kind === 'Gap' ? <TriangleAlert className="h-3 w-3" /> : <Eye className="h-3 w-3" />}{kind}
      </span>
      {children}
    </p>
  );
}

function Quote({ children }: { children: ReactNode }) {
  return <blockquote className="border-l-2 pl-5 text-xl font-medium leading-8" style={{ borderColor: ACCENT, color: TEXT }}>{children}</blockquote>;
}

/** Big-number row, like JoanX's "41 / 12 / 1". */
function Stats({ items }: { items: { n: string; l: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((s) => (
        <div key={s.l} className="rounded-xl border p-5" style={{ borderColor: LINE, backgroundColor: PANEL }}>
          <div className="text-4xl font-bold tracking-tight" style={{ color: TEXT }}>{s.n}</div>
          <div className="mt-1 text-sm leading-5" style={{ color: MUTED }}>{s.l}</div>
        </div>
      ))}
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: LINE }}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr style={{ backgroundColor: PANEL }}>
            {head.map((h) => <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: MUTED }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t align-top" style={{ borderColor: LINE }}>
              {r.map((c, j) => <td key={j} className="px-4 py-3 leading-6" style={{ color: j === 0 ? TEXT : BODY, fontWeight: j === 0 ? 500 : 400 }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Images: one frame style everywhere ─────────────────────────────────── */

/** A full-width desktop screenshot (all are 16:10), inside the panel frame. */
function Shot({ name, caption }: { name: string; caption: string }) {
  return (
    <figure>
      <div className="rounded-2xl border p-3 md:p-4" style={{ borderColor: LINE, backgroundColor: PANEL }}>
        <img src={now(name)} alt={caption} loading="lazy" className="block aspect-[16/10] w-full rounded-lg object-cover object-top" />
      </div>
      <figcaption className="mt-2 text-xs leading-5" style={{ color: MUTED }}>{caption}</figcaption>
    </figure>
  );
}

/** Tabbed gallery. Every image stays mounted in one grid cell and only fades, so switching tabs
 *  never reloads an image or changes the frame height (no flash, no layout jump). */
function Strip({ frames }: { frames: { name: string; label: string; text: string }[] }) {
  const [i, setI] = useState(0);
  return (
    <figure>
      <div className="grid rounded-2xl border p-3 md:p-4" style={{ borderColor: LINE, backgroundColor: PANEL }}>
        {frames.map((f, k) => (
          <img key={f.name} src={now(f.name)} alt={f.label} decoding="async"
            className="col-start-1 row-start-1 block h-auto max-h-[640px] w-full self-start rounded-lg object-contain object-top transition-opacity duration-200"
            style={{ opacity: k === i ? 1 : 0, pointerEvents: k === i ? 'auto' : 'none' }} aria-hidden={k !== i} />
        ))}
      </div>
      <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${frames.length}, minmax(0, 1fr))` }}>
        {frames.map((x, k) => (
          <button key={x.name} type="button" onClick={() => setI(k)} className="rounded-lg border px-3 py-2 text-left text-xs leading-5 transition-colors hover:bg-white/5"
            style={{ borderColor: k === i ? ACCENT : LINE, backgroundColor: k === i ? 'rgba(102,151,201,0.14)' : 'transparent', color: k === i ? TEXT : MUTED }}>
            <b style={{ color: TEXT }}>{x.label}.</b> <span className="hidden sm:inline">{x.text}</span>
          </button>
        ))}
      </div>
    </figure>
  );
}

type Side = { src: string; tag: string; when: string; portrait?: boolean };

/** Before | After, same frame size on both sides, with a verdict line. */
function Compare({ a, b, verdict }: { a: Side; b: Side; verdict: string }) {
  const Pane = ({ s, tone }: { s: Side; tone: string }) => (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide" style={{ color: tone, backgroundColor: `${tone}22` }}>{s.tag}</span>
        <span style={{ color: MUTED }}>{s.when}</span>
      </div>
      <div className="flex justify-center overflow-hidden rounded-xl border p-3" style={{ borderColor: LINE, backgroundColor: PANEL }}>
        <img src={s.src} alt={`${s.tag}, ${s.when}`} loading="lazy"
          className={s.portrait ? 'block max-h-[480px] w-auto rounded-md object-contain object-top' : 'block aspect-[16/10] w-full rounded-md object-cover object-top'} />
      </div>
    </div>
  );
  return (
    <figure>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Pane s={a} tone={WARN} />
        <Pane s={b} tone={GOOD} />
      </div>
      <figcaption className="mt-3 flex items-start gap-2 text-sm leading-6" style={{ color: BODY }}>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0" style={{ color: ACCENT }} />{verdict}
      </figcaption>
    </figure>
  );
}

/* ── Diagrams ───────────────────────────────────────────────────────────── */

function Chip({ children, tone = ACCENT }: { children: ReactNode; tone?: string }) {
  return <span className="inline-block rounded-full px-2.5 py-1 text-xs font-medium" style={{ color: tone, backgroundColor: `${tone}1f` }}>{children}</span>;
}

function Flow({ steps }: { steps: { t: string; d: string }[] }) {
  return (
    <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-stretch">
      {steps.map((s, i) => (
        <div key={s.t} className="flex flex-1 items-center gap-2">
          <div className="h-full flex-1 rounded-xl border px-4 py-3" style={{ borderColor: LINE, backgroundColor: PANEL }}>
            <div className="text-sm font-semibold" style={{ color: TEXT }}>{s.t}</div>
            <div className="mt-0.5 text-xs leading-5" style={{ color: MUTED }}>{s.d}</div>
          </div>
          {i < steps.length - 1 && <ArrowRight className="hidden h-4 w-4 shrink-0 md:block" style={{ color: ACCENT }} />}
        </div>
      ))}
    </div>
  );
}

/** The three status vocabularies of the core loop, side by side. */
function LoopDiagram() {
  const Col = ({ title, sub, states, tone }: { title: string; sub: string; states: [string, string][]; tone: string }) => (
    <div className="flex-1 rounded-xl border p-4" style={{ borderColor: LINE, backgroundColor: PANEL }}>
      <div className="text-sm font-semibold" style={{ color: TEXT }}>{title}</div>
      <div className="mb-3 text-xs" style={{ color: MUTED }}>{sub}</div>
      <div className="space-y-1.5">
        {states.map(([s, d]) => (
          <div key={s} className="flex items-center justify-between gap-3 text-xs">
            <Chip tone={tone}>{s}</Chip><span className="text-right" style={{ color: MUTED }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
      <Col title="Booking request" sub="a guest asks" tone={WARN} states={[['Pending', 'waits for you'], ['Approved', 'becomes a reservation'], ['Declined', 'guest is told']]} />
      <div className="flex shrink-0 flex-col items-center text-[11px] lg:w-20" style={{ color: ACCENT }}><span>approve</span><ArrowRight className="h-4 w-4" /></div>
      <Col title="Reservation" sub="a stay happens" tone={INFO} states={[['Confirmed', 'room held'], ['Checked-in', 'guest arrived'], ['Checked-out', 'stay complete'], ['Cancelled · No-show', 'adjusts the payout']]} />
      <div className="flex shrink-0 flex-col items-center text-[11px] lg:w-20" style={{ color: ACCENT }}><span>check-out</span><ArrowRight className="h-4 w-4" /></div>
      <Col title="Settlement" sub="money moves" tone={GOOD} states={[['Pending', 'period not started'], ['Processing', 'period open or closing'], ['Paid', 'period end + 2 days'], ['On hold', 'needs attention']]} />
    </div>
  );
}

/** Worked example of the derived settlement, to scale. Illustrative amounts, real rules. */
function Waterfall() {
  const rows: { l: string; v: number; sign: '+' | '-' | '='; tone: string; note: string }[] = [
    { l: 'Gross', v: 2_400_000, sign: '+', tone: INFO, note: '12 checked-out stays in the 1st–15th period' },
    { l: 'Commission', v: 288_000, sign: '-', tone: WARN, note: '12% of gross' },
    { l: 'Adjustments', v: 100_000, sign: '-', tone: BAD, note: 'one 200,000 cancellation, booked at 50%' },
    { l: 'Net payout', v: 2_012_000, sign: '=', tone: GOOD, note: 'paid 2 days after the period closes' },
  ];
  const max = 2_400_000;
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: LINE, backgroundColor: PANEL }}>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.l} className="grid grid-cols-[110px_1fr_110px] items-center gap-3 text-sm">
            <span style={{ color: TEXT }}>{r.l}</span>
            <div className="h-6 rounded-md" style={{ backgroundColor: PANEL2 }}>
              <div className="h-6 rounded-md" style={{ width: `${(r.v / max) * 100}%`, backgroundColor: `${r.tone}55`, borderRight: `3px solid ${r.tone}` }} />
            </div>
            <span className="text-right tabular-nums" style={{ color: r.tone }}>{r.sign === '-' ? '− ' : r.sign === '=' ? '= ' : ''}{r.v.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <ul className="mt-4 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2" style={{ color: MUTED }}>
        {rows.map((r) => <li key={r.l}><b style={{ color: TEXT }}>{r.l}.</b> {r.note}</li>)}
      </ul>
      <p className="mt-3 text-xs" style={{ color: MUTED }}>Worked example. The rules (12%, 50%, 2 days, bi-weekly periods) are the product’s own constants; the amounts are made up to show the shape.</p>
    </div>
  );
}

/** Who owns what: Room Type vs Room. */
function InheritDiagram() {
  const own = ['Photos', 'Price: night · session · weekend', 'Local and foreigner rates', 'Beds and occupancy', 'Amenities'];
  return (
    <div className="grid items-stretch gap-3 md:grid-cols-[1.2fr_auto_1fr]">
      <div className="rounded-xl border p-4" style={{ borderColor: ACCENT, backgroundColor: PANEL }}>
        <Label>Room type · defined once</Label>
        <div className="mt-1 text-lg font-semibold" style={{ color: TEXT }}>Deluxe</div>
        <ul className="mt-3 space-y-1.5 text-sm">
          {own.map((o) => <li key={o} className="flex gap-2"><span style={{ color: ACCENT }}>●</span>{o}</li>)}
        </ul>
      </div>
      <div className="flex flex-col items-center justify-center gap-1 text-[11px]" style={{ color: ACCENT }}>
        <span>inherited,</span><ArrowRight className="h-4 w-4" /><span>read-only</span>
      </div>
      <div className="rounded-xl border p-4" style={{ borderColor: LINE, backgroundColor: PANEL }}>
        <Label>Room · added many times</Label>
        <div className="mt-1 text-lg font-semibold" style={{ color: TEXT }}>Room 201, 202, 203…</div>
        <p className="mt-3 text-xs" style={{ color: MUTED }}>Each room asks only for what is different:</p>
        <div className="mt-2 flex flex-wrap gap-1.5"><Chip>Floor</Chip><Chip>Number</Chip><Chip>Type</Chip><Chip>Status</Chip></div>
      </div>
    </div>
  );
}

/** The three token tiers as a stack. */
function TierDiagram() {
  const tiers = [
    ['Tier 3 · Adapter', '--primary, --background, --border', 'what the Radix / shadcn components read', MUTED],
    ['Tier 2 · Semantic', '--brand-primary, --text-muted, --surface', 'what every screen references. Re-theme by re-pointing this tier.', ACCENT],
    ['Tier 1 · Palette', '--color-base-ocean-70 … 13+ ramps', 'raw values, theme-invariant, never used directly', INFO],
  ] as const;
  return (
    <div className="space-y-2">
      {tiers.map(([t, tok, d, c], i) => (
        <div key={t} className="flex flex-col gap-1 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:gap-5" style={{ borderColor: i === 1 ? ACCENT : LINE, backgroundColor: PANEL, marginLeft: i * 16 }}>
          <span className="w-40 shrink-0 text-sm font-semibold" style={{ color: c }}>{t}</span>
          <code className="text-xs" style={{ color: TEXT }}>{tok}</code>
          <span className="text-xs sm:ml-auto sm:text-right" style={{ color: MUTED }}>{d}</span>
        </div>
      ))}
    </div>
  );
}

/** Vertical dated timeline. */
function Timeline({ items }: { items: { when: string; title: string; text: string; ref: string; tone?: string }[] }) {
  return (
    <ol className="relative space-y-5 border-l pl-6" style={{ borderColor: LINE }}>
      {items.map((it) => (
        <li key={it.ref + it.when} className="relative">
          <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2" style={{ borderColor: it.tone ?? ACCENT, backgroundColor: BG }} />
          <div className="flex flex-wrap items-baseline gap-x-3 text-xs" style={{ color: MUTED }}><b style={{ color: it.tone ?? ACCENT }}>{it.when}</b><code>{it.ref}</code></div>
          <div className="text-[15px] font-semibold" style={{ color: TEXT }}>{it.title}</div>
          <p className="text-sm leading-6" style={{ color: BODY }}>{it.text}</p>
        </li>
      ))}
    </ol>
  );
}

const ROW_ICON: Record<string, { Icon: LucideIcon; tone: string }> = {
  Problem: { Icon: AlertCircle, tone: BAD },
  Decision: { Icon: Target, tone: ACCENT },
  Why: { Icon: Lightbulb, tone: WARN },
  'Evidence and limits': { Icon: FlaskConical, tone: GOOD },
};
const DECISION_ICON: Record<string, LucideIcon> = { A: Route, B: BookOpen, C: Calculator, D: Rocket, E: Layers, F: BedDouble };

function Decision({ letter, title, rows }: { letter: string; title: string; rows: [string, ReactNode][] }) {
  const Icon = DECISION_ICON[letter] ?? Target;
  return (
    <div className="space-y-4 pt-10">
      <h3 className="flex items-center gap-3 text-xl font-semibold tracking-tight" style={{ color: TEXT }}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border" style={{ borderColor: LINE, backgroundColor: PANEL, color: ACCENT }}><Icon className="h-5 w-5" /></span>
        <span><span className="mr-2" style={{ color: ACCENT }}>{letter}.</span>{' '}{title}</span>
      </h3>
      <dl className="grid gap-3 md:grid-cols-2">
        {rows.map(([k, v]) => {
          const r = ROW_ICON[k];
          return (
            <div key={k} className="rounded-xl border p-4" style={{ borderColor: LINE, backgroundColor: PANEL }}>
              <dt className="flex items-center gap-2">
                {r && <span className="grid h-6 w-6 place-items-center rounded-md" style={{ color: r.tone, backgroundColor: `${r.tone}1f` }}><r.Icon className="h-3.5 w-3.5" /></span>}
                <Label>{k}</Label>
              </dt>
              <dd className="mt-2 text-sm leading-6">{v}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/** A: the same four meanings, in all three vocabularies. Grouping is my reading. */
function StatusGroups() {
  const groups: { m: string; tone: string; cols: string[][] }[] = [
    { m: 'Needs you', tone: WARN, cols: [['Pending'], ['Overdue'], ['On hold']] },
    { m: 'In progress', tone: INFO, cols: [['Approved'], ['Confirmed', 'Checked-in'], ['Processing', 'Pending']] },
    { m: 'Done', tone: GOOD, cols: [[], ['Checked-out'], ['Paid']] },
    { m: 'Stopped', tone: BAD, cols: [['Declined'], ['Cancelled', 'No-show'], []] },
  ];
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: LINE, backgroundColor: PANEL }}>
      <div className="grid min-w-[560px] grid-cols-[120px_repeat(3,1fr)] text-xs">
        {['', 'Booking request', 'Reservation', 'Settlement'].map((h, i) => (
          <div key={i} className="px-4 py-3 font-semibold uppercase tracking-[0.1em]" style={{ color: MUTED }}>{h}</div>
        ))}
        {groups.map((g) => (
          <div key={g.m} className="contents">
            <div className="flex items-center border-t px-4 py-3 text-sm font-semibold" style={{ borderColor: LINE, color: g.tone }}>{g.m}</div>
            {g.cols.map((c, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1.5 border-t px-4 py-3" style={{ borderColor: LINE }}>
                {c.length ? c.map((x) => <Chip key={x} tone={g.tone}>{x}</Chip>) : <span style={{ color: MUTED }}>–</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="border-t px-4 py-2 text-[11px]" style={{ borderColor: LINE, color: MUTED }}>Three vocabularies, one set of meanings, one colour per meaning. The grouping is my reading of the statuses, not a table in the code.</p>
    </div>
  );
}

/** C: the real rules, interactive. Cancel a stay and watch the payout move. */
function SettlementLab() {
  const stays = [
    { g: 'Foster', r: 'Deluxe', a: 520_000 }, { g: 'Marin', r: 'Superior', a: 380_000 }, { g: 'Rossi', r: 'Deluxe', a: 450_000 },
    { g: 'Nguyen', r: 'Suite', a: 300_000 }, { g: 'Kim', r: 'Superior', a: 400_000 }, { g: 'Aung', r: 'Deluxe', a: 350_000 },
  ];
  const [cancelled, setCancelled] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setCancelled((c) => { const n = new Set(c); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  const gross = stays.reduce((n, x, i) => n + (cancelled.has(i) ? 0 : x.a), 0);
  const adj = stays.reduce((n, x, i) => n + (cancelled.has(i) ? Math.round(x.a * 0.5) : 0), 0);
  const commission = Math.round(gross * 0.12);
  const net = gross - commission - adj;
  const bars = [
    { l: 'Gross', v: gross, c: INFO, sign: '' }, { l: 'Commission 12%', v: commission, c: WARN, sign: '− ' },
    { l: 'Adjustments 50%', v: adj, c: BAD, sign: '− ' }, { l: 'Net payout', v: net, c: GOOD, sign: '= ' },
  ];
  const max = stays.reduce((n, x) => n + x.a, 0);
  return (
    <div className="grid gap-4 rounded-xl border p-5 md:grid-cols-[1fr_1.2fr]" style={{ borderColor: LINE, backgroundColor: PANEL }}>
      <div>
        <Label>Try it · 1st–15th period</Label>
        <ul className="mt-2 space-y-1.5">
          {stays.map((x, i) => {
            const c = cancelled.has(i);
            return (
              <li key={x.g}>
                <button type="button" onClick={() => toggle(i)} className="flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-white/5"
                  style={{ borderColor: c ? BAD : LINE, color: c ? MUTED : TEXT }}>
                  <span>{x.g} · {x.r}</span>
                  <span className="flex items-center gap-2 tabular-nums"><span style={{ textDecoration: c ? 'line-through' : 'none' }}>{x.a.toLocaleString()}</span><Chip tone={c ? BAD : GOOD}>{c ? 'Cancelled' : 'Checked-out'}</Chip></span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[11px]" style={{ color: MUTED }}>Click a stay to cancel it. A cancelled stay leaves gross and costs 50% as an adjustment.</p>
      </div>
      <div className="flex flex-col justify-center gap-3">
        {bars.map((r) => (
          <div key={r.l} className="grid grid-cols-[120px_1fr_96px] items-center gap-3 text-sm">
            <span style={{ color: TEXT }}>{r.l}</span>
            <div className="h-5 rounded" style={{ backgroundColor: PANEL2 }}><div className="h-5 rounded transition-all duration-300" style={{ width: `${(r.v / max) * 100}%`, backgroundColor: `${r.c}55`, borderRight: `3px solid ${r.c}` }} /></div>
            <span className="text-right tabular-nums" style={{ color: r.c }}>{r.sign}{r.v.toLocaleString()}</span>
          </div>
        ))}
        <p className="text-xs" style={{ color: MUTED }}>Paid 2 days after the period closes. Same rules as the product; the stays are made up.</p>
      </div>
    </div>
  );
}

/** D: the wizard, and the dashboard checklist that points back at it. */
function SetupSteps() {
  const steps = ['Basics', 'Type', 'Address', 'Policies', 'Owner', 'Contract', 'Settlement', 'Agree'];
  const list: [string, boolean][] = [['Property basics', true], ['Property type', true], ['Address & map', true], ['Policies & amenities', true], ['Owner & business', true], ['Settlement (optional)', false], ['Create your first room type', true], ['Review a booking request', true]];
  return (
    <div className="space-y-3 rounded-xl border p-5" style={{ borderColor: LINE, backgroundColor: PANEL }}>
      <Label>The wizard · 8 steps</Label>
      <div className="flex flex-wrap items-center gap-y-2">
        {steps.map((t, i) => (
          <div key={t} className="flex items-center">
            <span className="flex items-center gap-1.5 text-xs" style={{ color: TEXT }}>
              <span className="grid h-5 w-5 place-items-center rounded-full border text-[10px]" style={{ borderColor: ACCENT, color: ACCENT }}>{i + 1}</span>{t}
            </span>
            {i < steps.length - 1 && <span className="mx-2 h-px w-4" style={{ backgroundColor: LINE }} />}
          </div>
        ))}
      </div>
      <Label>The dashboard checklist · 7 of 8 done in the sample</Label>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {list.map(([t, d]) => (
          <li key={t} className="flex items-center gap-2 text-sm" style={{ color: d ? MUTED : TEXT }}>
            <span style={{ color: d ? GOOD : MUTED }}>{d ? '✓' : '○'}</span><span style={{ textDecoration: d ? 'line-through' : 'none' }}>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** E: each rule names the one file to copy from. */
function RuleCards() {
  const rules = [
    ['Empty states', 'Centred icon · bold title · muted description', 'pages/reservations/Reservations.tsx'],
    ['Loading', 'One shimmer Skeleton, wired on first load', 'shared/ui/skeleton.tsx'],
    ['Jargon', '(i) tooltip, definition from one glossary', 'widgets/onboarding/glossary.ts'],
  ];
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {rules.map(([t, d, f]) => (
        <div key={t} className="rounded-xl border p-4" style={{ borderColor: LINE, backgroundColor: PANEL }}>
          <div className="text-sm font-semibold" style={{ color: TEXT }}>{t}</div>
          <p className="mt-1 text-xs leading-5" style={{ color: BODY }}>{d}</p>
          <code className="mt-3 block rounded px-2 py-1 text-[11px]" style={{ backgroundColor: PANEL2, color: INFO }}>{f}</code>
        </div>
      ))}
    </div>
  );
}

/** F: how many things the owner is asked, before and after. */
function FieldCount() {
  const Row = ({ label, asked, extra, tone }: { label: string; asked: string[]; extra?: string; tone: string }) => (
    <div className="grid items-center gap-3 sm:grid-cols-[110px_1fr]">
      <span className="text-sm font-semibold" style={{ color: tone }}>{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {asked.map((x) => <span key={x} className="rounded-md border px-2 py-1 text-xs" style={{ borderColor: LINE, color: TEXT, backgroundColor: PANEL2 }}>{x}</span>)}
        {extra && <span className="rounded-md border border-dashed px-2 py-1 text-xs" style={{ borderColor: ACCENT, color: ACCENT }}>{extra}</span>}
      </div>
    </div>
  );
  return (
    <div className="space-y-4 rounded-xl border p-5" style={{ borderColor: LINE, backgroundColor: PANEL }}>
      <Row label="Before · 8" tone={WARN} asked={['Floor', 'Number', 'Type', 'Status', 'Beds', 'Occupancy', 'Price', 'Amenities']} />
      <Row label="Now · 4" tone={GOOD} asked={['Floor', 'Number', 'Type', 'Status']} extra="+ inherited from the type, read-only" />
      <p className="text-xs" style={{ color: MUTED }}>Fields the owner is asked for when adding one room (29 May version vs today). The price, beds and amenities still exist; they moved to the type.</p>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function ProjectShowcase() {
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');
  const [toc, setToc] = useState<{ id: string; label: string; top: boolean }[]>([]);
  const [activeSub, setActiveSub] = useState('');

  // Highlight the chapter nearest the top of the viewport.
  useEffect(() => {
    const ids = CHAPTERS.flatMap((g) => g.items.map((i) => i.id));
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  // Right rail: the active chapter's title plus its sub-headings.
  useEffect(() => {
    const sec = document.getElementById(active);
    if (!sec) return;
    const heads = [...sec.querySelectorAll<HTMLElement>('h1, h2, h3')];
    const items = heads.map((h, i) => {
      if (!h.id) h.id = `${active}-${i}-${(h.textContent ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`;
      h.style.scrollMarginTop = '96px';
      return { id: h.id, label: h.textContent ?? '', top: i === 0 };
    });
    setToc(items);
    setActiveSub(items[0]?.id ?? '');
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActiveSub(hit.target.id);
      },
      { rootMargin: '-10% 0px -75% 0px' },
    );
    heads.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [active]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  let n = 0;

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: BG, color: TEXT, fontFamily: 'var(--font-sans)' }}>
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b px-5 backdrop-blur-md" style={{ borderColor: LINE, backgroundColor: 'rgba(10,15,21,0.8)' }}>
        <span className="text-[17px]"><b className="font-bold">TutuStay</b> <span style={{ color: MUTED }}>case study</span></span>
        <div className="flex items-center gap-3 text-xs" style={{ color: MUTED }}>
          <span className="hidden sm:inline">Product design and front-end · 2026</span>
          <button type="button" onClick={() => navigate('/login')} aria-label="Close showcase" className="inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors hover:bg-white/10" style={{ borderColor: LINE }}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="flex gap-8 px-5 pt-14">
        {/* Left: chapters */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[232px] shrink-0 overflow-y-auto py-10 lg:block">
          {CHAPTERS.map((g) => (
            <div key={g.group} className="mb-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: MUTED }}>{g.group}</p>
              {g.items.map((it) => {
                n += 1;
                const on = active === it.id;
                return (
                  <button key={it.id} type="button" onClick={() => go(it.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-white/5"
                    style={{ color: on ? TEXT : MUTED, backgroundColor: on ? 'rgba(102,151,201,0.16)' : undefined, boxShadow: on ? `inset 0 0 0 1px ${LINE}` : undefined }}>
                    <span className="w-4 text-xs tabular-nums" style={{ color: MUTED }}>{n}</span>{it.label}
                  </button>
                );
              })}
            </div>
          ))}
          <p className="mt-8 text-xs leading-5" style={{ color: MUTED }}>
            Claims about the product are checked against the code, the git history and the docs. Labels mark the exceptions:
            <br /><b style={{ color: INFO }}>Interpretation</b> my reading where no reason is recorded.
            <br /><b style={{ color: WARN }}>Gap</b> untested or missing.
          </p>
        </aside>

        <main className="mx-auto min-w-0 max-w-[880px] flex-1 pb-32">
          {/* ── 1 · Overview ─────────────────────────────────────────── */}
          <section id="overview" className="scroll-mt-24 pb-16 pt-14">
            <div className="text-center">
              <p className="text-sm" style={{ color: MUTED }}>Hotel manager dashboard <span className="mx-2">·</span> Product and UX design <span className="mx-2">·</span> 2026</p>
              <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
                TutuStay: running an independent hotel, from booking request to payout
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8" style={{ color: MUTED }}>
                A single-property operations dashboard for owners who run on chat apps and paper, and a settlement screen that shows its working. How I designed it, the decisions that shaped it, and what is still untested.
              </p>
              <a href="https://tutustay-manager-dashboard.vercel.app/login" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10" style={{ borderColor: ACCENT, backgroundColor: PANEL }}>
                Try the prototype <ArrowUpRight className="h-4 w-4" />
              </a>
              <p className="mt-2 text-xs" style={{ color: MUTED }}>Opens the live project. The email is pre-filled; enter any password to sign in.</p>
              
            </div>
            <div className="mt-12">
              <Shot name="dashboard" caption="The dashboard. Tonight’s occupancy, arrivals and requests are computed from the reservations, not typed in. Every name and number is sample data." />
            </div>

            <H3>In one paragraph</H3>
            <p>
              Independent hotel and guesthouse owners coordinate arrivals, confirmations and money across chat threads, paper and spreadsheets. TutuStay is a take-rate marketplace: the platform earns 12% on completed stays, so its whole job is to move demand through one loop, request to reservation to settlement, without anything falling out. The design bet is that the loop should be visible. One repeating screen grammar makes every page learnable from the first, a glossary defines every jargon number where it appears, and the settlement screen derives the payout from the reservations so the owner can check it themselves.
            </p>

            <dl className="grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
              {[
                ['Product', 'A hotel-manager web dashboard, with an 8-step property set-up wizard'],
                ['Users', 'Owners and staff of single-property hotels and guesthouses'],
                ['My role', 'Product design, UX, design system and the front-end build. Solo.'],
                ['Tools', 'React, TypeScript, Tailwind, Radix. Claude as AI pair programmer, under my direction.'],
                ['Timeline', 'Started 20 April 2026 as a different product; became TutuStay from 29 May; 79 commits to 26 June'],
                ['Status', 'A working front-end on sample data. Not shipped; no backend, so no usage figures and no claims about results.'],
              ].map(([k, v]) => (
                <div key={k}><dt><Label>{k}</Label></dt><dd className="mt-1 text-sm leading-6">{v}</dd></div>
              ))}
            </dl>

            <H3>The six decisions, at a glance</H3>
            <Table
              head={['', 'Problem', 'Decision', 'What the design now does']}
              rows={[
                ['A', 'Owners can’t see how a request becomes money', 'Make one loop the spine of the product', 'Three status vocabularies share one colour grammar'],
                ['B', 'Jargon erodes trust in the numbers', 'Define terms inline, from one glossary', '22 terms behind (i) tooltips on every KPI screen'],
                ['C', 'A payout you can’t reproduce is a payout you dispute', 'Derive settlements from reservations; show the commission', 'Change one reservation and the money moves'],
                ['D', 'A new property doesn’t know where to start', 'Surface the 8-step wizard instead of hiding it', 'A checklist and progress ring until the property is live'],
                ['E', 'Copy-paste consistency drifts', 'A 3-tier token system and written-down rules', 'Re-theme by re-pointing one tier'],
                ['F', 'A room has 3 price modes, 2 guest types and a type', 'A room inherits everything from its type', 'Adding a room asks for four things, not eight'],
              ]}
            />
            <p className="text-xs" style={{ color: MUTED }}>Each row opens the full decision in chapter 4. The right-hand column describes what the design does, not its effect on owners, which hasn’t been measured (chapter 9).</p>
          </section>

          {/* ── 2 · Problem ──────────────────────────────────────────── */}
          <Chapter id="problem" n={2} kicker="Context" title="The problem" lead="Why a hotel owner’s day is harder than it looks, and what that asks of the screen.">
            <H3>Where the day goes</H3>
            <p>
              The brief describes a small property run from chat threads, a paper register and a spreadsheet for payouts. There is no single source of truth for who arrives tonight, which bookings are confirmed, or what the owner will be paid and when. The owner is operationally expert but not fluent in revenue management, and that is the central design tension: the screens must carry real numbers (occupancy, ADR, RevPAR, commission) without assuming the reader already knows the words.
            </p>
            <Tag kind="Gap">This is reasoned from the brief and a cold first-run review, not from field research. No owner interviews, surveys or observation exist in the materials, so the whole design rests on reasoning, benchmarks and building the screens.</Tag>

            <H3>The product bet</H3>
            <Quote>Own the loop to earn the right to own the money.</Quote>
            <p>Convert scattered demand into completed, paid stays, because that is where commission is captured. Scope stays narrow on purpose: one property, no channel sync, no multi-property. Every feature is judged on whether it keeps the loop moving or makes its money legible.</p>

            <H3>Constraints that shaped every screen</H3>
            <Table
              head={['Constraint', 'Source', 'What it forced']}
              rows={[
                ['It handles money', 'Commission model, 12%', 'Every number reconciles across screens: one currency formatter, one definition per metric.'],
                ['The reader isn’t a revenue manager', 'Persona', 'Jargon gets an inline definition, never a bare acronym.'],
                ['Some content needs approval', 'Coupons and review-hiding go to a super-admin', 'The approval step has to be explained before the form, not discovered at submit.'],
                ['Three languages', 'English, Korean, Burmese', 'Nothing may sit in a fixed-width control; layouts survive text-length swaps.'],
                ['Phones as well as desks', 'Owners check in between tasks', 'Tables become card lists, filters become sheets, price tabs lose their badges on small screens.'],
              ]}
            />

            <H3>How success was defined</H3>
            <p>The candidate north-star is <b style={{ color: TEXT }}>weekly completed, paid room-nights per active property</b>: one number that captures activation, engagement and monetisation. Supporting metrics are set-up completion, request-to-approval rate and payout dispute rate. None are instrumented, so nothing here is measured.</p>
          </Chapter>

          {/* ── 3 · How it works ─────────────────────────────────────── */}
          <Chapter id="how" n={3} kicker="Context" title="How TutuStay works" lead="The one sequence everything hangs off, the machinery that turns it into money, and the screen grammar that makes it learnable.">
            <H3>One booking, start to payout</H3>
            <p>Three status vocabularies, one colour grammar. A request becomes a reservation when approved, and a reservation becomes money when the guest checks out.</p>
            <LoopDiagram />
            <p>The rest of the product is the supporting cast: rooms and prices decide what can be booked, customers and reviews decide who comes back, coupons fill slow weeks, the calendar shows what is coming.</p>

            <H3>How the money is derived</H3>
            <p>
              Settlements are not typed in. Checked-out reservations are bucketed into bi-weekly periods (1st to 15th, 16th to month end), commission is applied, cancellations are booked as adjustments at a 50% refund rate, and the payout lands two days after the period closes. Even the status (Pending, Processing, Paid) is computed from today’s date. Change a reservation and the money moves by itself.
            </p>
            <Waterfall />
            <Shot name="settlements" caption="Settlements. KPIs and charts first, then one row per period that ends in a net payout." />

            <H3>The workspace</H3>
            <Table
              head={['Group', 'Screens', 'The question it answers']}
              rows={[
                ['Overview', 'Dashboard · Sales Calendar', 'What needs me today? What is coming?'],
                ['Team', 'Employees · Customers · Reviews', 'Who works here, who stays, what they say'],
                ['Hotel', 'Rooms · Reservations · Booking Requests', 'Price rooms, track stays, decide on demand'],
                ['Marketing', 'Coupons', 'How do I fill a slow week, with approval?'],
                ['Finance', 'Settlements', 'What did I earn, and when is it paid?'],
                ['Account', 'Property set-up · Settings · Help', 'Am I live yet? Where do I get help?'],
              ]}
            />

            <H3>One screen grammar</H3>
            <p>Every list screen has the same four layers: a title and one-line subtitle, a row of KPIs, a search-and-filter bar, then a table or card list that opens a side sheet (a peek) or a full page (a heavy record). Learn one screen, learn them all.</p>
            <Strip frames={[
              { name: 'requests', label: 'Requests', text: 'A decision queue.' },
              { name: 'reservations', label: 'Reservations', text: 'Table with rate chips.' },
              { name: 'customers', label: 'Customers', text: 'Repeat guests as a KPI.' },
              { name: 'coupons', label: 'Coupons', text: 'Six lifecycle states.' },
              { name: 'reviews', label: 'Reviews', text: 'Response rate and moderation.' },
            ]} />
            <p className="text-xs" style={{ color: MUTED }}>Same title, KPI row, filters and table on five different screens. Captured at one size from the running app.</p>
          </Chapter>

          {/* ── 4 · Decisions ────────────────────────────────────────── */}
          <Chapter id="decisions" n={4} kicker="The product" title="Six key decisions" lead="Each follows the same shape: what the person was trying to do, what made it hard, what pointed at the problem, and what changed.">
            <Decision letter="A" title="Make the booking loop the spine" rows={[
              ['Problem', 'The request → reservation → settlement chain underlies half of the confusion in a first-run review, and the product never explains it.'],
              ['Decision', 'One status grammar across the three vocabularies, and screens ordered to follow the loop: Booking Requests, then Reservations, then Settlements.'],
              ['Why', 'Friction clusters at the transitions (approve, check out, get paid), not inside screens. Naming the chain once should remove it everywhere.'],
              ['Evidence and limits', <>Found in a cold first-run review. <span style={{ color: MUTED }}>A three-slide intro that teaches the chain is designed but is not the default path, and nothing has been tested with owners.</span></>],
            ]} />
            <StatusGroups />
            <Shot name="requests" caption="Booking Requests as a decision queue. Two choices, approve or decline, so a decision takes seconds." />

            <Decision letter="B" title="Define jargon where it appears" rows={[
              ['Problem', 'ADR, RevPAR, gross and “Overdue” show up as bare terms. In a money product, a number nobody can explain reads as a number nobody can trust.'],
              ['Decision', 'One shared glossary and an (i) tooltip beside every jargon KPI title, instead of a help page the owner has to leave to visit.'],
              ['Why', 'It is the cheapest trust win available: adding a term to one file surfaces it on every screen that uses it.'],
              ['Evidence and limits', <>22 terms across the KPI screens, verified in the browser. <span style={{ color: MUTED }}>Comprehension was not tested with owners.</span></>],
            ]} />
            <figure>
              <div className="rounded-2xl border p-3 md:p-4" style={{ borderColor: LINE, backgroundColor: PANEL }}>
                <img src={now('glossary')} alt="ADR tooltip open on the dashboard" loading="lazy" className="block h-auto w-full rounded-lg" />
              </div>
              <figcaption className="mt-2 text-xs leading-5" style={{ color: MUTED }}>The real tooltip on the dashboard: hover or focus the (i) beside ADR and the definition appears. The text comes from the shared glossary, so every screen that shows ADR says the same thing.</figcaption>
            </figure>

            <Decision letter="C" title="Show the take-rate, derive the payout" rows={[
              ['Problem', 'Owners distrust a payout they can’t reproduce, and a hand-authored settlement table could quietly disagree with the reservations beneath it.'],
              ['Decision', 'Settlements are computed from reservations by one rule set, and the screen shows gross, commission, adjustments and net.'],
              ['Why', 'Transparency is a trust bet: showing the commission up front should reduce disputes, because the owner can check the arithmetic themselves.'],
              ['Evidence and limits', <>The strongest engineering decision in the build (see the worked example in chapter 3). <span style={{ color: MUTED }}>The dispute reduction is a hypothesis; no payout has ever been made.</span></>],
            ]} />
            <SettlementLab />

            <Decision letter="D" title="Surface set-up instead of hiding it" rows={[
              ['Problem', 'A strong 8-step wizard existed, but it was reachable only from a small control in the sidebar.'],
              ['Decision', 'Keep the wizard; add a checklist on the dashboard, a “recommended next step” banner and a progress ring so the existing capability is surfaced, not rebuilt.'],
              ['Why', 'Goal-gradient: people finish what already looks partly done.'],
              ['Evidence and limits', <>Reasoned from the heuristic review. <span style={{ color: MUTED }}>Completion rate is not measured.</span></>],
            ]} />
            <SetupSteps />

            <Decision letter="E" title="Build on tokens, then write the rules down" rows={[
              ['Problem', 'Consistency by copy-paste: pages look alike today and drift tomorrow, especially when an AI writes most of the code.'],
              ['Decision', 'A 3-tier token system, one radius knob, a 4px grid, and a small set of written rules (empty states, loading, jargon) that every page must follow.'],
              ['Evidence and limits', <>The foundation held and the rules held where they were written. <span style={{ color: MUTED }}>Where they weren’t, they didn’t; chapter 8 gives the honest count.</span></>],
            ]} />
            <RuleCards />

            <Decision letter="F" title="Let a room inherit from its type" rows={[
              ['Problem', 'The hardest screen in the product. A room has a price, but so does its type; the price has three modes and two audiences. Asking for all of it on every room is slow and lets rooms of one type quietly disagree.'],
              ['Decision', 'Price and layout live on the room type. Adding a room asks for four things, then shows the type’s details read-only.'],
              ['Why', 'A manager adds twenty rooms but defines three types. Inheritance makes the common action fast and the rare action, changing a rate, happen in exactly one place.'],
              ['Evidence and limits', <>It survived eight steps of rework in the commit history (next chapter). <span style={{ color: MUTED }}>It has never been put in front of an owner.</span></>],
            ]} />
            <FieldCount />
          </Chapter>

          {/* ── 5 · Rooms ────────────────────────────────────────────── */}
          <Chapter id="rooms" n={5} kicker="The product" title="The hardest screen: rooms" lead="Rooms look like the simplest thing a hotel owns. They became the most reworked screen in the build, because the difficulty is the model, not the form.">
            <H3>Two levels, one mental model</H3>
            <p>A <i>room type</i> (Deluxe) owns the rules. A <i>room</i> (201) is an instance of it. The owner has to hold that in their head while pricing, so the screen has to carry it for them.</p>
            <InheritDiagram />

            <H3>Where it started</H3>
            <p>The first version, from 29 May, was a flat table of rooms. Every room was its own island: its own price, its own beds, its own amenities.</p>
            <Compare
              a={{ src: before('a-rooms'), tag: 'Before', when: '29 May · 53ba070' }}
              b={{ src: now('rooms'), tag: 'Now', when: 'today' }}
              verdict="A flat list of rooms becomes rooms grouped under their type. The type row carries the price, bed count and amenities once; each room underneath only shows what is its own."
            />
            <Compare
              a={{ src: before('a-addroom'), tag: 'Before', when: '29 May · 53ba070', portrait: true }}
              b={{ src: now('addroom-regular'), tag: 'Now', when: 'today', portrait: true }}
              verdict="Eight inputs per room, including a price that could silently differ from its siblings, become four inputs and a read-only block. The “Deluxe details” divider says plainly where the rest comes from."
            />

            <H3>What the modal does, and why</H3>
            <Table
              head={['Detail', 'Design response', 'Reason']}
              rows={[
                ['Room vs room type', 'Type is a dropdown with a one-line note: “Sets pricing, beds, occupancy and amenities for this room.”', 'The distinction is the biggest conceptual hurdle, so it is stated at the exact moment it matters.'],
                ['Inherited details', 'Changing the type swaps the whole block and resets the price tab to Regular.', 'The owner sees what they are getting before they save.'],
                ['Three price modes', 'A segmented control: Regular (Night), Session (Day), Weekend (Off). Modes a type doesn’t sell are dimmed, not hidden.', 'Hiding a mode makes the owner wonder where it went; dimming says “this type doesn’t offer it”.'],
                ['Two guest types', 'Local and foreigner rows appear only when the property’s policy is “Foreigners welcome”.', 'A property that doesn’t take foreign guests never sees a field it can’t use.'],
                ['Session length', 'Read-only, bound to the hotel-wide default, with a “managed in Settings” link.', 'One source of truth. Two places to set it produced contradictions.'],
              ]}
            />

            <H3>Pricing, the part that kept changing</H3>
            <p>Weekend pricing is the most intricate control. An owner chooses weekend days, then an uplift as a percent or a flat amount; with foreigner pricing in flat mode there are two uplifts. The preview has to make the result obvious before anything is saved.</p>
            <Compare
              a={{ src: before('b-type-weekend'), tag: 'Before', when: '10 Jun · b2bd1d5' }}
              b={{ src: now('type-weekend'), tag: 'Now', when: '16 Jun · fd53ba0' }}
              verdict="The %/MMK choice moves inside the input instead of sitting beside it as a second control, the days and the Settings link collapse onto fewer lines, and the preview becomes a stacked before/after with the base faintly struck through."
            />
            <Strip frames={[
              { name: 'type-regular', label: 'Regular', text: 'Local and foreigner nightly rates.' },
              { name: 'type-session', label: 'Session', text: 'Hourly blocks, length locked to Settings.' },
              { name: 'type-weekend', label: 'Weekend', text: 'Uplift on both rates, with a live preview.' },
            ]} />

            <H3>How it changed</H3>
            <Timeline items={[
              { when: '29 May', ref: '53ba070', title: 'Flat rooms table, every room a separate island', text: 'The first room editor, as a side sheet with price, beds and amenities per room.' },
              { when: '2 Jun', ref: '11da1d2', title: 'Booking types and weekend pricing', text: 'Room types become a real concept, with night, session and weekend rates.' },
              { when: '3 Jun', ref: '88df47f', title: 'Session length locked to the hotel-wide default', text: 'One value in Settings, shown read-only on the type, with a link to change it.' },
              { when: '4 Jun', ref: '8612b3a', title: 'Rooms onboarding', text: 'A “Set up your rooms in 2 steps” guide, a “Three ways to price this room” explainer inside the form, and a coach-mark tour. Added because the model was hard to learn.', tone: INFO },
              { when: '8 Jun', ref: '260f0bd', title: 'Rooms nested under their type', text: 'The flat table becomes grouped by type, so the model is visible in the list itself.' },
              { when: '10 Jun', ref: 'b2bd1d5', title: 'Optional foreigner rate', text: 'Shown only when the property’s policy allows it.' },
              { when: '16 Jun', ref: 'fd53ba0', title: 'Weekend control and preview redesigned', text: 'Unified input toggle; per-rate flat uplifts; stacked before/after preview.' },
              { when: '19 Jun', ref: '64b80bc', title: 'Price tab badges hidden on phones', text: 'They crowded the tabs at 375px.' },
            ]} />
            <Tag kind="Interpretation">Most of these changes remove an input or move a decision to where it is made once. I read the pattern as “every field has to earn its place on this screen”, but no note records that as the intent.</Tag>
            <Tag kind="Gap">There is no usability test of this flow. The guided tour and the pricing explainer exist because I judged the model hard to learn, not because I watched anyone struggle.</Tag>
          </Chapter>

          {/* ── 6 · Money, trust, moderation ─────────────────────────── */}
          <Chapter id="money" n={6} kicker="The product" title="Money, trust and moderation" lead="Three screens where the product holds something the owner cares about: their earnings, their reputation and their brand.">
            <H3>Seeing demand before it arrives</H3>
            <Strip frames={[
              { name: 'calendar', label: 'Month', text: 'Status-coloured chips and a revenue pill per day.' },
              { name: 'calendar-day', label: 'Day sheet', text: 'Click a day: its bookings, revenue and guests slide in.' },
              { name: 'reservation-detail', label: 'Reservation', text: 'Click a booking: the full record, with its actions.' },
              { name: 'settlement-detail', label: 'Settlement', text: 'One payout, opened up.' },
            ]} />
            <p>The day sheet is a <i>peek</i>: it slides over the page so the owner keeps their place in the month. A booking is a <i>record</i>: it gets its own page, with check-in, extend stay, change room and cancel. That split, side sheet for a glance and full page for a record, is applied the same way across the product.</p>

            <H3>Reputation and brand control</H3>
            <p>Reviews feed marketplace trust, and coupons shape the brand, so both pass through a super-admin. Hiding a review and publishing a coupon each need approval, and each has a visible lifecycle so the owner is never left guessing.</p>
            <Strip frames={[
              { name: 'reviews', label: 'Reviews', text: 'Response rate is a KPI; hiding a review needs approval.' },
              { name: 'coupons', label: 'Coupons', text: 'Active, Pending review, Scheduled, Rejected, Expired, Disabled.' },
            ]} />
            <Tag kind="Interpretation">Requiring approval is a sound moderation choice, but the expectation is disclosed late, at submit. I would move it before the form. No reason for the current order is recorded.</Tag>
          </Chapter>

          {/* ── 7 · Process ──────────────────────────────────────────── */}
          <Chapter id="process" n={7} kicker="How it was made" title="Process and iteration" lead="TutuStay did not start as TutuStay. The repository began as a different product, and the shell, tables, tokens and drawers carried over while the purpose changed three times.">
            <H3>Before this version</H3>
            <Timeline items={[
              { when: '20 Apr', ref: 'f554303', title: 'iDap Business', text: 'A client portal for running surveys. The first screens, the first tokens.' },
              { when: '21 Apr', ref: '1eb8c41', title: 'Pivot: admin console', text: 'Moderation flows for companies, respondents and payouts.' },
              { when: '22 Apr', ref: 'eaa79e2', title: 'Pivot: respondent app', text: 'Survey feed, wallet, a mobile-responsive shell.', tone: WARN },
              { when: '29 May', ref: '53ba070', title: 'Hotel management arrives', text: 'Rooms and side-sheet editors, on the same shell.', tone: GOOD },
              { when: '2 Jun', ref: '1172c05', title: 'Repurposed as TutuStay', text: 'A booking-management dashboard with coupons and settlements. From here the product has one purpose.', tone: GOOD },
            ]} />
            <Tag kind="Gap">That history is why some of the design system is strong and some is not. The primitives that survived three products are the ones that were genuinely reusable; leftover survey code and fork files are still in the repo.</Tag>

            <H3>How the work ran</H3>
            <Flow steps={[
              { t: 'Domain model', d: 'Entities, states, the loop' },
              { t: 'IA', d: 'Grouped by how an operator thinks' },
              { t: 'Tokens', d: 'Three tiers' },
              { t: 'Screens', d: 'One grammar, in sweeps' },
              { t: 'Audit', d: 'Heuristics, then a roadmap' },
            ]} />
            <p>I benchmarked Atlassian, Notion, Linear, Stripe, Airbnb and HubSpot for patterns, modelled the domain first, then built hi-fi screens on in-memory sample data. A self-authored heuristic review followed and produced the roadmap in chapter 10.</p>

            <H3>What the review found</H3>
            <Table
              head={['Heuristic', 'Finding']}
              rows={[
                ['Visibility of status', 'Pills and deltas are good, but actions give no success feedback.'],
                ['Match the real world', 'The IA matches the operator; ADR, RevPAR and gross do not. (Answered by decision B.)'],
                ['Error recovery', '“Overdue” and “On hold” name a problem without offering a fix.'],
                ['Accessibility', 'Status is shown by colour alone; dark mode advertises a capability it doesn’t have.'],
              ]}
            />
            <Shot name="skeleton" caption="Loading state, caught mid-shimmer. A list page that jumped from blank to full was one of the things the sweeps fixed." />
          </Chapter>

          {/* ── 8 · Design system & AI ───────────────────────────────── */}
          <Chapter id="system" n={8} kicker="How it was made" title="Design system and AI" lead="Most of the code was written with Claude as a pair programmer. Speed without coherence is the risk; my answer was to treat consistency as something to teach and write down.">
            <H3>The token foundation</H3>
            <p>Three tiers, so a re-theme is a change to one layer. Components read a thin adapter; screens read the semantic tier; only the semantic tier ever touches the raw palette.</p>
            <TierDiagram />

            <H3>The loop that kept the AI consistent</H3>
            <Flow steps={[
              { t: 'Notice', d: 'I spot a page that breaks the grammar' },
              { t: 'Name', d: 'Turn it into one canonical pattern, with a reference page' },
              { t: 'Record', d: 'Write it down as a rule the AI reads every session' },
              { t: 'Sweep', d: 'Apply it to every page in one pass' },
              { t: 'Verify', d: 'Typecheck, then look at it in the browser' },
            ]} />

            <H3>Three rules, written down</H3>
            <Table
              head={['Pattern', 'The rule', 'Why it exists']}
              rows={[
                ['Empty states', 'Always a centred domain icon, a bold title and a muted description. Plain text is not acceptable.', 'Rooms and several pages showed bare text. I flagged it and every list page was brought into line.'],
                ['Loading', 'One shared shimmer Skeleton primitive; never a per-page skeleton. Stat cards, rows and the pagination count all skeleton on first load.', 'List pages jumped from blank to full. One commit wired 20 files to the same primitive.'],
                ['Jargon', 'A KPI title that is jargon must wire an (i) tooltip from the shared glossary. Adding a term to the glossary is the only step needed.', 'ADR, RevPAR and gross erode trust in a money product, and the glossary makes the fix a one-line change.'],
              ]}
            />
            <Stats items={[
              { n: '20', l: 'files brought onto one skeleton primitive in a single sweep' },
              { n: '22', l: 'jargon terms behind (i) tooltips, from one glossary file' },
              { n: '1', l: 'drawer width: every drawer and side sheet standardised to max-w-md' },
            ]} />

            <H3>The design-system page is the AI’s ground truth</H3>
            <p>The in-app design-system page is a live reference, not a picture. It renders the real tokens and components, and its drawer section opens the actual Add Room, Add Room Type, Add Coupon and Add Employee editors a manager uses. When a pattern changed, the reference changed in the same commit, so the documentation could not fall behind the product.</p>
            <a href="https://tutustay-manager-dashboard.vercel.app/design-system" target="_blank" rel="noreferrer"
              className="group block rounded-2xl border p-5 transition-colors hover:bg-white/5" style={{ borderColor: ACCENT, backgroundColor: PANEL }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label>Live design system</Label>
                  <div className="mt-1 text-lg font-semibold" style={{ color: TEXT }}>TutuStay · Design System</div>
                  <p className="mt-1 text-sm leading-6" style={{ color: BODY }}>
                    Rendered from <code>theme.css</code> and the real components, not from a Figma file or a screenshot. Open it to inspect the tokens, try every button and form state, and launch the actual product editors.
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium" style={{ borderColor: LINE, color: TEXT }}>
                  Open <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {['Colors', 'Typography', 'Spacing', 'Radius', 'Elevation', 'Buttons', 'Forms', 'Feedback', 'Containers', 'Drawers', 'Layout', 'Cards & Stats', 'Tables & Filters', 'Charts', 'Banners & Overlays'].map((x) => <Chip key={x}>{x}</Chip>)}
              </div>
              <p className="mt-3 text-xs" style={{ color: MUTED }}>tutustay-manager-dashboard.vercel.app/design-system</p>
            </a>
            <Table
              head={['Section', 'What it shows', 'Why it is there']}
              rows={[
                ['Colors, Typography, Spacing, Radius', 'Every semantic token with its variable name, hex value and the palette step it points at. ABC Diatype with two weights, a 4px grid and one radius knob.', 'The whole palette is readable in one place, so a new screen never needs a made-up value.'],
                ['Elevation', 'Proposed shadow tokens that consolidate 11 ad-hoc values.', 'The product is flat and border-first; the exceptions are named instead of scattered.'],
                ['Buttons, Forms, Feedback', 'Every variant, size and state, rendered by the real components. Pickers and selects are interactive.', 'A state that isn’t on this page isn’t designed yet.'],
                ['Containers, Cards & Stats, Tables & Filters, Charts', 'The composed patterns: KPI cards, empty states, resizable tables, the three date-range pickers, chart styles.', 'These are the screen-grammar parts from chapter 3, documented once.'],
                ['Drawers', 'The real Add Room, Add Room Type, Add Coupon and Add Employee editors, and the calendar day sheet.', 'Opening one launches exactly what a manager uses, so the reference can’t drift from the product.'],
                ['Banners & Overlays', 'Sample-data ribbon, booking toasts, welcome modal and tours.', 'The first-run and notification layer, in one place.'],
              ]}
            />
            <Shot name="designsystem" caption="The design-system page: tokens, buttons, forms, feedback, containers and the real product drawers, all rendered live." />
            <div className="flex flex-wrap gap-3">
                            <a href="https://tutustay-manager-dashboard.vercel.app/design-system" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10" style={{ borderColor: LINE, color: TEXT }}>
                Open the design system <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <H3>What stayed mine</H3>
            <p>I owned the domain model, the information architecture, the token architecture, the rules above and every acceptance decision. Claude produced and refactored implementation and ran the sweeps; the audits were run the same way.</p>

            <H3>Token-rich, component-poor</H3>
            <Table
              head={['Reality', 'Count', 'Verdict']}
              rows={[
                ['Token references across the code', '5,000+', 'Values are well systematised'],
                ['Imports of the Button primitive', '0', 'Built, then never adopted'],
                ['Hand-rolled inline buttons', '412', 'Consistency by copy-paste'],
                ['bg-white / text-white literals', '485 / 162', 'Bypass the tokens and break dark mode'],
              ]}
            />
            <Tag kind="Gap">The method is uneven. Where a rule was written down and swept, it held: empty states, skeletons and glossary tooltips are uniform. Where it wasn’t, it didn’t: the Button primitive has zero imports. The lesson is that the AI follows the rules it is given, so the work is deciding which rules to write.</Tag>
          </Chapter>

          {/* ── 9 · Results ──────────────────────────────────────────── */}
          <Chapter id="results" n={9} kicker="Results" title="Results and evidence" lead="This page makes no claims about results. What exists is a working front-end and a set of statements I have checked against the build.">
            <Table
              head={['Claim', 'Status']}
              rows={[
                ['KPI maths (occupancy, ADR, RevPAR, in-house guests) is computed live from reservations', <Chip tone={GOOD}>Real</Chip>],
                ['Settlements and their status are derived from reservations and today’s date', <Chip tone={GOOD}>Real</Chip>],
                ['3-tier tokens, resizable sidebar and table columns, 8-step wizard, English / Korean / Burmese', <Chip tone={GOOD}>Real</Chip>],
                ['Data persistence and API calls. State is in-memory and resets on refresh; the mock layer is wired but empty.', <Chip tone={BAD}>Not real</Chip>],
                ['Dark mode. The block exists but there is no toggle and no semantic values.', <Chip tone={BAD}>Not real</Chip>],
                ['Impact on owners. No users, no telemetry.', <Chip tone={WARN}>Unmeasured</Chip>],
              ]}
            />
            <Tag kind="Gap">The demo data needs work to read as true: dates were seeded as fixed ISO strings and have aged; two reservations point at customers that don’t exist; there are no repeat guests, so the Repeat customers KPI can’t be demonstrated; and the Burmese market story disagrees with a Korean-won default currency.</Tag>
          </Chapter>

          {/* ── 10 · Reflection ──────────────────────────────────────── */}
          <Chapter id="next" n={10} kicker="Results" title="Reflection and next steps">
            <H3>What I’d keep</H3>
            <ul className="list-disc space-y-1 pl-5">
              <li>The token architecture and the habit of auditing my own work.</li>
              <li>An IA grouped by how an operator thinks, not by database table.</li>
              <li>One screen grammar that makes every page learnable, and rules that keep the AI inside it.</li>
              <li>Inheritance in the room model: define once, show everywhere.</li>
            </ul>
            <H3>What I’d change first</H3>
            <Table
              head={['Priority', 'Move', 'Why']}
              rows={[
                ['P0', 'Success and consequence toasts on approve, decline, save, reply', 'Silent actions are the cheapest trust gap to close'],
                ['P0', 'Seed the demo relative to today and fix dangling references', 'The hero screen currently shows an empty tonight'],
                ['P1', 'Adopt the Button primitive; extract Card, Badge, Input, EmptyState', 'Turn consistency-by-discipline into consistency-by-construction'],
                ['P1', 'Status icons and legend; wire dark mode or remove it', 'Colour-only status is an accessibility exposure'],
                ['P2', 'Run five owner interviews', 'The largest evidence gap in this whole case study'],
              ]}
            />
            <p className="pt-4" style={{ color: MUTED }}>Thanks for reading. The live link is in chapter 8, next to the design system explanation.</p>
            
          </Chapter>
        </main>

        {/* Right: on this page */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[240px] shrink-0 overflow-y-auto py-10 xl:block">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: MUTED }}>On this page</p>
          <div className="border-l" style={{ borderColor: LINE }}>
            {toc.map((t) => {
              const on = activeSub === t.id;
              return (
                <button key={t.id} type="button" onClick={() => document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth' })}
                  className="-ml-px block w-full border-l-2 py-1.5 pl-4 pr-1 text-left text-sm leading-5 transition-colors hover:text-white"
                  style={{ borderColor: on ? ACCENT : 'transparent', color: on ? TEXT : MUTED, fontWeight: t.top ? 500 : 400 }}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
