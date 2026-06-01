import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, isSameMonth, isSameDay, format,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, CalendarDays, CreditCard, Moon, CalendarCheck,
  X, ChevronRight as ArrowR,
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
    { title: 'Room-nights', Icon: Moon, value: String(counts.nights), subtitle: t('Sold this month') },
    { title: 'Arrivals', Icon: CalendarDays, value: String(counts.arrivals), subtitle: t('Confirmed & in-house') },
  ];

  const dayList = selectedDay ? (byDay.get(format(selectedDay, 'yyyy-MM-dd')) ?? []) : [];
  const dayTotal = dayList.filter((r) => countsAsRevenue(r.status)).reduce((n, r) => n + r.amount, 0);

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
                onClick={() => list.length > 0 && setSelectedDay(day)}
                className={`group/cell relative min-h-[122px] border-b border-r border-[var(--border-default)] p-2 text-left align-top transition-colors ${idx % 7 === 0 ? 'border-l' : ''} ${
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
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {dayList.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelectedDay(null); navigate(`/reservations/${r.id}`); }}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-md border border-[var(--border-default)] hover:border-[var(--brand-border)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">{r.guestName.trim().charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-[var(--text-primary)] truncate">{r.guestName}</span>
                      <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums shrink-0">{formatAmount(r.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--text-secondary)] truncate">{t(r.roomType)} · {t('Room')} {r.roomNo} · {r.nights} {r.nights === 1 ? t('night') : t('nights')}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0 ${statusChipStyle(r.status)}`}>{t(r.status)}</span>
                  <ArrowR className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </SideSheet>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
