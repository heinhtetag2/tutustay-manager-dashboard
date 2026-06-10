import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  CreditCard, CloudMoon, Users, X, ChevronRight as ArrowR, ArrowRight, Search, ListFilter, CalendarCheck,
} from 'lucide-react';
import { SideSheet } from '@/shared/ui/side-sheet';
import { useDateFormat } from '@/shared/hooks/useDateFormat';
import { formatAmount, countsAsRevenue, type Reservation, type ReservationStatus } from '@/pages/reservations/reservations-data';

export function dotColor(status: ReservationStatus): string {
  switch (status) {
    case 'Confirmed': return 'bg-[var(--brand-primary)]';
    case 'Checked-in': return 'bg-[var(--success)]';
    case 'Checked-out': return 'bg-[var(--text-muted)]';
    case 'Cancelled': return 'bg-[var(--danger)]';
    case 'No-show': return 'bg-[var(--warning-strong)]';
  }
}
export function statusChipStyle(status: ReservationStatus): string {
  switch (status) {
    case 'Confirmed': return 'bg-[var(--brand-tint)] text-[var(--brand-primary)]';
    case 'Checked-in': return 'bg-[var(--success-tint)] text-[var(--success)]';
    case 'Checked-out': return 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
    case 'Cancelled': return 'bg-[var(--danger-tint)] text-[var(--danger)]';
    case 'No-show': return 'bg-[var(--warning-tint)] text-[var(--warning-strong)]';
  }
}

/**
 * The day-breakdown side sheet from the Sales Calendar: revenue / room-nights /
 * guests tiles, a status filter, a searchable booking list. Self-contained so it
 * can be reused (e.g. in the design-system reference). Render inside an
 * <AnimatePresence>; pass a `key` per day so its filters reset between days.
 */
export function SalesDayDetailSheet({
  day,
  bookings,
  onClose,
  onOpenReservation,
}: {
  day: Date;
  bookings: Reservation[];
  onClose: () => void;
  onOpenReservation?: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { formatDate } = useDateFormat();
  const [daySearch, setDaySearch] = useState('');
  const [dayStatusFilter, setDayStatusFilter] = useState<ReservationStatus | null>(null);

  const dayTotal = bookings.filter((r) => countsAsRevenue(r.status)).reduce((n, r) => n + r.amount, 0);
  const dayNights = bookings.filter((r) => countsAsRevenue(r.status)).reduce((n, r) => n + r.nights, 0);
  const dayGuests = bookings.reduce((n, r) => n + r.guests, 0);
  const dayStatusCounts = (['Confirmed', 'Checked-in', 'Checked-out', 'Cancelled', 'No-show'] as ReservationStatus[])
    .map((s) => ({ status: s, count: bookings.filter((r) => r.status === s).length }))
    .filter((x) => x.count > 0);

  const dayQuery = daySearch.trim().toLowerCase();
  const filteredDayList = bookings.filter((r) => {
    if (dayStatusFilter && r.status !== dayStatusFilter) return false;
    if (dayQuery && !`${r.guestName} ${t(r.roomType)} ${r.roomNo} ${r.code} ${r.guestEmail}`.toLowerCase().includes(dayQuery)) return false;
    return true;
  });

  const open = (id: string) => { onClose(); onOpenReservation?.(id); };

  return (
    <SideSheet onClose={onClose} widthClass="max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)] shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">{formatDate(day)}</h2>
          {bookings.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)] text-xs font-medium tabular-nums">
              <CalendarCheck className="w-3 h-3" />
              {bookings.length} {bookings.length === 1 ? t('booking') : t('bookings')}
            </span>
          ) : (
            <p className="text-xs text-[var(--text-secondary)] mt-1">{t('No bookings')}</p>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {bookings.length > 0 && (
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

        <div className="space-y-2">
          {bookings.length > 5 && (
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
                onClick={() => open(r.id)}
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
  );
}
