import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Coins,
  CalendarCheck,
  CalendarPlus,
  LogOut,
  Inbox,
  Percent,
  Gauge,
  Tag,
  Users,
  ChevronRight,
  TriangleAlert,
} from 'lucide-react';
import {
  format,
  differenceInDays,
  startOfDay,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  isWithinInterval,
  isSameMonth,
  isSameDay,
  addDays,
  subDays,
  subMonths,
} from 'date-fns';
import { BrandSelect } from '@/shared/ui/brand-select';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useReservations } from '@/pages/reservations/use-reservations';
import {
  countsAsRevenue,
  formatAmount,
  type Reservation,
  type ReservationStatus,
} from '@/pages/reservations/reservations-data';
import { useBookingRequests } from '@/pages/booking-requests/use-booking-requests';
import type { RequestStatus } from '@/pages/booking-requests/booking-requests-data';
import { useHotel } from '@/pages/hotel/use-hotel';
import { QuickStartChecklist } from '@/widgets/onboarding';
import { InfoTooltip } from '@/shared/ui/info-tooltip';
import { GLOSSARY } from '@/widgets/onboarding/glossary';

type RangeKey = '7d' | '30d' | 'this_month' | 'last_month';

/** Compact amount for chart axis / reference line only (e.g. 270K, 1.2M). */
function moneyShort(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

const USER_FIRST_NAME = 'Hein';
const NOW = new Date('2026-06-02T10:00:00');

// Brand (ocean) ramp shades for the "Revenue by room type" bars — darkest for
// the top earner, fading lighter down the list.
const ROOM_TYPE_BAR_COLORS = [
  'var(--color-base-ocean-70)',
  'var(--color-base-ocean-60)',
  'var(--color-base-ocean-50)',
  'var(--color-base-ocean-40)',
  'var(--color-base-ocean-30)',
];

// Status → pill colors, matching statusStyle() in Reservations and the
// booking-request status badges so the dashboard reads as part of the product.
function statusPill(status: ReservationStatus | RequestStatus): string {
  const map: Record<string, string> = {
    Confirmed: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]',
    'Checked-in': 'bg-[var(--success-tint)] text-[var(--success)]',
    'Checked-out': 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]',
    Cancelled: 'bg-[var(--danger-tint)] text-[var(--danger)]',
    'No-show': 'bg-[var(--warning-tint)] text-[var(--warning-strong)]',
    Pending: 'bg-[var(--warning-tint)] text-[var(--warning-strong)]',
    Approved: 'bg-[var(--success-tint)] text-[var(--success)]',
    Declined: 'bg-[var(--danger-tint)] text-[var(--danger)]',
  };
  return map[status] ?? 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const reservations = useReservations((s) => s.reservations);
  const requests = useBookingRequests((s) => s.requests);
  const rooms = useHotel((s) => s.rooms);
  const propertyName = useHotel((s) => s.property.name);

  const [range, setRange] = useState<RangeKey>('this_month');

  const today = startOfDay(NOW);

  // Sellable capacity = active rooms (fall back to all rooms if none flagged).
  const capacity = useMemo(() => {
    const active = rooms.filter((r) => r.status === 'Active').length;
    return active || rooms.length;
  }, [rooms]);

  // A reservation physically holds a room on night `d` when it has checked
  // in/out around it and isn't cancelled. Day-use (checkIn === checkOut date)
  // is naturally excluded since it never spans a night.
  const occupiesNight = (r: Reservation, d: Date) =>
    r.status !== 'Cancelled' &&
    r.status !== 'No-show' &&
    startOfDay(new Date(r.checkIn)) <= d &&
    d < startOfDay(new Date(r.checkOut));

  // ── Stats ─────────────────────────────────────────────────────────────
  const monthRevenue = useMemo(
    () =>
      reservations
        .filter((r) => countsAsRevenue(r.status) && isSameMonth(new Date(r.checkIn), NOW))
        .reduce((sum, r) => sum + r.amount, 0),
    [reservations],
  );

  const arrivalsToday = useMemo(
    () =>
      reservations.filter(
        (r) =>
          isSameDay(new Date(r.checkIn), today) &&
          (r.status === 'Confirmed' || r.status === 'Checked-in'),
      ).length,
    [reservations, today],
  );

  const departuresToday = useMemo(
    () =>
      reservations.filter(
        (r) =>
          isSameDay(new Date(r.checkOut), today) &&
          (r.status === 'Checked-in' || r.status === 'Checked-out'),
      ).length,
    [reservations, today],
  );

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === 'Pending').length,
    [requests],
  );

  // Still checked in past their checkout day → needs resolving.
  const overdueCount = useMemo(
    () => reservations.filter((r) => r.status === 'Checked-in' && startOfDay(new Date(r.checkOut)) < today).length,
    [reservations, today],
  );

  // Revenue this month vs the same kind of total last month → MoM % delta.
  const lastMonthRevenue = useMemo(
    () =>
      reservations
        .filter((r) => countsAsRevenue(r.status) && isSameMonth(new Date(r.checkIn), subMonths(NOW, 1)))
        .reduce((sum, r) => sum + r.amount, 0),
    [reservations],
  );
  const revenueMoM = lastMonthRevenue === 0 ? null : ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  // Arrivals/departures vs yesterday, for a day-over-day feel on the cards.
  const yesterday = subDays(today, 1);
  const arrivalsYesterday = useMemo(
    () => reservations.filter((r) => isSameDay(new Date(r.checkIn), yesterday) && (r.status === 'Confirmed' || r.status === 'Checked-in' || r.status === 'Checked-out')).length,
    [reservations, yesterday],
  );
  const departuresYesterday = useMemo(
    () => reservations.filter((r) => isSameDay(new Date(r.checkOut), yesterday) && (r.status === 'Checked-in' || r.status === 'Checked-out')).length,
    [reservations, yesterday],
  );

  // ── Hotel performance metrics (Occupancy, ADR, RevPAR, in-house) ──────
  const perf = useMemo(() => {
    const occupiedToday = reservations.filter((r) => occupiesNight(r, today)).length;
    const occupancyRate = capacity === 0 ? 0 : Math.round((occupiedToday / capacity) * 100);
    const inHouseGuests = reservations
      .filter((r) => occupiesNight(r, today))
      .reduce((sum, r) => sum + r.guests, 0);

    // ADR = room revenue / room-nights sold this month (overnight stays only).
    const monthStays = reservations.filter(
      (r) => countsAsRevenue(r.status) && r.nights > 0 && isSameMonth(new Date(r.checkIn), NOW),
    );
    const roomNights = monthStays.reduce((sum, r) => sum + r.nights, 0);
    const roomRevenue = monthStays.reduce((sum, r) => sum + r.amount, 0);
    const adr = roomNights === 0 ? 0 : Math.round(roomRevenue / roomNights);

    // RevPAR = total month revenue / available room-nights (capacity × days).
    const availableNights = capacity * getDaysInMonth(NOW);
    const revpar = availableNights === 0 ? 0 : Math.round(monthRevenue / availableNights);

    return { occupiedToday, occupancyRate, inHouseGuests, adr, revpar };
  }, [reservations, capacity, today, monthRevenue]);

  const performance = [
    { title: 'Occupancy', Icon: Percent, value: `${perf.occupancyRate}%`, subtitle: `${perf.occupiedToday}/${capacity} ${t('rooms tonight')}` },
    { title: 'ADR', Icon: Tag, value: formatAmount(perf.adr), subtitle: t('Avg. daily rate') },
    { title: 'RevPAR', Icon: Gauge, value: formatAmount(perf.revpar), subtitle: t('Revenue per room') },
    { title: 'In-house guests', Icon: Users, value: String(perf.inHouseGuests), subtitle: t('Staying tonight') },
  ];

  const stats = [
    {
      title: 'Revenue this month',
      Icon: Coins,
      value: formatAmount(monthRevenue),
      subtitle: t('Confirmed stays in June'),
      delta: revenueMoM,
      deltaLabel: t('vs last month'),
      href: '/reservations',
    },
    {
      title: 'Arrivals today',
      Icon: CalendarCheck,
      value: String(arrivalsToday),
      subtitle: t('Guests checking in'),
      delta: arrivalsToday - arrivalsYesterday,
      deltaLabel: t('vs yesterday'),
      deltaUnit: 'count' as const,
      href: '/reservations',
    },
    {
      title: 'Departures today',
      Icon: LogOut,
      value: String(departuresToday),
      subtitle: t('Guests checking out'),
      delta: departuresToday - departuresYesterday,
      deltaLabel: t('vs yesterday'),
      deltaUnit: 'count' as const,
      href: '/reservations',
    },
    {
      title: 'Pending requests',
      Icon: Inbox,
      value: String(pendingRequests),
      subtitle: pendingRequests > 0 ? t('Awaiting your decision') : t('All caught up'),
      delta: null,
      deltaLabel: '',
      href: '/booking-requests',
    },
  ];

  // ── Chart: revenue over time (by check-in date) ──────────────────────
  const { chartData, rangeTotal, rangeTrend, rangeSubtitle, rangeBookings, rangeAvgPerBucket, bucketUnit } =
    useMemo(() => buildRevenueChart(reservations, range, today), [reservations, range, today]);

  // ── Arrivals & departures, next 7 days ───────────────────────────────
  const flow7 = useMemo(() => {
    const out: { name: string; date: Date; arrivals: number; departures: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(today, i);
      const active = (r: Reservation) => r.status !== 'Cancelled' && r.status !== 'No-show';
      out.push({
        name: format(d, 'EEE'),
        date: d,
        arrivals: reservations.filter((r) => active(r) && isSameDay(new Date(r.checkIn), d)).length,
        departures: reservations.filter((r) => active(r) && isSameDay(new Date(r.checkOut), d)).length,
      });
    }
    return out;
  }, [reservations, today]);

  // ── Revenue by room type (this month) ────────────────────────────────
  const roomTypeBreakdown = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number }>();
    reservations
      .filter((r) => countsAsRevenue(r.status) && isSameMonth(new Date(r.checkIn), NOW))
      .forEach((r) => {
        const prev = map.get(r.roomType) ?? { revenue: 0, count: 0 };
        map.set(r.roomType, { revenue: prev.revenue + r.amount, count: prev.count + 1 });
      });
    const rows = Array.from(map.entries())
      .map(([roomType, v]) => ({ roomType, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
    const max = rows[0]?.revenue ?? 0;
    return { rows, max };
  }, [reservations]);

  // ── Recent activity (reservations + booking requests, blended) ───────
  type FeedEvent = {
    kind: 'reservation' | 'request';
    date: string;
    primary: string;
    secondary: string;
    amount: number;
    status: ReservationStatus | RequestStatus;
    href: string;
  };

  const activity: FeedEvent[] = useMemo(() => {
    const events: FeedEvent[] = [
      ...reservations.map((r) => ({
        kind: 'reservation' as const,
        date: r.createdAt,
        primary: r.guestName,
        secondary: `${r.code} · ${t(r.roomType)}`,
        amount: r.amount,
        status: r.status,
        href: `/reservations/${r.id}`,
      })),
      ...requests.map((q) => ({
        kind: 'request' as const,
        date: q.requestedAt,
        primary: q.guestName,
        secondary: `${t('Booking request')} · ${t(q.roomType)}`,
        amount: q.amount,
        status: q.status,
        href: `/booking-requests/${q.id}`,
      })),
    ];
    return events.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
  }, [reservations, requests, t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">
          {t('Welcome back,')} {USER_FIRST_NAME}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {propertyName?.trim() ? <>{t("Here's")} <span className="font-medium text-[var(--text-primary)]">{propertyName}</span> {t("today — arrivals, revenue, and requests waiting on you.")}</> : t("Your day at a glance — arrivals, revenue, and requests waiting on you.")}
        </p>
      </div>

      {/* First-run quick-start launchpad */}
      <QuickStartChecklist />

      {/* Summary cards */}
      <div data-tour="dashboard-kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((card, i) => (
          <motion.button
            key={card.title}
            onClick={() => navigate(card.href)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="text-left bg-white border border-[var(--border-default)] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors">
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-2xl font-medium text-[var(--brand-primary)] tabular-nums">{card.value}</div>
              {card.delta != null && card.delta !== 0 && (
                <DeltaChip delta={card.delta} unit={card.deltaUnit} />
              )}
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-2">{card.subtitle}</div>
          </motion.button>
        ))}
      </div>

      {/* Performance strip — Occupancy, ADR, RevPAR, in-house */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        data-tour="dashboard-performance"
        className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--surface-subtle)] bg-white border border-[var(--border-default)] rounded-md shadow-none mb-8 overflow-hidden"
      >
        {performance.map((m) => (
          <div key={m.title} className="px-5 py-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-md bg-[var(--surface-subtle)] text-[var(--text-tertiary)] flex items-center justify-center shrink-0">
              <m.Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
                {t(m.title)}
                {GLOSSARY[m.title] && <InfoTooltip label={GLOSSARY[m.title]} />}
              </div>
              <div className="text-lg font-medium text-[var(--text-primary)] tabular-nums leading-tight">{m.value}</div>
              <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 tabular-nums truncate">{m.subtitle}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Revenue chart (3/5) + arrivals & departures (2/5) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6 items-stretch">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="lg:col-span-3 bg-white border border-[var(--border-default)] rounded-md p-6 shadow-none"
        >
          <div className="flex justify-between items-start mb-6 gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Revenue')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 mb-3">
                {t('Confirmed bookings by check-in date')} {t(rangeSubtitle)}
              </p>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-medium text-[var(--brand-primary)] tabular-nums">
                  {formatAmount(rangeTotal)}
                </div>
                {rangeTrend !== null && (
                  <div className={cnTrend(rangeTrend)}>
                    {rangeTrend >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Math.abs(rangeTrend).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-2 tabular-nums flex-wrap">
                <span>
                  {rangeBookings} {rangeBookings === 1 ? t('booking') : t('bookings')}
                </span>
                <span className="text-[var(--border-strong)]">·</span>
                <span>
                  {t('Avg')} {formatAmount(rangeAvgPerBucket)}{' '}
                  {bucketUnit === 'day' ? t('/ day') : t('/ week')}
                </span>
                {rangeBookings > 0 && (
                  <>
                    <span className="text-[var(--border-strong)]">·</span>
                    <span>
                      {formatAmount(Math.round(rangeTotal / rangeBookings))} {t('per booking')}
                    </span>
                  </>
                )}
              </div>
            </div>
            <BrandSelect
              value={range}
              onValueChange={(v) => setRange(v as RangeKey)}
              leftIcon={<Calendar />}
              ariaLabel={t('Range')}
              className="sm:w-auto"
              options={[
                { value: '7d', label: t('Last 7 days') },
                { value: '30d', label: t('Last 30 days') },
                { value: 'this_month', label: t('This month') },
                { value: 'last_month', label: t('Last month') },
              ]}
            />
          </div>
          <div className="h-[180px] sm:h-[200px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-subtle)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                  tickFormatter={(v: number) => moneyShort(v)}
                />
                <Tooltip
                  cursor={{ stroke: 'var(--border-default)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={<RevenueTooltip bucketUnit={bucketUnit} t={t} />}
                />
                {rangeAvgPerBucket > 0 && (
                  <ReferenceLine
                    y={rangeAvgPerBucket}
                    stroke="var(--text-muted)"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                    label={{
                      value: `${t('Avg')} ${moneyShort(rangeAvgPerBucket)}`,
                      position: 'right',
                      fill: 'var(--text-secondary)',
                      fontSize: 11,
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--brand-primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Arrivals & departures next 7 days */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="lg:col-span-2 bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Arrivals & departures')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Next 7 days')}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] shrink-0">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--brand-primary)' }} />
                {t('Arrivals')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--brand-accent)' }} />
                {t('Departures')}
              </span>
            </div>
          </div>
          <div className="px-4 sm:px-6 py-5 flex-1 min-h-[220px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flow7} margin={{ top: 6, right: 6, left: -20, bottom: 0 }} barGap={3} barCategoryGap="24%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-subtle)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip cursor={{ fill: 'var(--surface-subtle)' }} content={<FlowTooltip t={t} />} />
                <Bar dataKey="arrivals" fill="var(--brand-primary)" radius={[3, 3, 0, 0]} maxBarSize={14} isAnimationActive={false} />
                <Bar dataKey="departures" fill="var(--brand-accent)" radius={[3, 3, 0, 0]} maxBarSize={14} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Today (action-first) + Revenue by room type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mb-6">
        {/* Today — what needs the manager now */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.28 }}
          className="lg:col-span-2 bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
            <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Today')}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{format(today, 'EEEE, MMM d')} · {t('what needs you')}</p>
          </div>
          <ul className="divide-y divide-[var(--surface-subtle)]">
            {([
              { key: 'arrivals', count: arrivalsToday, Icon: CalendarCheck, title: t('Arrivals to check in'), done: t('No arrivals today'), href: '/reservations', tone: 'brand' as const },
              { key: 'departures', count: departuresToday, Icon: LogOut, title: t('Departures to check out'), done: t('No departures today'), href: '/reservations', tone: 'brand' as const },
              { key: 'requests', count: pendingRequests, Icon: Inbox, title: t('Requests to approve'), done: t('All requests handled'), href: '/booking-requests', tone: 'brand' as const },
              { key: 'overdue', count: overdueCount, Icon: TriangleAlert, title: t('Overdue check-outs'), done: t('Nothing overdue'), href: '/reservations', tone: 'danger' as const },
            ]).map((item) => {
              const active = item.count > 0;
              const danger = active && item.tone === 'danger';
              return (
                <li key={item.key}>
                  <button
                    onClick={() => navigate(item.href)}
                    className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-[var(--surface-muted)] transition-colors cursor-pointer group"
                  >
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        danger
                          ? 'bg-[var(--danger-tint)] text-[var(--danger)]'
                          : active
                            ? 'bg-[var(--brand-tint)] text-[var(--brand-primary)]'
                            : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]'
                      }`}
                    >
                      <item.Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)]">{item.title}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">{active ? t('Tap to review') : item.done}</div>
                    </div>
                    <span
                      className={`text-lg font-medium tabular-nums ${
                        danger ? 'text-[var(--danger)]' : active ? 'text-[var(--brand-primary)]' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {item.count}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        </motion.div>

        {/* Revenue by room type */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Revenue by room type')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Confirmed stays this month')}</p>
            </div>
            <button
              onClick={() => navigate('/hotel/rooms')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer shrink-0"
            >
              {t('Rooms')}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {roomTypeBreakdown.rows.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-[var(--text-secondary)]">
              {t('No confirmed revenue yet.')}
            </div>
          ) : (
            <ul className="px-6 py-5 space-y-3.5">
              {roomTypeBreakdown.rows.map((row, i) => {
                const pct = roomTypeBreakdown.max === 0 ? 0 : (row.revenue / roomTypeBreakdown.max) * 100;
                const color = ROOM_TYPE_BAR_COLORS[i % ROOM_TYPE_BAR_COLORS.length];
                return (
                  <li key={row.roomType}>
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <span className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        {t(row.roomType)}
                      </span>
                      <span className="flex items-center gap-2 text-[var(--text-secondary)] tabular-nums">
                        <span>
                          {row.count} {row.count === 1 ? t('booking') : t('bookings')}
                        </span>
                        <span className="text-[var(--border-strong)]">·</span>
                        <span className="font-medium text-[var(--text-primary)]">{formatAmount(row.revenue)}</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[var(--surface-subtle)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </div>

      {/* Recent activity (full width) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Recent activity')}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Latest reservations and requests')}</p>
          </div>
          <button
            onClick={() => navigate('/reservations')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer shrink-0"
          >
            {t('View all')}
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <ol className="divide-y divide-[var(--surface-subtle)]">
          {activity.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-[var(--text-secondary)]">
              {t('No recent activity.')}
            </li>
          ) : (
            activity.map((ev, i) => {
              const Icon = ev.kind === 'reservation' ? CalendarCheck : CalendarPlus;
              return (
                <li key={`${ev.kind}-${i}`}>
                  <button
                    onClick={() => navigate(ev.href)}
                    className="w-full flex items-center gap-3 px-6 py-3.5 text-left hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[var(--surface-subtle)] text-[var(--text-tertiary)]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {ev.primary}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusPill(ev.status)}`}
                        >
                          {t(ev.status)}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
                        {ev.secondary} · {format(new Date(ev.date), 'MMM d')}
                      </div>
                    </div>
                    <div className="text-sm font-medium tabular-nums shrink-0 text-[var(--text-primary)]">
                      {formatAmount(ev.amount)}
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ol>
      </motion.div>
    </motion.div>
  );
}

// Trend chip classes (up = success, down = danger), shared by the chart header.
function cnTrend(trend: number): string {
  return [
    'text-xs font-medium flex items-center gap-0.5',
    trend >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger-strong)]',
  ].join(' ');
}

/** Small up/down delta pill on the KPI cards. `count` shows ±N, else ±N%. */
function DeltaChip({ delta, unit }: { delta: number; unit?: 'count' | 'percent' }) {
  const up = delta >= 0;
  const text = unit === 'count' ? `${up ? '+' : ''}${delta}` : `${Math.abs(delta).toFixed(1)}%`;
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-medium tabular-nums ${
        up ? 'bg-[var(--success-tint)] text-[var(--success)]' : 'bg-[var(--danger-tint)] text-[var(--danger-strong)]'
      }`}
    >
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {text}
    </span>
  );
}

interface ChartPoint {
  name: string;
  value: number;
  bookings: number;
  date: Date;
}

function RevenueTooltip({
  active,
  payload,
  bucketUnit,
  t,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  bucketUnit: 'day' | 'week';
  t: (key: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  const label =
    bucketUnit === 'day' ? format(p.date, 'EEE, MMM d') : `${p.name} · ${format(p.date, 'MMM d')}`;
  return (
    <div className="bg-[var(--text-primary)] text-white rounded-md px-3 py-2 text-xs shadow-lg">
      <div className="text-[var(--text-muted)] mb-1">{label}</div>
      <div className="font-medium tabular-nums">{formatAmount(p.value)}</div>
      <div className="text-[var(--text-muted)] mt-0.5 tabular-nums">
        {p.bookings} {p.bookings === 1 ? t('booking') : t('bookings')}
      </div>
    </div>
  );
}

function FlowTooltip({
  active,
  payload,
  t,
}: {
  active?: boolean;
  payload?: Array<{ payload: { date: Date; arrivals: number; departures: number } }>;
  t: (key: string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-[var(--text-primary)] text-white rounded-md px-3 py-2 text-xs shadow-lg">
      <div className="text-[var(--text-muted)] mb-1.5">{format(p.date, 'EEE, MMM d')}</div>
      <div className="flex items-center gap-2 tabular-nums">
        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--brand-primary)' }} />
        {p.arrivals} {t('arrivals')}
      </div>
      <div className="flex items-center gap-2 tabular-nums mt-0.5">
        <span className="w-2 h-2 rounded-full" style={{ background: 'var(--brand-accent)' }} />
        {p.departures} {t('departures')}
      </div>
    </div>
  );
}

function buildRevenueChart(
  reservations: Reservation[],
  range: RangeKey,
  today: Date,
): {
  chartData: ChartPoint[];
  rangeTotal: number;
  rangeTrend: number | null;
  rangeSubtitle: string;
  rangeBookings: number;
  rangeAvgPerBucket: number;
  bucketUnit: 'day' | 'week';
} {
  let from: Date;
  let to: Date = today;
  let bucketUnit: 'day' | 'week' = 'day';
  let subtitle = '';

  switch (range) {
    case '7d':
      from = subDays(today, 6);
      bucketUnit = 'day';
      subtitle = 'in the last 7 days';
      break;
    case '30d':
      from = subDays(today, 29);
      bucketUnit = 'week';
      subtitle = 'in the last 30 days';
      break;
    case 'this_month':
      from = startOfMonth(today);
      to = endOfMonth(today);
      bucketUnit = 'week';
      subtitle = 'this month';
      break;
    case 'last_month':
    default:
      from = startOfMonth(subMonths(today, 1));
      to = endOfMonth(subMonths(today, 1));
      bucketUnit = 'week';
      subtitle = 'last month';
      break;
  }

  const revenueRows = reservations.filter((r) => countsAsRevenue(r.status));

  // Build empty buckets across [from, to].
  const chartData: ChartPoint[] = [];
  const lengthDays = differenceInDays(to, from) + 1;
  if (bucketUnit === 'day') {
    for (let i = 0; i < lengthDays; i++) {
      const d = startOfDay(subDays(to, lengthDays - 1 - i));
      chartData.push({ name: format(d, 'EEE'), value: 0, bookings: 0, date: d });
    }
  } else {
    const weeks = Math.ceil(lengthDays / 7);
    for (let i = 0; i < weeks; i++) {
      const start = startOfDay(subDays(to, (weeks - i) * 7 - 1));
      chartData.push({ name: `Wk ${i + 1}`, value: 0, bookings: 0, date: start });
    }
  }

  // Assign each reservation's revenue to its bucket by check-in date.
  const assign = (checkIn: Date): number => {
    const day = startOfDay(checkIn);
    const offset = differenceInDays(day, startOfDay(from));
    if (offset < 0 || offset >= lengthDays) return -1;
    return bucketUnit === 'day' ? offset : Math.min(chartData.length - 1, Math.floor(offset / 7));
  };

  revenueRows.forEach((r) => {
    const checkIn = new Date(r.checkIn);
    if (!isWithinInterval(startOfDay(checkIn), { start: startOfDay(from), end: startOfDay(to) })) return;
    const idx = assign(checkIn);
    if (idx < 0) return;
    chartData[idx].value += r.amount;
    chartData[idx].bookings += 1;
  });

  const rangeTotal = chartData.reduce((sum, p) => sum + p.value, 0);
  const rangeBookings = chartData.reduce((sum, p) => sum + p.bookings, 0);

  // Trend vs the immediately preceding period of equal length (real data).
  const prevTo = subDays(from, 1);
  const prevFrom = subDays(prevTo, lengthDays - 1);
  const prevTotal = revenueRows
    .filter((r) =>
      isWithinInterval(startOfDay(new Date(r.checkIn)), {
        start: startOfDay(prevFrom),
        end: startOfDay(prevTo),
      }),
    )
    .reduce((sum, r) => sum + r.amount, 0);
  const rangeTrend = prevTotal === 0 ? null : ((rangeTotal - prevTotal) / prevTotal) * 100;

  const rangeAvgPerBucket = chartData.length === 0 ? 0 : Math.round(rangeTotal / chartData.length);

  return {
    chartData,
    rangeTotal,
    rangeTrend,
    rangeSubtitle: subtitle,
    rangeBookings,
    rangeAvgPerBucket,
    bucketUnit,
  };
}
