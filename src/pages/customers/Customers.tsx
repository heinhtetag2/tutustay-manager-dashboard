import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { isAfter, isBefore, subDays, subMonths, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  Search,
  Users,
  CalendarCheck,
  CalendarClock,
  Calendar as CalendarIcon,
  Check,
  CreditCard,
  Repeat,
  UserSearch,
  ArrowUpDown,
  Layers,
  Trash2,
  AlertCircle,
  X,
} from 'lucide-react';

import { Portal } from '@/shared/ui/portal';
import { BrandSelect } from '@/shared/ui/brand-select';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import { useDateFormat } from '@/shared/hooks/useDateFormat';
import { useResizableColumns, ColResizeHandle, ColLeftDivider, type ColumnDef } from '@/shared/ui/resizable-columns';
import { formatMoney, type Customer } from './customers-data';
import { useCustomers } from './use-customers';

type Segment = 'All' | 'Repeat' | 'New' | 'Inactive';
type Sort = 'recent' | 'spend' | 'bookings';

const COL_DEFS: ColumnDef[] = [
  { key: 'select', w: 48, min: 48, resizable: false },
  { key: 'no', w: 64, min: 56 },
  { key: 'customer', w: 300, min: 240 },
  { key: 'lastBooking', w: 220, min: 170 },
  { key: 'bookings', w: 140, min: 110 },
  { key: 'payment', w: 170, min: 130 },
  { key: 'notes', w: 240, min: 140 },
];

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function Customers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const customers = useCustomers((s) => s.customers);
  const removeCustomer = useCustomers((s) => s.removeCustomer);
  const { formatDateTime } = useDateFormat();

  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<Segment>('All');
  const [sort, setSort] = useState<Sort>('recent');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('Custom date range');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { widths: colWidths, onResizeStart } = useResizableColumns(COL_DEFS);

  const counts = {
    total: customers.length,
    bookings: customers.reduce((n, c) => n + c.totalBookings, 0),
    revenue: customers.reduce((n, c) => n + c.totalPayment, 0),
    repeat: customers.filter((c) => c.totalBookings > 1).length,
  };

  const hasActiveFilters = search !== '' || segment !== 'All' || !!dateRange?.from;
  const clearFilters = () => { setSearch(''); setSegment('All'); setDateRange(undefined); };

  const dateLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'MMM d, yyyy')} – ${format(dateRange.to, 'MMM d, yyyy')}`
      : format(dateRange.from, 'MMM d, yyyy')
    : t('Booking date');

  const query = search.trim().toLowerCase();
  const visible = customers
    .filter((c) => {
      if (segment === 'Repeat' && c.totalBookings <= 1) return false;
      if (segment === 'New' && c.totalBookings !== 1) return false;
      if (segment === 'Inactive' && c.status !== 'Inactive') return false;
      if (dateRange?.from) {
        if (!c.lastBookingDate) return false;
        const booked = new Date(c.lastBookingDate);
        if (isBefore(booked, dateRange.from)) return false;
        if (dateRange.to && isAfter(booked, dateRange.to)) return false;
      }
      if (query) {
        const hay = `${c.fullName} ${c.userId} ${c.email} ${c.phone}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'spend') return b.totalPayment - a.totalPayment;
      if (sort === 'bookings') return b.totalBookings - a.totalBookings;
      return (b.lastBookingDate || '').localeCompare(a.lastBookingDate || '');
    });

  const visibleIds = visible.map((c) => c.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const confirmBulkDelete = () => {
    selected.forEach((id) => removeCustomer(id));
    setSelected(new Set());
    setBulkDeleting(false);
  };

  const stats = [
    { title: 'Total customers', Icon: Users, value: String(counts.total), subtitle: `${counts.repeat} ${t('repeat guests')}` },
    { title: 'Total bookings', Icon: CalendarCheck, value: counts.bookings.toLocaleString('en-US'), subtitle: t('Across all customers') },
    { title: 'Total revenue', Icon: CreditCard, value: formatMoney(counts.revenue), subtitle: t('Lifetime payments') },
    { title: 'Repeat customers', Icon: Repeat, value: String(counts.repeat), subtitle: t('More than one booking') },
  ];

  const colLabel: Record<string, string> = {
    select: '',
    no: t('No.'),
    customer: t('Customer name'),
    lastBooking: t('Last booking date'),
    bookings: t('Total booking'),
    payment: t('Total payment'),
    notes: t('Notes'),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Customer Management')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {t('Manage and track customer details, bookings, and activity — all in one place.')}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            placeholder={t('Search by customer name')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <BrandSelect
            value={segment}
            onValueChange={(v) => setSegment(v as Segment)}
            leftIcon={<Layers />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('All customers') },
              { value: 'Repeat', label: t('Repeat guests') },
              { value: 'New', label: t('New (1 booking)') },
              { value: 'Inactive', label: t('Inactive') },
            ]}
          />
          <BrandSelect
            value={sort}
            onValueChange={(v) => setSort(v as Sort)}
            leftIcon={<ArrowUpDown />}
            className="sm:w-auto"
            options={[
              { value: 'recent', label: t('Recent booking') },
              { value: 'spend', label: t('Highest spend') },
              { value: 'bookings', label: t('Most bookings') },
            ]}
          />

          {/* Booking-date range filter */}
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
                    {['Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 12 months', 'Custom date range'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setSelectedPreset(preset);
                          if (preset === 'Last 7 days') setDateRange({ from: subDays(new Date(), 7), to: new Date() });
                          else if (preset === 'Last 30 days') setDateRange({ from: subDays(new Date(), 30), to: new Date() });
                          else if (preset === 'Last 90 days') setDateRange({ from: subDays(new Date(), 90), to: new Date() });
                          else if (preset === 'Last 12 months') setDateRange({ from: subMonths(new Date(), 12), to: new Date() });
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

      {/* Bulk selection bar */}
      <AnimatePresence initial={false}>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 mb-4 px-4 py-2.5 bg-[var(--brand-tint)] border border-[var(--brand-border)] rounded-md">
              <span className="text-sm font-medium text-[var(--brand-primary)] tabular-nums">
                {selected.size} {t('selected')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelected(new Set())}
                  className="px-3 py-1.5 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white rounded-md transition-colors cursor-pointer"
                >
                  {t('Clear')}
                </button>
                <button
                  onClick={() => setBulkDeleting(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('Delete')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="text-left text-sm whitespace-nowrap table-fixed" style={{ minWidth: '100%' }}>
            <colgroup>
              {COL_DEFS.map((c) => (
                <col key={c.key} style={{ width: colWidths[c.key] }} />
              ))}
            </colgroup>
            <thead>
              <tr className="group/head border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-medium select-none">
                {COL_DEFS.map((c, i) => (
                  <th
                    key={c.key}
                    className={`group/col relative py-4 font-medium text-[11px] tracking-wider uppercase transition-colors hover:bg-[var(--surface-subtle)] ${c.key === 'select' ? 'pl-6 pr-3' : 'px-6'} ${c.key === 'bookings' ? 'text-center' : ''}`}
                  >
                    {i > 0 && <ColLeftDivider />}
                    {c.key === 'select' ? (
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--brand-primary)] cursor-pointer align-middle"
                        aria-label={t('Select all')}
                      />
                    ) : (
                      <span className="block truncate">{colLabel[c.key]}</span>
                    )}
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
                      <UserSearch className="w-8 h-8 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
                      <p className="text-sm font-medium text-[var(--text-primary)]">{t('No customers found')}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {hasActiveFilters ? t('No customers match these filters.') : t('Customers will appear here once they book.')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visible.map((c, index) => (
                  <CustomerRow
                    key={c.id}
                    customer={c}
                    index={index}
                    selected={selected.has(c.id)}
                    onToggle={() => toggleOne(c.id)}
                    onOpen={() => navigate(`/customers/${c.id}`)}
                    formatDateTime={formatDateTime}
                    t={t}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--surface-subtle)] bg-white">
          <span className="text-sm text-[var(--text-secondary)]">
            {t('Showing')} 1 {t('to')} {visible.length} {t('of')} {counts.total} {t('customers')}
          </span>
          <div className="flex items-center gap-1">
            <button disabled className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {t('Previous')}
            </button>
            <button className="h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm font-medium border border-[var(--brand-primary)] rounded-md bg-[var(--brand-primary)] text-white tabular-nums cursor-default">1</button>
            <button className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
              {t('Next')}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk delete confirmation */}
      <Portal>
        <AnimatePresence>
          {bulkDeleting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[var(--text-primary)]/30 flex items-center justify-center z-50 p-4"
              onClick={() => setBulkDeleting(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="bg-white rounded-md w-full max-w-sm shadow-none border border-[var(--surface-subtle)] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)]">
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">
                    {t('Delete')} {selected.size} {t('customers')}?
                  </h2>
                  <button
                    onClick={() => setBulkDeleting(false)}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">
                    {t('This permanently removes the selected customer records. This action cannot be undone.')}
                  </p>
                  <p className="mt-4 text-[var(--danger)] text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t('This action cannot be undone.')}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-subtle)]">
                  <button
                    onClick={() => setBulkDeleting(false)}
                    className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    onClick={confirmBulkDelete}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md bg-[var(--danger-strong)] hover:bg-[var(--danger)] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('Delete')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </motion.div>
  );
}

function CustomerRow({ customer: c, index, selected, onToggle, onOpen, formatDateTime, t }: { customer: Customer; index: number; selected: boolean; onToggle: () => void; onOpen: () => void; formatDateTime: (v: string) => string; t: (k: string) => string }) {
  const last = c.lastBookingDate ? new Date(c.lastBookingDate) : null;
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={onOpen}
      className="hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
    >
      <td className="pl-6 pr-3 py-4" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--brand-primary)] cursor-pointer align-middle"
          aria-label={t('Select row')}
        />
      </td>
      <td className="px-6 py-4 text-[var(--text-tertiary)] tabular-nums">{index + 1}</td>
      <td className="px-6 py-4 overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0 overflow-hidden">
            {c.avatarUrl ? <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" /> : initialOf(c.fullName)}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-[var(--text-primary)] truncate">{c.fullName}</div>
            <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
              <span className="tabular-nums">ID {c.userId}</span> · {c.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-[var(--text-tertiary)]">
        {last ? (
          <span className="inline-flex items-center gap-2 tabular-nums">
            <CalendarClock className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
            {formatDateTime(c.lastBookingDate)}
          </span>
        ) : (
          <span className="text-[var(--text-secondary)]">—</span>
        )}
      </td>
      <td className="px-6 py-4 text-[var(--text-primary)] tabular-nums text-center">{c.totalBookings}</td>
      <td className="px-6 py-4 text-[var(--text-primary)] font-medium tabular-nums">{formatMoney(c.totalPayment)}</td>
      <td className="px-6 py-4 text-[var(--text-tertiary)]">
        {c.notes ? <span className="block truncate" title={c.notes}>{c.notes}</span> : <span className="text-[var(--text-secondary)]">—</span>}
      </td>
    </motion.tr>
  );
}
