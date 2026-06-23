import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, isSameMonth, isSameDay, format,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, ChevronDown, CalendarDays, CreditCard, CloudMoon, CalendarCheck,
} from 'lucide-react';

import { countsAsRevenue, formatAmount, type Reservation, type ReservationStatus } from '@/pages/reservations/reservations-data';
import { STAT_TONE } from '@/shared/ui/stat-tone';
import { InfoTooltip } from '@/shared/ui/info-tooltip';
import { GLOSSARY } from '@/widgets/onboarding/glossary';
import { useReservations } from '@/pages/reservations/use-reservations';
import { SalesDayDetailSheet, dotColor, statusChipStyle } from './SalesDayDetailSheet';

const TODAY = new Date('2026-06-01T00:00:00');
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** Max booking rows shown inline per day in the mobile agenda before collapsing into "+N more". */
const AGENDA_PREVIEW = 4;

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
  // Month/year jump picker — the year being browsed is independent of the
  // calendar until a month is chosen. The popover has two modes: a month grid
  // and a year grid (for jumping across years quickly).
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<'month' | 'year'>('month');
  const [pickerYear, setPickerYear] = useState(() => TODAY.getFullYear());
  const [yearViewStart, setYearViewStart] = useState(() => TODAY.getFullYear() - 6);

  const openDay = (day: Date) => setSelectedDay(day);

  const openPicker = () => { setPickerYear(month.getFullYear()); setPickerMode('month'); setPickerOpen(true); };
  const pickMonth = (mi: number) => { setMonth(startOfMonth(new Date(pickerYear, mi, 1))); setPickerOpen(false); };
  const openYearMode = () => { setYearViewStart(pickerYear - 6); setPickerMode('year'); };
  const pickYear = (y: number) => { setPickerYear(y); setPickerMode('month'); };

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
    { title: 'Bookings', Icon: CalendarCheck, value: String(counts.bookings), subtitle: t('This month'), tone: 'brand' as const },
    { title: 'Revenue', Icon: CreditCard, value: formatAmount(counts.revenue), subtitle: t('Excludes cancellations'), tone: 'success' as const },
    { title: 'Room-nights', Icon: CloudMoon, value: String(counts.nights), subtitle: t('Sold this month'), tone: 'purple' as const },
    { title: 'Arrivals', Icon: CalendarDays, value: String(counts.arrivals), subtitle: t('Confirmed & in-house'), tone: 'info' as const },
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
          <div className="relative">
            <button
              onClick={() => (pickerOpen ? setPickerOpen(false) : openPicker())}
              aria-haspopup="dialog"
              aria-expanded={pickerOpen}
              className="min-w-[150px] h-9 px-3 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--text-primary)] tabular-nums rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
            >
              {format(month, 'MMMM yyyy')}
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform ${pickerOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {pickerOpen && (
                <>
                  {/* Click-away backdrop */}
                  <div className="fixed inset-0 z-30" onClick={() => setPickerOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    role="dialog"
                    aria-label={t('Jump to month')}
                    className="absolute z-40 top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white border border-[var(--border-default)] rounded-md shadow-[0_8px_28px_rgba(44,38,39,0.16)] p-3"
                  >
                    {/* Stepper — steps the year (month mode) or the 12-year block (year mode).
                        The center label toggles into / out of the year grid. */}
                    <div className="flex items-center justify-between mb-2.5">
                      <button
                        onClick={() => (pickerMode === 'month' ? setPickerYear((y) => y - 1) : setYearViewStart((s) => s - 12))}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        aria-label={pickerMode === 'month' ? t('Previous year') : t('Previous years')}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => (pickerMode === 'month' ? openYearMode() : setPickerMode('month'))}
                        className="px-2 h-7 inline-flex items-center rounded-md text-sm font-semibold text-[var(--text-primary)] tabular-nums hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                      >
                        {pickerMode === 'month' ? pickerYear : `${yearViewStart} – ${yearViewStart + 11}`}
                      </button>
                      <button
                        onClick={() => (pickerMode === 'month' ? setPickerYear((y) => y + 1) : setYearViewStart((s) => s + 12))}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        aria-label={pickerMode === 'month' ? t('Next year') : t('Next years')}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {pickerMode === 'month' ? (
                      /* Month grid */
                      <div className="grid grid-cols-3 gap-1.5">
                        {Array.from({ length: 12 }).map((_, mi) => {
                          const isCurrent = month.getFullYear() === pickerYear && month.getMonth() === mi;
                          const isToday = TODAY.getFullYear() === pickerYear && TODAY.getMonth() === mi;
                          return (
                            <button
                              key={mi}
                              onClick={() => pickMonth(mi)}
                              className={`h-9 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                                isCurrent
                                  ? 'bg-[var(--brand-primary)] text-white'
                                  : isToday
                                    ? 'bg-[var(--brand-tint)] text-[var(--brand-primary)] hover:bg-[var(--brand-tint)]/70'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {format(new Date(2000, mi, 1), 'MMM')}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Year grid */
                      <div className="grid grid-cols-3 gap-1.5">
                        {Array.from({ length: 12 }).map((_, i) => {
                          const y = yearViewStart + i;
                          const isCurrent = month.getFullYear() === y;
                          const isToday = TODAY.getFullYear() === y;
                          return (
                            <button
                              key={y}
                              onClick={() => pickYear(y)}
                              className={`h-9 rounded-md text-sm font-medium tabular-nums transition-colors cursor-pointer ${
                                isCurrent
                                  ? 'bg-[var(--brand-primary)] text-white'
                                  : isToday
                                    ? 'bg-[var(--brand-tint)] text-[var(--brand-primary)] hover:bg-[var(--brand-tint)]/70'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {y}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
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
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                {t(card.title)}
                {GLOSSARY[card.title] && <InfoTooltip label={GLOSSARY[card.title]} />}
              </span>
              <div className={`p-2 rounded-md ${STAT_TONE[card.tone]}`}><card.Icon className="w-4 h-4" /></div>
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
                    {list.slice(0, AGENDA_PREVIEW).map((r) => (
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
                    {list.length > AGENDA_PREVIEW && (
                      <button
                        onClick={() => openDay(day)}
                        className="flex items-center justify-center gap-1 w-full px-3 py-2 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                      >
                        {t('+{{count}} more', { count: list.length - AGENDA_PREVIEW })}
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    )}
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
