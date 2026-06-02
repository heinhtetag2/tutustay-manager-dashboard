import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, isSameMonth, isSameDay, format,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, CalendarDays, CreditCard, CloudMoon, CalendarCheck,
  X, ChevronRight as ArrowR, Users, ArrowRight, Search, ListFilter,
} from 'lucide-react';

import { SideSheet } from '@/shared/ui/side-sheet';
import { useDateFormat } from '@/shared/hooks/useDateFormat';
import { formatAmount, countsAsRevenue, type Reservation, type ReservationStatus } from '@/pages/reservations/reservations-data';
import { useReservations } from '@/pages/reservations/use-reservations';

const TODAY = new Date('2026-06-01T00:00:00');
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dotColor(status: ReservationStatus): string {
  switch (status) {
    case 'Confirmed': return 'bg-[var(--brand-primary)]';
    case 'Checked-in': return 'bg-[var(--success)]';
    case 'Checked-out': return 'bg-[var(--text-muted)]';
    case 'Cancelled': return 'bg-[var(--danger)]';
    case 'No-show': return 'bg-[var(--warning-strong)]';
  }
}
function statusChipStyle(status: ReservationStatus): string {
  switch (status) {
    case 'Confirmed': return 'bg-[var(--brand-tint)] text-[var(--brand-primary)]';
    case 'Checked-in': return 'bg-[var(--success-tint)] text-[var(--success)]';
    case 'Checked-out': return 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
    case 'Cancelled': return 'bg-[var(--danger-tint)] text-[var(--danger)]';
    case 'No-show': return 'bg-[var(--warning-tint)] text-[var(--warning-strong)]';
  }
}
/** Compact money, e.g. 160000 → "160k". */
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}m`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export default function SalesCalendar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reservations = useReservations((s) => s.reservations);
  const { formatDate } = useDateFormat();

  const [month, setMonth] = useState(() => startOfMonth(TODAY));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  // Day-panel filters (reset whenever a new day is opened).
  const [daySearch, setDaySearch] = useState('');
  const [dayStatusFilter, setDayStatusFilter] = useState<ReservationStatus | null>(null);

  const openDay = (day: Date) => {
    setSelectedDay(day);
    setDaySearch('');
    setDayStatusFilter(null);
  };

  // Bookings keyed by their check-in day.
  const byDay = useMemo(() => {
    const m = new Map<string, Reservation[]>();
    reservations.forEach((r) => {
      const key = r.checkIn.slice(0, 10);
      const arr = m.get(key);
      if (arr) arr.push(r);
      else m.set(key, [r]);
    });
    return m;
  }, [reservations]);

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  // KPIs for the visible month (by check-in date).
  const monthBookings = reservations.filter((r) => isSameMonth(new Date(r.checkIn), month));
  const counts = {
    bookings: monthBookings.length,
    revenue: monthBookings.filter((r) => countsAsRevenue(r.status)).reduce((n, r) => n + r.amount, 0),
    nights: monthBookings.filter((r) => countsAsRevenue(r.status)).reduce((n, r) => n + r.nights, 0),
    arrivals: monthBookings.filter((r) => r.status === 'Confirmed' || r.status === 'Checked-in').length,
  };

  const stats = [
    { title: 'Bookings', Icon: CalendarCheck, value: String(counts.bookings), subtitle: t('This month') },
    { title: 'Revenue', Icon: CreditCard, value: formatAmount(counts.revenue), subtitle: t('Excludes cancellations') },
    { title: 'Room-nights', Icon: CloudMoon, value: String(counts.nights), subtitle: t('Sold this month') },
    { title: 'Arrivals', Icon: CalendarDays, value: String(counts.arrivals), subtitle: t('Confirmed & in-house') },
  ];

  const dayList = selectedDay ? (byDay.get(format(selectedDay, 'yyyy-MM-dd')) ?? []) : [];
  const dayTotal = dayList.filter((r) => countsAsRevenue(r.status)).reduce((n, r) => n + r.amount, 0);
  const dayNights = dayList.filter((r) => countsAsRevenue(r.status)).reduce((n, r) => n + r.nights, 0);
  const dayGuests = dayList.reduce((n, r) => n + r.guests, 0);
  // Per-status counts for the selected day (only statuses present are shown).
  const dayStatusCounts = (['Confirmed', 'Checked-in', 'Checked-out', 'Cancelled', 'No-show'] as ReservationStatus[])
    .map((s) => ({ status: s, count: dayList.filter((r) => r.status === s).length }))
    .filter((x) => x.count > 0);

  // Apply the day-panel search + status filter to the booking list.
  const dayQuery = daySearch.trim().toLowerCase();
  const filteredDayList = dayList.filter((r) => {
    if (dayStatusFilter && r.status !== dayStatusFilter) return false;
    if (dayQuery && !`${r.guestName} ${t(r.roomType)} ${r.roomNo} ${r.code} ${r.guestEmail}`.toLowerCase().includes(dayQuery)) return false;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Sales Calendar')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('A visual month-by-month view of all bookings and revenue.')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonth((m) => addMonths(m, -1))} className="w-9 h-9 inline-flex items-center justify-center border border-[var(--border-default)] rounded-md bg-white text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer" aria-label={t('Previous month')}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-[140px] text-center text-sm font-medium text-[var(--text-primary)] tabular-nums">{format(month, 'MMMM yyyy')}</div>
          <button onClick={() => setMonth((m) => addMonths(m, 1))} className="w-9 h-9 inline-flex items-center justify-center border border-[var(--border-default)] rounded-md bg-white text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer" aria-label={t('Next month')}>
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setMonth(startOfMonth(TODAY))} className="ml-1 px-3 h-9 inline-flex items-center text-sm font-medium border border-[var(--border-default)] rounded-md bg-white text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
            {t('Today')}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((card) => (
          <div key={card.title} className="bg-white border border-[var(--border-default)] rounded-md p-5 shadow-none">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)]"><card.Icon className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-medium text-[var(--text-primary)] tabular-nums">{card.value}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-2">{card.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white border border-[var(--border-default)] rounded-md overflow-hidden shadow-none">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-[var(--border-default)]">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] text-center sm:text-left">{t(d)}</div>
          ))}
        </div>
        {/* Day grid */}
        <div className="grid grid-cols-7">
          {gridDays.map((day, idx) => {
            const key = format(day, 'yyyy-MM-dd');
            const list = byDay.get(key) ?? [];
            const inMonth = isSameMonth(day, month);
            const today = isSameDay(day, TODAY);
            const rev = list.filter((r) => countsAsRevenue(r.status)).reduce((n, r) => n + r.amount, 0);
            return (
              <button
                key={key}
                onClick={() => list.length > 0 && openDay(day)}
                className={`group/cell relative min-h-[122px] border-[var(--border-default)] p-2 text-left align-top transition-colors ${idx % 7 === 6 ? '' : 'border-r'} ${idx >= gridDays.length - 7 ? '' : 'border-b'} ${
                  !inMonth ? 'bg-[var(--surface-subtle)]/40' : today ? 'bg-[var(--brand-tint)]/25' : 'bg-white'
                } ${list.length > 0 ? 'hover:bg-[var(--surface-subtle)]/60 cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`inline-flex items-center justify-center min-w-6 h-6 px-1.5 text-xs tabular-nums rounded-full transition-colors ${
                    today ? 'bg-[var(--brand-primary)] text-white font-semibold' : inMonth ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'
                  }`}>{format(day, 'd')}</span>
                  {rev > 0 && (
                    <span className="text-[10px] font-semibold text-[var(--brand-primary)] tabular-nums bg-[var(--brand-tint)]/60 px-1.5 py-0.5 rounded-full">
                      {compact(rev)}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {list.slice(0, 3).map((r) => (
                    <div
                      key={r.id}
                      onClick={(e) => { e.stopPropagation(); navigate(`/reservations/${r.id}`); }}
                      className={`flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-md cursor-pointer transition-shadow hover:ring-1 hover:ring-inset hover:ring-[var(--border-strong)] ${statusChipStyle(r.status)}`}
                      title={`${r.guestName} · ${t(r.roomType)} · ${t(r.status)}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(r.status)}`} />
                      <span className="text-[11px] font-medium truncate leading-tight">{r.guestName}</span>
                    </div>
                  ))}
                  {list.length > 3 && (
                    <div className="text-[10px] font-medium text-[var(--text-secondary)] px-1.5 pt-0.5">+{list.length - 3} {t('more')}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 px-1">
        {(['Confirmed', 'Checked-in', 'Checked-out', 'Cancelled', 'No-show'] as ReservationStatus[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span className={`w-2 h-2 rounded-full ${dotColor(s)}`} />
            {t(s)}
          </span>
        ))}
      </div>

      {/* Day detail sheet */}
      <AnimatePresence>
        {selectedDay && (
          <SideSheet onClose={() => setSelectedDay(null)} widthClass="max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)] shrink-0">
              <div>
                <h2 className="text-base font-medium text-[var(--text-primary)]">{formatDate(selectedDay)}</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{dayList.length} {dayList.length === 1 ? t('booking') : t('bookings')} · {formatAmount(dayTotal)}</p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Day summary */}
              {dayList.length > 0 && (
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { Icon: CreditCard, label: t('Revenue'), value: formatAmount(dayTotal) },
                      { Icon: CloudMoon, label: t('Room-nights'), value: String(dayNights) },
                      { Icon: Users, label: t('Guests'), value: String(dayGuests) },
                    ].map((tile) => (
                      <div key={tile.label} className="rounded-md border border-[var(--border-default)] bg-[var(--surface-subtle)]/40 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                          <tile.Icon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-medium uppercase tracking-wide">{tile.label}</span>
                        </div>
                        <div className="mt-1 text-base font-medium text-[var(--text-primary)] tabular-nums">{tile.value}</div>
                      </div>
                    ))}
                  </div>
                  {/* Status breakdown — click a status to filter the list below */}
                  <div className="flex items-center gap-1.5 mt-5 mb-2 text-[10px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                    <ListFilter className="w-3 h-3" />
                    {t('Filter by status')}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {dayStatusCounts.map(({ status, count }) => {
                      const active = dayStatusFilter === status;
                      return (
                        <button
                          key={status}
                          onClick={() => setDayStatusFilter(active ? null : status)}
                          title={active ? t('Clear filter') : `${t('Show only')} ${t(status)}`}
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition-colors cursor-pointer ${
                            active
                              ? 'border-[var(--brand-border)] bg-[var(--brand-tint)]/50 text-[var(--text-primary)] font-medium'
                              : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:border-[var(--brand-border)]'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${dotColor(status)}`} />
                          {t(status)}
                          <span className="text-[var(--text-tertiary)] tabular-nums">{count}</span>
                        </button>
                      );
                    })}
                    {(dayStatusFilter || daySearch) && (
                      <button
                        onClick={() => { setDayStatusFilter(null); setDaySearch(''); }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        {t('Clear')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Bookings */}
              <div className="space-y-2">
                {dayList.length > 5 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      value={daySearch}
                      onChange={(e) => setDaySearch(e.target.value)}
                      placeholder={t('Search by guest, room or code')}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
                    />
                  </div>
                )}
                {filteredDayList.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[var(--text-secondary)]">{t('No bookings match your filters.')}</div>
                ) : (
                  filteredDayList.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedDay(null); navigate(`/reservations/${r.id}`); }}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-md border border-[var(--border-default)] hover:border-[var(--brand-border)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">{r.guestName.trim().charAt(0).toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-[var(--text-primary)] truncate">{r.guestName}</span>
                        <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums shrink-0">{formatAmount(r.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-xs text-[var(--text-secondary)] truncate">{t(r.roomType)} · {t('Room')} {r.roomNo}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0 ${statusChipStyle(r.status)}`}>{t(r.status)}</span>
                      </div>
                      {/* Stay dates + meta */}
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2 pt-2 border-t border-[var(--border-default)] text-[11px] text-[var(--text-tertiary)]">
                        <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
                          <span>{format(new Date(r.checkIn), 'MMM d')}</span>
                          <span className="text-[var(--text-muted)]">{format(new Date(r.checkIn), 'h:mm a')}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span>{format(new Date(r.checkOut), 'MMM d')}</span>
                          <span className="text-[var(--text-muted)]">{format(new Date(r.checkOut), 'h:mm a')}</span>
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1"><CloudMoon className="w-3 h-3" />{r.nights} {r.nights === 1 ? t('night') : t('nights')}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{r.guests}</span>
                        <span>·</span>
                        <span className="font-mono">{r.code}</span>
                      </div>
                    </div>
                    <ArrowR className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors shrink-0 self-center" />
                  </button>
                  ))
                )}
              </div>
            </div>
          </SideSheet>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
