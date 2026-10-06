import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpRight, X, ArrowRight, TriangleAlert, Eye, CheckCircle2, CircleDashed, CircleHelp } from 'lucide-react';

/* ============================================================================
   PROJECT SHOWCASE  —  route: /showcase  (full page, outside the app shell)
   A short case study for people who have not seen the product. Order of the
   story: what it is -> the problem -> how one booking moves through it -> the
   four design solutions that matter -> what is built, unbuilt and untested.

   Images are captured from the running dashboard at one size (1440 x 900, or
   a 470px-wide side sheet):
     /showcase/now/*     the current build
     /showcase/before/*  earlier commits, run from git worktrees
   Facts were checked against the code (settlements-data.ts, setup-progress.ts,
   glossary.ts) and the docs in /docs. Nothing here is a measured result.
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
  { group: 'The story', items: [
    { id: 'overview', label: 'What it is' },
    { id: 'problem', label: 'The problem' },
    { id: 'how', label: 'How a booking moves through it' },
  ] },
  { group: 'The design', items: [
    { id: 'solutions', label: 'Four design solutions' },
  ] },
  { group: 'The honest part', items: [
    { id: 'status', label: 'Built, not built, untested' },
    { id: 'made', label: 'How it was made' },
  ] },
];

/* ── Text blocks ────────────────────────────────────────────────────────── */

function Chapter({ id, kicker, title, lead, children }: { id: string; kicker: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t py-14" style={{ borderColor: LINE }}>
      <p className="text-xs uppercase tracking-[0.14em]" style={{ color: MUTED }}>{kicker}</p>
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

/* ── Images ─────────────────────────────────────────────────────────────── */

type Pin = { x: number; y: number; label: string };

/** A full-width desktop screenshot (all are 16:10). Optional numbered pins point at the parts
 *  worth noticing; x and y are percentages of the image, and the legend sits under it. */
function Shot({ name, caption, pins }: { name: string; caption: string; pins?: Pin[] }) {
  return (
    <figure>
      <div className="rounded-2xl border p-3 md:p-4" style={{ borderColor: LINE, backgroundColor: PANEL }}>
        <div className="relative">
          <img src={now(name)} alt={caption} loading="lazy"
            className="block aspect-[16/10] w-full rounded-lg object-cover object-top" />
          {pins?.map((p, i) => (
            <span key={p.label} aria-hidden className="absolute grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[10px] font-bold sm:h-6 sm:w-6 sm:text-xs shadow-lg ring-2 ring-[#0a0f15]"
              style={{ left: `${p.x}%`, top: `${p.y}%`, backgroundColor: ACCENT, color: BG }}>{i + 1}</span>
          ))}
        </div>
      </div>
      {pins && (
        <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm leading-6 sm:grid-cols-2" style={{ color: BODY }}>
          {pins.map((p, i) => (
            <li key={p.label} className="flex gap-2.5">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold" style={{ backgroundColor: ACCENT, color: BG }}>{i + 1}</span>{p.label}
            </li>
          ))}
        </ol>
      )}
      <figcaption className="mt-3 text-xs leading-5" style={{ color: MUTED }}>{caption}</figcaption>
    </figure>
  );
}

/** One step of the main workflow: a number, one message, then the annotated screen. */
function Step({ n, title, message, children }: { n: number; title: string; message: string; children: ReactNode }) {
  return (
    <div className="space-y-4 pt-8">
      <h3 data-toc={title} className="flex items-baseline gap-3 text-xl font-semibold tracking-tight" style={{ color: TEXT }}>
        <span className="grid h-8 w-8 shrink-0 translate-y-1 place-items-center rounded-full border text-sm" style={{ borderColor: ACCENT, color: ACCENT }}>{n}</span>{title}
      </h3>
      <p className="max-w-2xl">{message}</p>
      {children}
    </div>
  );
}

/** A design solution: the problem in one line, what the design does, then the evidence and its limit. */
function Solution({ title, problem, does, limit, children }: { title: string; problem: string; does: string; limit: string; children: ReactNode }) {
  return (
    <div className="space-y-4 pt-8">
      <h3 className="text-xl font-semibold tracking-tight" style={{ color: TEXT }}>{title}</h3>
      <dl className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border p-4" style={{ borderColor: LINE, backgroundColor: PANEL }}>
          <dt><Label>The problem</Label></dt><dd className="mt-1.5 text-sm leading-6">{problem}</dd>
        </div>
        <div className="rounded-xl border p-4" style={{ borderColor: ACCENT, backgroundColor: PANEL }}>
          <dt><Label>What the design does</Label></dt><dd className="mt-1.5 text-sm leading-6">{does}</dd>
        </div>
      </dl>
      {children}
      <Tag kind="Gap">{limit}</Tag>
    </div>
  );
}

/** Today (from the brief) against the prototype, row by row. */
function Versus({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: LINE, backgroundColor: PANEL }}>
      <div className="hidden grid-cols-[140px_1fr_1fr] gap-4 border-b px-4 py-3 md:grid" style={{ borderColor: LINE }}>
        <span /><Label>Today, from the brief</Label><Label>In the prototype</Label>
      </div>
      {rows.map(([q, a, b]) => (
        <div key={q} className="grid gap-1 border-b px-4 py-4 last:border-b-0 md:grid-cols-[140px_1fr_1fr] md:gap-4" style={{ borderColor: LINE }}>
          <div className="text-sm font-semibold" style={{ color: TEXT }}>{q}</div>
          <p className="text-sm leading-6" style={{ color: MUTED }}><span className="md:hidden" style={{ color: WARN }}>Today: </span>{a}</p>
          <p className="text-sm leading-6"><span className="md:hidden" style={{ color: GOOD }}>Prototype: </span>{b}</p>
        </div>
      ))}
    </div>
  );
}

function StatusCard({ title, tone, Icon, items }: { title: string; tone: string; Icon: typeof CheckCircle2; items: string[] }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: LINE, backgroundColor: PANEL }}>
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: tone }}><Icon className="h-4 w-4" />{title}</div>
      <ul className="mt-3 space-y-2 text-sm leading-6">
        {items.map((x) => <li key={x} className="flex gap-2"><span style={{ color: tone }}>•</span><span>{x}</span></li>)}
      </ul>
    </div>
  );
}

/* ── Gallery and diagrams ───────────────────────────────────────────────── */

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

type Side = { src: string; tag: string; when: string; portrait?: boolean; natural?: boolean };

/** Before | After, same frame size on both sides, with a verdict line. */
function Compare({ a, b, verdict }: { a: Side; b: Side; verdict: string }) {
  const Pane = ({ s, tone }: { s: Side; tone: string }) => (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="rounded px-1.5 py-0.5 font-semibold uppercase tracking-wide" style={{ color: tone, backgroundColor: `${tone}22` }}>{s.tag}</span>
        <span style={{ color: MUTED }}>{s.when}</span>
      </div>
      <div className="flex items-start justify-center overflow-hidden rounded-xl border p-3" style={{ borderColor: LINE, backgroundColor: PANEL }}>
        <img src={s.src} alt={`${s.tag}, ${s.when}`} loading="lazy"
          className={s.natural ? 'block h-auto w-full rounded-md' : s.portrait ? 'block max-h-[480px] w-auto rounded-md object-contain object-top' : 'block aspect-[16/10] w-full rounded-md object-cover object-top'} />
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



/* ── The page ───────────────────────────────────────────────────────────── */

const PROTOTYPE_URL = 'https://tutustay-manager-dashboard.vercel.app/login';
const DESIGN_SYSTEM_URL = 'https://tutustay-manager-dashboard.vercel.app/design-system';

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
      return { id: h.id, label: h.dataset.toc ?? h.textContent ?? '', top: i === 0 };
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
            Statements about the product are checked against the code. Two labels mark the exceptions:
            <br /><b style={{ color: INFO }}>Interpretation</b> my reading where no reason is recorded.
            <br /><b style={{ color: WARN }}>Gap</b> untested or missing.
          </p>
        </aside>

        <main className="mx-auto min-w-0 max-w-[880px] flex-1 pb-32">
          {/* ── 1 · What it is ───────────────────────────────────────── */}
          <section id="overview" className="scroll-mt-24 pb-14 pt-14">
            <div className="text-center">
              <p className="text-sm" style={{ color: MUTED }}>Manager dashboard prototype <span className="mx-2">·</span> Product and UX design <span className="mx-2">·</span> 2026</p>
              <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
                TutuStay helps small hotel owners turn booking requests into paid stays
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8" style={{ color: MUTED }}>
                A dashboard where an owner approves booking requests, tracks guests and rooms, and checks exactly how their payout was calculated. A working prototype on sample data.
              </p>
              <a href={PROTOTYPE_URL} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10" style={{ borderColor: ACCENT, backgroundColor: PANEL }}>
                Try the prototype <ArrowUpRight className="h-4 w-4" />
              </a>
              <p className="mt-2 text-xs" style={{ color: MUTED }}>Opens the live project. The email is pre-filled; enter any password to sign in.</p>
            </div>
            <div className="mt-12">
              <Shot name="dashboard" caption="The dashboard an owner sees first: arrivals, departures, occupancy and revenue, worked out from the reservations. All names and numbers are sample data." />
            </div>

            <dl className="mt-10 grid gap-3 sm:grid-cols-2">
              {[
                ['What it is', 'The manager side of a hotel booking platform. The guest app and the platform admin side are not built.'],
                ['Who it is for', 'Owners and staff of single-property hotels and guesthouses in Myanmar, who today run on chat apps, paper and spreadsheets.'],
                ['The problem', 'There is no one place to see who arrives tonight, which bookings are confirmed, or what the owner will be paid and when.'],
                ['The idea', 'Show the whole path, request to stay to payout, on screens an owner can follow and check for themselves.'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border p-5" style={{ borderColor: LINE, backgroundColor: PANEL }}>
                  <dt><Label>{k}</Label></dt><dd className="mt-2 text-[15px] leading-7" style={{ color: TEXT }}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm leading-6" style={{ color: MUTED }}>
              Built solo: product design, UX, design system and front-end (React, TypeScript, Tailwind), with Claude as an AI pair programmer. Status: front-end only, no backend, no users yet.
            </p>
          </section>

          {/* ── 2 · The problem ──────────────────────────────────────── */}
          <Chapter id="problem" kicker="Context" title="The problem" lead="A small hotel is run from chat threads, a paper register and a payout spreadsheet.">
            <Versus rows={[
              ['Taking bookings', 'Requests arrive in chat apps and are answered one by one.', 'A Booking Requests queue. Each request is approved or declined with one click.'],
              ['Knowing who arrives', 'A paper register, or memory.', 'Arrivals, departures and occupancy are computed from the reservations.'],
              ['Getting paid', 'A spreadsheet, and no clear way to check it.', 'A settlement shows gross, the 12% commission, adjustments and the net payout.'],
            ]} />
            <Tag kind="Gap">This comes from the project brief and a first-run review of the screens, not from owner interviews. No owners have been interviewed or observed. TutuStay is a take-rate marketplace: the platform earns 12% of completed stays, so a booking that never reaches payout earns nothing.</Tag>
          </Chapter>

          {/* ── 3 · How it works ─────────────────────────────────────── */}
          <Chapter id="how" kicker="Main workflow" title="How a booking moves through it" lead="Three screens, one path. The owner decides, hosts the stay, then sees the money.">
            <Flow steps={[
              { t: '1 · Request', d: 'A guest asks to book. The owner approves or declines.' },
              { t: '2 · Reservation', d: 'The stay is held, then checked in and out.' },
              { t: '3 · Settlement', d: 'Checked-out stays are added up into a payout.' },
            ]} />

            <Step n={1} title="Decide on a request" message="New requests wait in one list. The owner sees the dates, room, price and any note, and answers with a single click.">
              <Shot name="requests" pins={[
                { x: 18.5, y: 26, label: 'How many requests are waiting, and what they are worth.' },
                { x: 20, y: 39.5, label: 'Search and filter by guest, room or check-in date.' },
                { x: 87, y: 67.5, label: 'Approve or decline. Approving turns the request into a reservation.' },
              ]} caption="Booking Requests. Two choices per request, so a decision takes seconds." />
            </Step>

            <Step n={2} title="Host the stay" message="An approved request becomes a reservation with its own page. Everything about the stay is in one place, with the actions that move it forward.">
              <Shot name="reservation-detail" pins={[
                { x: 15.5, y: 17, label: 'Status and payment state at a glance.' },
                { x: 89, y: 13.5, label: 'Check in the guest, or cancel the booking.' },
                { x: 56, y: 44.5, label: 'Extend the stay or move the guest to another room.' },
                { x: 45, y: 75, label: 'The price after a coupon, with the saving shown.' },
              ]} caption="A reservation. Checking the guest out later makes the stay count towards a payout." />
            </Step>

            <Step n={3} title="See the payout" message="Checked-out stays are grouped into half-month periods. The settlement page shows each step from gross revenue to the amount the owner receives.">
              <Shot name="settlement-detail" pins={[
                { x: 13, y: 31, label: 'Gross revenue: the sum of the period’s stays.' },
                { x: 35, y: 31, label: 'Commission: 12% taken by the platform.' },
                { x: 59, y: 31, label: 'Adjustments: refunds and cancellations.' },
                { x: 80, y: 31, label: 'Net payout: what is transferred to the owner.' },
              ]} caption="A settlement. The same four numbers appear as cards and again as a breakdown, so the owner can check the sum." />
            </Step>
          </Chapter>

          {/* ── 4 · Solutions ────────────────────────────────────────── */}
          <Chapter id="solutions" kicker="The design" title="Four design solutions" lead="The few decisions that explain most of the product. Each says what was hard, what the design does, and what has not been tested.">
            <Solution
              title="Explain the jargon next to the number"
              problem="Terms like ADR and RevPAR appear as bare labels. In a money product, a number nobody can explain is a number nobody trusts."
              does="An (i) icon beside each jargon label opens a plain-English definition. All definitions come from one shared glossary, so every screen says the same thing."
              limit="22 terms are defined across the dashboard screens. Whether owners read or understand them has not been tested.">
              <figure>
                <div className="rounded-2xl border p-3 md:p-4" style={{ borderColor: LINE, backgroundColor: PANEL }}>
                  <div className="relative">
                    <img src={now('glossary')} alt="The ADR tooltip open on the dashboard" loading="lazy" className="block h-auto w-full rounded-lg" />
                  </div>
                </div>
                <figcaption className="mt-3 text-xs leading-5" style={{ color: MUTED }}>
                  Hover or focus the (i) beside ADR and the definition appears right there, in everyday words.
                </figcaption>
              </figure>
            </Solution>

            <Solution
              title="Show how the payout is worked out"
              problem="An owner distrusts a payout they cannot reproduce, and a hand-typed settlement table could quietly disagree with the reservations behind it."
              does="Settlements are calculated from the reservations: gross, minus 12% commission, minus adjustments. Cancelled stays count as a 50% adjustment. Payment is due 2 days after the period closes."
              limit="The rules are the product’s own constants, but no real payout has ever been made. The idea that this reduces disputes is a hypothesis.">
              <SettlementLab />
            </Solution>

            <Solution
              title="Let each room inherit from its room type"
              problem="A room has a price, beds and amenities, but so does its type. Asking for all of it on every room is slow and lets rooms of one type disagree."
              does="Price, beds and amenities are set once on the room type. Adding a room asks for four things, then shows the type’s details as read-only."
              limit="This model has never been put in front of an owner. The sample data still shows rooms 301 and 302 priced above their type, so the demo does not yet show the rule cleanly.">
              <InheritDiagram />
              <Shot name="rooms" pins={[
                { x: 35, y: 49, label: 'The room type holds the price, beds and amenities.' },
                { x: 35, y: 56.5, label: 'Rooms under it only add their own floor, number and status.' },
              ]} caption="Rooms are grouped under their type. Use “Add room” on a type to add one." />
              <Compare
                a={{ src: before('a-addroom'), tag: 'Before', when: '29 May · 53ba070', portrait: true }}
                b={{ src: now('addroom-regular'), tag: 'Now', when: 'today', portrait: true }}
                verdict="The first version asked for eight inputs per room. Now it asks for four and shows the rest as read-only."
              />
            </Solution>

            <Solution
              title="Guide new owners through setup"
              problem="A good 8-step setup wizard existed, but it was reachable only from a small control in the sidebar. A new owner had no clear place to start."
              does="The wizard stays. A setup page now shows a checklist and progress ring, and says what finishing unlocks. A progress ring in the sidebar and a “recommended next step” banner on the dashboard point back to it until the property is ready."
              limit="Whether this raises setup completion is not measured. Progress is also counted three ways: 5 of 6 on the setup page, 7 of 8 in the dashboard checklist, and 8 steps in the wizard.">
              <Shot name="setup-hub" pins={[
                { x: 10.5, y: 31, label: 'Each step is ticked off as it is completed. The pencil reopens it.' },
                { x: 82.5, y: 28.5, label: 'Overall progress, and a Submit button once everything is filled in.' },
                { x: 82, y: 57, label: 'What finishing unlocks: go live, take bookings, get paid.' },
                { x: 2.3, y: 75.6, label: 'The same progress ring stays in the sidebar until setup is done.' },
              ]} caption="The setup page. It answers “where do I start?” and “why bother?” in one view." />
              <Shot name="setup-wizard" pins={[
                { x: 50, y: 11.5, label: 'Eight steps, always visible, so the owner can see how far there is to go.' },
                { x: 23, y: 38.5, label: 'One group of details per step, with a hint under each label.' },
              ]} caption="Inside the wizard, step 1 of 8. Each step is one short form." />
            </Solution>

            <H3>Every screen follows the same layout</H3>
            <p>Each list page has a title, a row of key numbers, search and filters, then the list. Learn one screen and the rest feel familiar. The same layout re-flows for phones: tables become cards and filters move into a sheet.</p>
            <Strip frames={[
              { name: 'requests', label: 'Requests', text: 'A decision queue.' },
              { name: 'reservations', label: 'Reservations', text: 'Table with rate chips.' },
              { name: 'customers', label: 'Customers', text: 'Repeat guests as a KPI.' },
              { name: 'coupons', label: 'Coupons', text: 'Six lifecycle states.' },
              { name: 'reviews', label: 'Reviews', text: 'Response rate and moderation.' },
            ]} />
            <Compare
              a={{ src: now('reservations'), tag: 'Desktop', when: '1440 px' }}
              b={{ src: now('m-reservations'), tag: 'Phone', when: '390 px', portrait: true }}
              verdict="Same words and order. The table row becomes a card with its fields stacked, so nothing scrolls sideways."
            />
          </Chapter>

          {/* ── 5 · Status ───────────────────────────────────────────── */}
          <Chapter id="status" kicker="The honest part" title="Built, not built, untested" lead="This page makes no claims about results. Here is what exists, what does not, and what nobody has checked.">
            <div className="grid gap-3 md:grid-cols-3">
              <StatusCard title="Built and working" tone={GOOD} Icon={CheckCircle2} items={[
                'The booking path: request, reservation, settlement',
                'Occupancy, ADR and RevPAR worked out from reservations',
                'Settlements derived from reservations and today’s date',
                '8-step property setup wizard',
                'English, Korean and Burmese',
              ]} />
              <StatusCard title="Not built" tone={BAD} Icon={CircleDashed} items={[
                'The guest app and the platform admin side',
                'A backend: data lives in memory and resets on refresh',
                'Dark mode inside the product (the page you are reading is separate)',
                'A brand identity: the logo is a placeholder',
              ]} />
              <StatusCard title="Not measured" tone={WARN} Icon={CircleHelp} items={[
                'Whether owners understand or like it',
                'Setup completion, approval rate, payout disputes',
                'No users, no interviews, no usage data',
              ]} />
            </div>

            <H3>Rough edges in the demo</H3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Some sample numbers look odd, such as a +2336% revenue change on the dashboard, because dates were seeded as fixed values and have aged.</li>
              <li>Setup progress is counted three ways: 5 of 6 on the setup page, 7 of 8 in the dashboard checklist, and 8 steps in the wizard.</li>
              <li>Rooms 301 and 302 are priced above their room type (see solution 3).</li>
            </ul>

            <H3>Next: test with real owners</H3>
            <Flow steps={[
              { t: 'Put it in front of owners', d: 'Staff run a real day on it' },
              { t: 'Watch where they hesitate', d: 'Note questions and wrong turns' },
              { t: 'Fix the booking path first', d: 'Request to payout comes before polish' },
              { t: 'Test again', d: 'Check the fix worked' },
            ]} />
            <Table
              head={['Question to answer', 'What I would watch for']}
              rows={[
                ['Can an owner explain, in their own words, how a request becomes a payout?', 'Where they stop or guess: approve, check out, get paid.'],
                ['Can an owner reproduce one payout from its reservations?', 'Questions about commission and adjustments.'],
                ['Can a new owner finish setup without help?', 'The step where they stall.'],
                ['Can an owner add ten rooms and change a rate without mixing up room and room type?', 'Time taken and mistakes.'],
              ]}
            />
          </Chapter>

          {/* ── 6 · How it was made ──────────────────────────────────── */}
          <Chapter id="made" kicker="Secondary detail" title="How it was made" lead="For readers who want to know how the prototype was built, and how it stays consistent.">
            <ul className="list-disc space-y-2 pl-5">
              <li><b style={{ color: TEXT }}>One person, about ten weeks.</b> The repository started on 20 April 2026 as a different product (a survey portal) and became TutuStay in early June. The shell, tables and design tokens carried over.</li>
              <li><b style={{ color: TEXT }}>AI as a pair programmer.</b> Claude wrote most of the code under my direction. I owned the domain model, the screen layout, the design tokens and every acceptance decision.</li>
              <li><b style={{ color: TEXT }}>Consistency by written rules.</b> Empty states, loading skeletons and jargon tooltips each follow one written rule that was applied to every page. Where no rule was written, consistency is weaker: the shared Button component exists but is not used.</li>
            </ul>
            <a href={DESIGN_SYSTEM_URL} target="_blank" rel="noreferrer"
              className="group block rounded-2xl border p-5 transition-colors hover:bg-white/5" style={{ borderColor: ACCENT, backgroundColor: PANEL }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label>Live design system</Label>
                  <p className="mt-1 text-sm leading-6" style={{ color: BODY }}>
                    A page inside the product that renders the real colours, type, components and the actual product editors. Open it to inspect any part.
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium" style={{ borderColor: LINE, color: TEXT }}>
                  Open <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
            <p style={{ color: MUTED }}>Thanks for reading. The live prototype link is at the top of this page.</p>
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
