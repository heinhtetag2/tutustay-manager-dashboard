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
} from 'lucide-react';

import { countsAsRevenue, formatAmount, type Reservation, type ReservationStatus } from '@/pages/reservations/reservations-data';
import { useReservations } from '@/pages/reservations/use-reservations';
import { SalesDayDetailSheet, dotColor, statusChipStyle } from './SalesDayDetailSheet';

const TODAY = new Date('2026-06-01T00:00:00');
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  const [month, setMonth] = useState(() => startOfMonth(TODAY));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const openDay = (day: Date) => setSelectedDay(day);

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

  // Mobile agenda: only days within the month that actually have bookings.
  const agendaDays = useMemo(() => {
    return eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
      .filter((d) => (byDay.get(format(d, 'yyyy-MM-dd')) ?? []).length > 0);
  }, [month, byDay]);

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

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Sales Calendar')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('A month-by-month view of your bookings and revenue, day by day.')}</p>
        </div>
        <div className="flex items-center gap-2 justify-between sm:justify-normal sticky top-0 z-20 -mx-6 px-6 py-3 bg-[var(--surface-muted)]/90 backdrop-blur border-b border-[var(--border-default)] sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-none">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
        {stats.map((card) => (
          <div key={card.title} className="bg-white border border-[var(--border-default)] rounded-md p-3 sm:p-5 shadow-none">
            <div className="flex justify-between items-start mb-1.5 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)]"><card.Icon className="w-4 h-4" /></div>
            </div>
            <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)] tabular-nums">{card.value}</div>
            <div className="text-[11px] sm:text-xs text-[var(--text-tertiary)] mt-1 sm:mt-2 truncate">{card.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white border border-[var(--border-default)] rounded-md overflow-hidden shadow-none">
        {/* Weekday header */}
        <div className="hidden sm:grid grid-cols-7 border-b border-[var(--border-default)]">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] text-center sm:text-left">{t(d)}</div>
          ))}
        </div>
        {/* Day grid */}
        <div className="hidden sm:grid grid-cols-7">
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

        {/* Mobile agenda: days with bookings, listed (replaces the cramped grid on phones) */}
        <div className="sm:hidden divide-y divide-[var(--border-default)]">
          {agendaDays.length === 0 ? (
            <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
              <CalendarDays className="w-7 h-7 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-[var(--text-primary)]">{t('No bookings this month')}</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{t('Bookings will appear here as they come in.')}</p>
            </div>
          ) : (
            agendaDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const list = byDay.get(key) ?? [];
              const today = isSameDay(day, TODAY);
              const rev = list.filter((r) => countsAsRevenue(r.status)).reduce((n, r) => n + r.amount, 0);
              return (
                <div key={key} className="px-4 py-4">
                  <button onClick={() => openDay(day)} className="flex items-center justify-between w-full gap-3 mb-3 text-left cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`inline-flex items-center justify-center w-9 h-9 text-sm tabular-nums rounded-md shrink-0 ${
                        today ? 'bg-[var(--brand-primary)] text-white font-semibold' : 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-medium'
                      }`}>{format(day, 'd')}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)]">{format(day, 'EEEE')}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">{list.length} {t(list.length === 1 ? 'booking' : 'bookings')}</div>
                      </div>
                    </div>
                    {rev > 0 && (
                      <span className="text-xs font-semibold text-[var(--brand-primary)] tabular-nums bg-[var(--brand-tint)]/60 px-2 py-1 rounded-full shrink-0">
                        {compact(rev)}
                      </span>
                    )}
                  </button>
                  <div className="space-y-1.5">
                    {list.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => navigate(`/reservations/${r.id}`)}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-left transition-shadow hover:ring-1 hover:ring-inset hover:ring-[var(--border-strong)] ${statusChipStyle(r.status)}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(r.status)}`} />
                        <span className="text-sm font-medium truncate flex-1">{r.guestName}</span>
                        <span className="text-xs text-[var(--text-tertiary)] truncate shrink-0 max-w-[40%]">{t(r.roomType)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
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
          <SalesDayDetailSheet
            key={format(selectedDay, 'yyyy-MM-dd')}
            day={selectedDay}
            bookings={dayList}
            onClose={() => setSelectedDay(null)}
            onOpenReservation={(id) => navigate(`/reservations/${id}`)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
