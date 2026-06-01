import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { isAfter, isBefore, subDays, addDays, addMonths, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  Search,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  ArrowUpDown,
  CalendarRange,
  Calendar as CalendarIcon,
  BedDouble,
  Users,
  Check,
  RotateCcw,
  X,
} from 'lucide-react';

import { BrandSelect } from '@/shared/ui/brand-select';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import { useDateFormat } from '@/shared/hooks/useDateFormat';
import { formatAmount, type BookingRequest, type RequestStatus, type RateType } from './booking-requests-data';
import { useBookingRequests } from './use-booking-requests';

type StatusFilter = 'All' | RequestStatus;
type Sort = 'newest' | 'checkin' | 'amount';

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function BookingRequests() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const requests = useBookingRequests((s) => s.requests);
  const setStatus = useBookingRequests((s) => s.setStatus);
  const { formatDate } = useDateFormat();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sort, setSort] = useState<Sort>('newest');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('Custom date range');

  const pending = requests.filter((r) => r.status === 'Pending');
  const counts = {
    pending: pending.length,
    approved: requests.filter((r) => r.status === 'Approved').length,
    declined: requests.filter((r) => r.status === 'Declined').length,
    pendingValue: pending.reduce((n, r) => n + r.amount, 0),
  };

  const hasActiveFilters = search !== '' || statusFilter !== 'All' || !!dateRange?.from;
  const clearFilters = () => { setSearch(''); setStatusFilter('All'); setDateRange(undefined); };

  const dateLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'MMM d, yyyy')} – ${format(dateRange.to, 'MMM d, yyyy')}`
      : format(dateRange.from, 'MMM d, yyyy')
    : t('Check-in date');

  const query = search.trim().toLowerCase();
  const visible = requests
    .filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (dateRange?.from) {
        const ci = new Date(r.checkIn);
        if (isBefore(ci, dateRange.from)) return false;
        if (dateRange.to && isAfter(ci, dateRange.to)) return false;
      }
      if (query && !`${r.guestName} ${r.roomType} ${r.guestEmail}`.toLowerCase().includes(query)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'checkin') return a.checkIn.localeCompare(b.checkIn);
      if (sort === 'amount') return b.amount - a.amount;
      return b.requestedAt.localeCompare(a.requestedAt);
    });

  const stats = [
    { title: 'Pending requests', Icon: Clock, value: String(counts.pending), subtitle: t('Awaiting decision') },
    { title: 'Approved', Icon: CheckCircle2, value: String(counts.approved), subtitle: t('Confirmed bookings') },
    { title: 'Declined', Icon: XCircle, value: String(counts.declined), subtitle: t('Not accepted') },
    { title: 'Pending value', Icon: CreditCard, value: formatAmount(counts.pendingValue), subtitle: t('If all approved') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Booking Requests')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {t('Review incoming booking requests and approve or decline them.')}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="bg-white border border-[var(--border-default)] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
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
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Search by guest or room')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <BrandSelect
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            leftIcon={<Inbox />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('All requests') },
              { value: 'Pending', label: t('Pending') },
              { value: 'Approved', label: t('Approved') },
              { value: 'Declined', label: t('Declined') },
            ]}
          />
          <BrandSelect
            value={sort}
            onValueChange={(v) => setSort(v as Sort)}
            leftIcon={<ArrowUpDown />}
            className="sm:w-auto"
            options={[
              { value: 'newest', label: t('Newest first') },
              { value: 'checkin', label: t('Check-in soonest') },
              { value: 'amount', label: t('Highest amount') },
            ]}
          />

          {/* Check-in date range filter */}
          <div className="relative">
            <button
              onClick={() => setIsDateOpen((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors shadow-none cursor-pointer ${
                dateRange?.from
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-tint)]'
                  : 'border-[var(--border-default)] text-[var(--text-tertiary)] bg-white hover:bg-[var(--surface-subtle)]'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              {dateLabel}
            </button>

            {isDateOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDateOpen(false)} />
                <div className="absolute top-full right-0 mt-2 bg-white border border-[var(--border-default)] rounded-md z-20 flex shadow-[0_4px_16px_rgba(44,38,39,0.08)]">
                  <div className="w-52 border-r border-[var(--border-default)] p-2 flex flex-col gap-1">
                    {['Next 7 days', 'Next 30 days', 'Next 90 days', 'Past 30 days', 'Custom date range'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setSelectedPreset(preset);
                          if (preset === 'Next 7 days') setDateRange({ from: new Date(), to: addDays(new Date(), 7) });
                          else if (preset === 'Next 30 days') setDateRange({ from: new Date(), to: addDays(new Date(), 30) });
                          else if (preset === 'Next 90 days') setDateRange({ from: new Date(), to: addMonths(new Date(), 3) });
                          else if (preset === 'Past 30 days') setDateRange({ from: subDays(new Date(), 30), to: new Date() });
                        }}
                        className={`flex items-center justify-between gap-2 w-full px-3 py-2 text-sm whitespace-nowrap rounded-md transition-colors shadow-none cursor-pointer ${
                          selectedPreset === preset
                            ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-medium'
                            : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)]'
                        }`}
                      >
                        {t(preset)}
                        {selectedPreset === preset && <Check className="w-4 h-4 text-[var(--brand-primary)]" />}
                      </button>
                    ))}
                  </div>
                  <div className="p-4" style={{ '--primary': 'var(--brand-primary)', '--primary-foreground': '#FFFFFF' } as React.CSSProperties}>
                    <CalendarUI
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => { setDateRange(range); setSelectedPreset('Custom date range'); }}
                      numberOfMonths={2}
                      className="border-0 shadow-none p-0"
                    />
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[var(--surface-subtle)]">
                      <button
                        onClick={() => { setDateRange(undefined); setSelectedPreset('Custom date range'); setIsDateOpen(false); }}
                        className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors shadow-none cursor-pointer"
                      >
                        {t('Clear')}
                      </button>
                      <button
                        onClick={() => setIsDateOpen(false)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors shadow-none cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        {t('Apply')}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center w-9 h-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-full transition-colors border border-transparent hover:border-[var(--border-default)] shadow-none cursor-pointer flex-shrink-0"
              title={t('Clear filters')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Request list */}
      {visible.length === 0 ? (
        <div className="bg-white border border-[var(--border-default)] rounded-md p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <Inbox className="w-8 h-8 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[var(--text-primary)]">{t('No booking requests')}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {hasActiveFilters ? t('No requests match these filters.') : t('Incoming requests will appear here.')}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((r, i) => (
            <RequestCard
              key={r.id}
              request={r}
              index={i}
              formatDate={formatDate}
              onApprove={() => setStatus(r.id, 'Approved')}
              onDecline={() => setStatus(r.id, 'Declined')}
              onReset={() => setStatus(r.id, 'Pending')}
              onOpen={() => navigate(`/booking-requests/${r.id}`)}
              t={t}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function StatusBadge({ status, t }: { status: RequestStatus; t: (k: string) => string }) {
  const map = {
    Pending: { cls: 'bg-[var(--warning-tint)] text-[var(--warning-strong)]', Icon: Clock },
    Approved: { cls: 'bg-[var(--success-tint)] text-[var(--success)]', Icon: CheckCircle2 },
    Declined: { cls: 'bg-[var(--danger-tint)] text-[var(--danger)]', Icon: XCircle },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full ${map.cls}`}>
      <map.Icon className="w-3 h-3" />
      {t(status)}
    </span>
  );
}

function RateChip({ rate, t }: { rate: RateType; t: (k: string) => string }) {
  const cls = {
    Regular: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]',
    Weekend: 'bg-[var(--accent-violet-tint)] text-[var(--accent-violet-deep)] border-[var(--accent-violet-tint-2)]',
    Session: 'bg-[var(--brand-tint)] text-[var(--brand-primary)] border-[var(--brand-border)]',
  }[rate];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${cls}`}>
      {t(rate)} {t('rate')}
    </span>
  );
}

function RequestCard({
  request: r,
  index,
  formatDate,
  onApprove,
  onDecline,
  onReset,
  onOpen,
  t,
}: {
  request: BookingRequest;
  index: number;
  formatDate: (v: string) => string;
  onApprove: () => void;
  onDecline: () => void;
  onReset: () => void;
  onOpen: () => void;
  t: (k: string) => string;
}) {
  const meta = [
    { key: 'room', Icon: BedDouble, label: t('Room type'), value: t(r.roomType) },
    { key: 'stay', Icon: CalendarRange, label: t('Stay'), value: `${formatDate(r.checkIn)} → ${formatDate(r.checkOut)} · ${r.nights} ${r.nights === 1 ? t('night') : t('nights')}` },
    { key: 'guests', Icon: Users, label: t('Guests'), value: String(r.guests) },
    { key: 'amount', Icon: CreditCard, label: t('Amount'), value: formatAmount(r.amount) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className="bg-white border border-[var(--border-default)] rounded-md p-5 shadow-none"
    >
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-3 min-w-0 text-left rounded-md -m-1 p-1 transition-colors cursor-pointer hover:bg-[var(--surface-subtle)] group/g"
          title={t('View booking request')}
        >
          <div className="w-10 h-10 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">
            {initialOf(r.guestName)}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-[var(--text-primary)] truncate group-hover/g:text-[var(--brand-primary)]">{r.guestName}</div>
            <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{r.guestEmail}</div>
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={r.status} t={t} />
          <span className="text-xs text-[var(--text-secondary)] tabular-nums whitespace-nowrap">{formatDate(r.requestedAt)}</span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        {meta.map((m) => (
          <div key={m.key} className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-0.5">
              <m.Icon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              {m.label}
            </div>
            {m.key === 'amount' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{m.value}</span>
                <RateChip rate={r.rateType} t={t} />
              </div>
            ) : (
              <div className="text-sm font-medium text-[var(--text-primary)] truncate tabular-nums">{m.value}</div>
            )}
          </div>
        ))}
      </div>

      {r.note && (
        <p className="text-sm text-[var(--text-secondary)] mt-4 bg-[var(--surface-subtle)] rounded-md px-3 py-2">
          {r.note}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 mt-4">
        <button onClick={onOpen} className="text-sm font-medium text-[var(--brand-primary)] hover:underline cursor-pointer">
          {t('View details')}
        </button>
        <div className="flex items-center gap-2">
        {r.status === 'Pending' ? (
          <>
            <button
              onClick={onDecline}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              {t('Decline')}
            </button>
            <button
              onClick={onApprove}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--success-strong)] rounded-md hover:bg-[var(--success)] transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {t('Approve')}
            </button>
          </>
        ) : (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            {t('Reset to pending')}
          </button>
        )}
        </div>
      </div>
    </motion.div>
  );
}
