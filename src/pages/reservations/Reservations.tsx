import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { isAfter, isBefore, subDays, addDays, addMonths, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  Search,
  CalendarCheck,
  BedSingle,
  TriangleAlert,
  CreditCard,
  ListFilter,
  Calendar as CalendarIcon,
  CalendarClock,
  Check,
  CalendarSearch,
  X,
  CloudMoon,
} from 'lucide-react';

import { BrandSelect } from '@/shared/ui/brand-select';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import { useDateFormat } from '@/shared/hooks/useDateFormat';
import { useResizableColumns, ColResizeHandle, ColLeftDivider, type ColumnDef } from '@/shared/ui/resizable-columns';
import { formatAmount, countsAsRevenue, rateLabel, RESERVATION_STATUSES, type Reservation, type ReservationStatus, type RateType } from './reservations-data';
import { useReservations } from './use-reservations';
import { InfoTooltip } from '@/shared/ui/info-tooltip';
import { GLOSSARY } from '@/widgets/onboarding/glossary';

type StatusFilter = 'All' | ReservationStatus | 'Overdue';
type NightsFilter = 'All' | 'day-use' | '1' | '2-3' | '4+';

const COL_DEFS: ColumnDef[] = [
  { key: 'no', w: 60, min: 52 },
  { key: 'guest', w: 280, min: 220 },
  { key: 'room', w: 160, min: 120 },
  { key: 'stay', w: 240, min: 190 },
  { key: 'nights', w: 90, min: 72 },
  { key: 'amount', w: 150, min: 120 },
  { key: 'status', w: 150, min: 120 },
];

/** "Today" for the demo (matches the app's current date). */
const TODAY = new Date('2026-06-01T00:00:00');

/**
 * Overdue = a reservation whose check-out date has already passed but it was
 * never closed out (still Confirmed or Checked-in). These need staff action —
 * either the guest overstayed (still Checked-in past checkout) or an arrival
 * that was confirmed but never completed.
 */
function isOverdue(checkOut: string, status: ReservationStatus): boolean {
  if (status !== 'Confirmed' && status !== 'Checked-in') return false;
  return new Date(checkOut) < TODAY;
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

type DisplayStatus = ReservationStatus | 'Overdue';

/** The status shown in the UI: 'Overdue' overrides the stored status when due. */
function displayStatus(checkOut: string, status: ReservationStatus): DisplayStatus {
  return isOverdue(checkOut, status) ? 'Overdue' : status;
}

/** Chip styling for non-Regular booking types (Day use / Weekend). */
function rateChipStyle(rate: RateType): string {
  switch (rate) {
    case 'Session': return 'bg-[var(--brand-tint)] text-[var(--brand-primary)]';
    case 'Weekend': return 'bg-[var(--accent-violet-tint)] text-[var(--accent-violet-deep)]';
    default: return 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
  }
}

function statusStyle(status: DisplayStatus): string {
  switch (status) {
    case 'Confirmed': return 'bg-[var(--brand-tint)] text-[var(--brand-primary)]';
    case 'Checked-in': return 'bg-[var(--success-tint)] text-[var(--success)]';
    case 'Checked-out': return 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
    case 'Cancelled': return 'bg-[var(--danger-tint)] text-[var(--danger)]';
    case 'No-show': return 'bg-[var(--warning-tint)] text-[var(--warning-strong)]';
    case 'Overdue': return 'bg-[var(--danger-tint)] text-[var(--danger)]';
  }
}

export default function Reservations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reservations = useReservations((s) => s.reservations);
  const { formatDate, formatDateTime } = useDateFormat();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [roomTypeFilter, setRoomTypeFilter] = useState('All');
  const [nightsFilter, setNightsFilter] = useState<NightsFilter>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('Custom date range');
  const [page, setPage] = useState(1);

  const roomTypeOptions = [
    { value: 'All', label: t('All types') },
    ...Array.from(new Set(reservations.map((r) => r.roomType))).sort().map((rt) => ({ value: rt, label: t(rt) })),
  ];
  const { widths: colWidths, onResizeStart } = useResizableColumns(COL_DEFS);

  const counts = {
    total: reservations.length,
    overdue: reservations.filter((r) => isOverdue(r.checkOut, r.status)).length,
    upcoming: reservations.filter((r) => r.status === 'Confirmed').length,
    revenue: reservations.filter((r) => countsAsRevenue(r.status)).reduce((n, r) => n + r.amount, 0),
  };

  const hasActiveFilters = search !== '' || statusFilter !== 'All' || roomTypeFilter !== 'All' || nightsFilter !== 'All' || !!dateRange?.from;
  const clearFilters = () => { setSearch(''); setStatusFilter('All'); setRoomTypeFilter('All'); setNightsFilter('All'); setDateRange(undefined); };

  const dateLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'MMM d, yyyy')} – ${format(dateRange.to, 'MMM d, yyyy')}`
      : format(dateRange.from, 'MMM d, yyyy')
    : t('Check-in date');

  const query = search.trim().toLowerCase();
  const visible = reservations
    .filter((r) => {
      if (statusFilter !== 'All' && displayStatus(r.checkOut, r.status) !== statusFilter) return false;
      if (roomTypeFilter !== 'All' && r.roomType !== roomTypeFilter) return false;
      if (nightsFilter === 'day-use' && r.rateType !== 'Session') return false;
      if (nightsFilter === '1' && (r.rateType === 'Session' || r.nights !== 1)) return false;
      if (nightsFilter === '2-3' && (r.nights < 2 || r.nights > 3)) return false;
      if (nightsFilter === '4+' && r.nights < 4) return false;
      if (dateRange?.from) {
        const ci = new Date(r.checkIn);
        if (isBefore(ci, dateRange.from)) return false;
        if (dateRange.to && isAfter(ci, dateRange.to)) return false;
      }
      if (query && !`${r.guestName} ${r.code} ${r.roomType} ${r.roomNo} ${r.guestEmail}`.toLowerCase().includes(query)) return false;
      return true;
    })
    .sort((a, b) => {
      return b.createdAt.localeCompare(a.createdAt);
    });

  // Pagination
  const PAGE_SIZE = 10;
  useEffect(() => setPage(1), [search, statusFilter, roomTypeFilter, nightsFilter, dateRange]);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = visible.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, visible.length);

  const stats = [
    { title: 'Total reservations', Icon: CalendarCheck, value: String(counts.total), subtitle: t('All statuses') },
    { title: 'Overdue', Icon: TriangleAlert, value: String(counts.overdue), subtitle: t('Past checkout, not closed') },
    { title: 'Upcoming', Icon: BedSingle, value: String(counts.upcoming), subtitle: t('Confirmed arrivals') },
    { title: 'Revenue', Icon: CreditCard, value: formatAmount(counts.revenue), subtitle: t('Excludes cancellations') },
  ];

  const colLabel: Record<string, string> = {
    no: t('No.'), guest: t('Guest'), room: t('Room'), stay: t('Stay'),
    nights: t('Duration'), amount: t('Amount'), status: t('Status'),
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Reservation Management')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{t('Stay on top of every arrival, in-house stay, and checkout as it happens.')}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} className="bg-white border border-[var(--border-default)] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <span className="flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)]">
                {t(card.title)}
                {GLOSSARY[card.title] && <InfoTooltip label={GLOSSARY[card.title]} />}
              </span>
              <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors">
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-medium text-[var(--text-primary)] tabular-nums">{card.value}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-2">{card.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search by guest, code or room')} className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]" />
        </div>
        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <BrandSelect value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} leftIcon={<ListFilter />} className="sm:w-auto" options={[{ value: 'All', label: t('All statuses') }, ...RESERVATION_STATUSES.map((s) => ({ value: s, label: t(s) })), { value: 'Overdue', label: t('Overdue') }]} />
          <BrandSelect value={roomTypeFilter} onValueChange={setRoomTypeFilter} leftIcon={<BedSingle />} className="sm:w-auto" options={roomTypeOptions} />
          <BrandSelect value={nightsFilter} onValueChange={(v) => setNightsFilter(v as NightsFilter)} leftIcon={<CloudMoon />} className="sm:w-auto" options={[{ value: 'All', label: t('Any duration') }, { value: 'day-use', label: t('Day use') }, { value: '1', label: t('1 night') }, { value: '2-3', label: t('2–3 nights') }, { value: '4+', label: t('4+ nights') }]} />

          {/* Check-in date range filter */}
          <div className="relative">
            <button onClick={() => setIsDateOpen((v) => !v)} className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors shadow-none cursor-pointer ${dateRange?.from ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-tint)]' : 'border-[var(--border-default)] text-[var(--text-tertiary)] bg-white hover:bg-[var(--surface-subtle)]'}`}>
              <CalendarIcon className="w-4 h-4" />
              {dateLabel}
            </button>
            {isDateOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDateOpen(false)} />
                <div className="absolute top-full right-0 mt-2 bg-white border border-[var(--border-default)] rounded-md z-20 flex shadow-[0_4px_16px_rgba(44,38,39,0.08)]">
                  <div className="w-52 border-r border-[var(--border-default)] p-2 flex flex-col gap-1">
                    {['Next 7 days', 'Next 30 days', 'Next 90 days', 'Past 30 days', 'Custom date range'].map((preset) => (
                      <button key={preset} onClick={() => {
                          setSelectedPreset(preset);
                          if (preset === 'Next 7 days') setDateRange({ from: new Date(), to: addDays(new Date(), 7) });
                          else if (preset === 'Next 30 days') setDateRange({ from: new Date(), to: addDays(new Date(), 30) });
                          else if (preset === 'Next 90 days') setDateRange({ from: new Date(), to: addMonths(new Date(), 3) });
                          else if (preset === 'Past 30 days') setDateRange({ from: subDays(new Date(), 30), to: new Date() });
                        }}
                        className={`flex items-center justify-between gap-2 w-full px-3 py-2 text-sm whitespace-nowrap rounded-md transition-colors shadow-none cursor-pointer ${selectedPreset === preset ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-medium' : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)]'}`}>
                        {t(preset)}
                        {selectedPreset === preset && <Check className="w-4 h-4 text-[var(--brand-primary)]" />}
                      </button>
                    ))}
                  </div>
                  <div className="p-4" style={{ '--primary': 'var(--brand-primary)', '--primary-foreground': '#FFFFFF' } as React.CSSProperties}>
                    <CalendarUI mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={(range) => { setDateRange(range); setSelectedPreset('Custom date range'); }} numberOfMonths={2} className="border-0 shadow-none p-0" />
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[var(--surface-subtle)]">
                      <button onClick={() => { setDateRange(undefined); setSelectedPreset('Custom date range'); setIsDateOpen(false); }} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors shadow-none cursor-pointer">{t('Clear')}</button>
                      <button onClick={() => setIsDateOpen(false)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors shadow-none cursor-pointer"><Check className="w-4 h-4" />{t('Apply')}</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center justify-center w-9 h-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-full transition-colors border border-transparent hover:border-[var(--border-default)] shadow-none cursor-pointer flex-shrink-0" title={t('Clear filters')}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="text-left text-sm whitespace-nowrap table-fixed" style={{ minWidth: '100%' }}>
            <colgroup>{COL_DEFS.map((c) => (<col key={c.key} style={{ width: colWidths[c.key] }} />))}</colgroup>
            <thead>
              <tr className="group/head border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-medium select-none">
                {COL_DEFS.map((c, i) => (
                  <th key={c.key} className={`group/col relative py-4 px-6 font-medium text-[11px] tracking-wider uppercase transition-colors hover:bg-[var(--surface-subtle)] ${c.key === 'nights' ? 'text-center' : ''}`}>
                    {i > 0 && <ColLeftDivider />}
                    <span className="block truncate">{colLabel[c.key]}</span>
                    {c.resizable !== false && <ColResizeHandle onPointerDown={(e) => onResizeStart(c.key, e)} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-subtle)]">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={COL_DEFS.length} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <CalendarSearch className="w-8 h-8 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-[var(--text-primary)]">{t('No reservations found')}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{hasActiveFilters ? t('No reservations match these filters.') : t('Reservations will appear here.')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((r, i) => (
                  <ReservationRow key={r.id} reservation={r} index={(currentPage - 1) * PAGE_SIZE + i} formatDateTime={formatDateTime} onOpen={() => navigate(`/reservations/${r.id}`)} t={t} />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--surface-subtle)] bg-white">
          <span className="text-sm text-[var(--text-secondary)] tabular-nums">{t('Showing')} {rangeStart} {t('to')} {rangeEnd} {t('of')} {visible.length} {t('reservations')}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">{t('Previous')}</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm font-medium border rounded-md tabular-nums transition-colors cursor-pointer ${p === currentPage ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white' : 'border-[var(--border-default)] bg-white text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)]'}`}
              >
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">{t('Next')}</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ReservationRow({ reservation: r, index, formatDateTime, onOpen, t }: { reservation: Reservation; index: number; formatDateTime: (v: string) => string; onOpen: () => void; t: (k: string) => string }) {
  const ds = displayStatus(r.checkOut, r.status);
  return (
    <motion.tr initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.02 }} onClick={onOpen} className="hover:bg-[var(--surface-muted)] transition-colors cursor-pointer">
      <td className="px-6 py-4 text-[var(--text-tertiary)] tabular-nums">{index + 1}</td>
      <td className="px-6 py-4 overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">{initialOf(r.guestName)}</div>
          <div className="min-w-0">
            <div className="font-medium text-[var(--text-primary)] truncate">{r.guestName}</div>
            <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5"><span className="tabular-nums">{r.code}</span> · {r.guestEmail}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-[var(--text-primary)]">
        <div>{t(r.roomType)}</div>
        <div className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">{t('Room')} {r.roomNo}</div>
      </td>
      <td className="px-6 py-4 text-[var(--text-tertiary)]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-2 tabular-nums">
            <CalendarClock className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
            {r.rateType === 'Session'
              ? format(new Date(r.checkIn), 'MMM d, yyyy')
              : `${format(new Date(r.checkIn), 'MMM d')} – ${format(new Date(r.checkOut), 'MMM d, yyyy')}`}
          </span>
          {r.rateType && r.rateType !== 'Regular' && (
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full ${rateChipStyle(r.rateType)}`}>{t(rateLabel(r.rateType))}</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-[var(--text-primary)] tabular-nums text-center">
        {r.rateType === 'Session'
          ? <span className="text-[var(--text-secondary)]">{t('Day use')}</span>
          : `${r.nights} ${r.nights === 1 ? t('night') : t('nights')}`}
      </td>
      <td className="px-6 py-4 text-[var(--text-primary)] font-medium tabular-nums">{formatAmount(r.amount)}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusStyle(ds)}`}>
          {ds === 'Overdue' && <TriangleAlert className="w-3 h-3" />}
          {t(ds)}
        </span>
      </td>
    </motion.tr>
  );
}
