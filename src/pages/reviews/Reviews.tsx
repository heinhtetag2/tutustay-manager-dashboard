import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { isAfter, isBefore, subDays, subMonths, format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  Search,
  Star,
  MessageSquare,
  MessageSquareReply,
  Clock,
  CheckCircle2,
  ArrowUpDown,
  BedDouble,
  Calendar as CalendarIcon,
  Check,
  Send,
  X,
  Pencil,
  Eye,
  EyeOff,
} from 'lucide-react';

import { BrandSelect } from '@/shared/ui/brand-select';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import { useDateFormat } from '@/shared/hooks/useDateFormat';
import { averageRating, type Review } from './reviews-data';
import { useReviews } from './use-reviews';

type RatingFilter = 'All' | '5' | '4' | '3' | '2' | '1';
type StatusFilter = 'All' | 'Replied' | 'Awaiting' | 'Hidden';
type Sort = 'recent' | 'highest' | 'lowest';

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function Stars({ value, className = 'w-4 h-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${className} ${n <= value ? 'text-[var(--color-data-yellow-40)] fill-[var(--color-data-yellow-40)]' : 'text-[var(--border-strong)]'}`} />
      ))}
    </span>
  );
}

export default function Reviews() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reviews = useReviews((s) => s.reviews);
  const setReply = useReviews((s) => s.setReply);
  const removeReply = useReviews((s) => s.removeReply);
  const setHidden = useReviews((s) => s.setHidden);
  const { formatDate } = useDateFormat();
  const [params] = useSearchParams();

  const [search, setSearch] = useState(() => params.get('q') ?? '');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sort, setSort] = useState<Sort>('recent');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('Custom date range');

  const total = reviews.length;
  const replied = reviews.filter((r) => r.reply).length;
  const avg = averageRating(reviews);

  const hasActiveFilters = search !== '' || ratingFilter !== 'All' || statusFilter !== 'All' || !!dateRange?.from;
  const clearFilters = () => { setSearch(''); setRatingFilter('All'); setStatusFilter('All'); setDateRange(undefined); };

  const dateLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'MMM d, yyyy')} – ${format(dateRange.to, 'MMM d, yyyy')}`
      : format(dateRange.from, 'MMM d, yyyy')
    : t('Review date');

  const query = search.trim().toLowerCase();
  const visible = reviews
    .filter((r) => {
      if (ratingFilter !== 'All' && r.rating !== Number(ratingFilter)) return false;
      if (statusFilter === 'Replied' && !r.reply) return false;
      if (statusFilter === 'Awaiting' && r.reply) return false;
      if (statusFilter === 'Hidden' && !r.hidden) return false;
      if (dateRange?.from) {
        const posted = new Date(r.createdAt);
        if (isBefore(posted, dateRange.from)) return false;
        if (dateRange.to && isAfter(posted, dateRange.to)) return false;
      }
      if (query && !`${r.customerName} ${r.comment} ${r.roomType}`.toLowerCase().includes(query)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'highest') return b.rating - a.rating;
      if (sort === 'lowest') return a.rating - b.rating;
      return b.createdAt.localeCompare(a.createdAt);
    });

  const stats = [
    { title: 'Average rating', Icon: Star, value: avg.toFixed(1), subtitle: `${t('from')} ${total} ${t('reviews')}` },
    { title: 'Total reviews', Icon: MessageSquare, value: String(total), subtitle: t('All time') },
    { title: 'Awaiting reply', Icon: Clock, value: String(total - replied), subtitle: t('Need a response') },
    { title: 'Response rate', Icon: CheckCircle2, value: total ? `${Math.round((replied / total) * 100)}%` : '—', subtitle: `${replied} ${t('replied')}` },
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
        <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Customer Reviews')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {t('Read guest feedback, track ratings, and respond to reviews — all in one place.')}
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
            <div className="flex items-center gap-2">
              <span className="text-2xl font-medium text-[var(--text-primary)] tabular-nums">{card.value}</span>
              {card.title === 'Average rating' && <Stars value={Math.round(avg)} />}
            </div>
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
            placeholder={t('Search reviews')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <BrandSelect
            value={ratingFilter}
            onValueChange={(v) => setRatingFilter(v as RatingFilter)}
            leftIcon={<Star />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('All ratings') },
              { value: '5', label: `5 ${t('stars')}` },
              { value: '4', label: `4 ${t('stars')}` },
              { value: '3', label: `3 ${t('stars')}` },
              { value: '2', label: `2 ${t('stars')}` },
              { value: '1', label: `1 ${t('star')}` },
            ]}
          />
          <BrandSelect
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            leftIcon={<MessageSquareReply />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('All reviews') },
              { value: 'Replied', label: t('Replied') },
              { value: 'Awaiting', label: t('Awaiting reply') },
              { value: 'Hidden', label: t('Hidden') },
            ]}
          />
          <BrandSelect
            value={sort}
            onValueChange={(v) => setSort(v as Sort)}
            leftIcon={<ArrowUpDown />}
            className="sm:w-auto"
            options={[
              { value: 'recent', label: t('Most recent') },
              { value: 'highest', label: t('Highest rated') },
              { value: 'lowest', label: t('Lowest rated') },
            ]}
          />

          {/* Review-date range filter */}
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

      {/* Review list */}
      {visible.length === 0 ? (
        <div className="bg-white border border-[var(--border-default)] rounded-md p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <MessageSquare className="w-8 h-8 text-[var(--text-secondary)] mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[var(--text-primary)]">{t('No reviews found')}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {hasActiveFilters ? t('No reviews match these filters.') : t('Guest reviews will appear here.')}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((r, i) => (
            <ReviewCard
              key={r.id}
              review={r}
              index={i}
              formatDate={formatDate}
              onReply={(text) => setReply(r.id, text, new Date().toISOString())}
              onRemoveReply={() => removeReply(r.id)}
              onToggleHidden={() => setHidden(r.id, !r.hidden)}
              onOpenCustomer={r.customerId ? () => navigate(`/customers/${r.customerId}`) : undefined}
              t={t}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ReviewCard({
  review: r,
  index,
  formatDate,
  onReply,
  onRemoveReply,
  onToggleHidden,
  onOpenCustomer,
  t,
}: {
  review: Review;
  index: number;
  formatDate: (v: string) => string;
  onReply: (text: string) => void;
  onRemoveReply: () => void;
  onToggleHidden: () => void;
  onOpenCustomer?: () => void;
  t: (k: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(r.reply ?? '');

  const submit = () => {
    if (!draft.trim()) return;
    onReply(draft.trim());
    setOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className={`bg-white border rounded-md p-5 shadow-none transition-colors ${r.hidden ? 'border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)]/40' : 'border-[var(--border-default)]'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={onOpenCustomer}
          disabled={!onOpenCustomer}
          className={`flex items-center gap-3 min-w-0 text-left rounded-md -m-1 p-1 transition-colors ${onOpenCustomer ? 'cursor-pointer hover:bg-[var(--surface-subtle)] group/cust' : 'cursor-default'}`}
          title={onOpenCustomer ? t('View customer profile') : undefined}
        >
          <div className="w-10 h-10 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0 overflow-hidden">
            {r.avatarUrl ? <img src={r.avatarUrl} alt="" className="w-full h-full object-cover" /> : initialOf(r.customerName)}
          </div>
          <div className="min-w-0">
            <div className={`font-medium text-[var(--text-primary)] truncate ${onOpenCustomer ? 'group-hover/cust:text-[var(--brand-primary)]' : ''}`}>{r.customerName}</div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Stars value={r.rating} className="w-3.5 h-3.5" />
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                <BedDouble className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                {t(r.roomType)}
              </span>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {r.hidden ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
              <EyeOff className="w-3 h-3" />
              {t('Hidden')}
            </span>
          ) : r.reply ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-[var(--success-tint)] text-[var(--success)]">
              <CheckCircle2 className="w-3 h-3" />
              {t('Replied')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-[var(--warning-tint)] text-[var(--warning-strong)]">
              <Clock className="w-3 h-3" />
              {t('Awaiting')}
            </span>
          )}
          <span className="text-xs text-[var(--text-secondary)] tabular-nums whitespace-nowrap">{formatDate(r.createdAt)}</span>
          <button
            onClick={onToggleHidden}
            className="p-1.5 -mr-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer"
            title={r.hidden ? t('Show review') : t('Hide review')}
            aria-label={r.hidden ? t('Show review') : t('Hide review')}
          >
            {r.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <p className={`text-sm leading-relaxed mt-3 ${r.hidden ? 'text-[var(--text-secondary)] italic' : 'text-[var(--text-primary)]'}`}>{r.comment}</p>
      {r.hidden && <p className="text-xs text-[var(--text-muted)] mt-2">{t('This review is hidden from public listings.')}</p>}

      {/* Existing reply */}
      {r.reply && !open && (
        <div className="mt-4 pl-4 border-l-2 border-[var(--brand-border)]">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-xs font-medium text-[var(--brand-primary)]">{t('Manager reply')}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => { setDraft(r.reply ?? ''); setOpen(true); }} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <Pencil className="w-3 h-3" />
                {t('Edit')}
              </button>
              <button onClick={onRemoveReply} className="text-xs font-medium text-[var(--danger)] hover:underline cursor-pointer">{t('Remove')}</button>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{r.reply}</p>
          {r.replyAt && <span className="text-xs text-[var(--text-muted)] mt-1 block tabular-nums">{formatDate(r.replyAt)}</span>}
        </div>
      )}

      {/* Reply composer */}
      {open ? (
        <div className="mt-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder={t('Write a reply to this guest…')}
            className="w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm resize-none focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
              {t('Cancel')}
            </button>
            <button onClick={submit} disabled={!draft.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <Send className="w-3.5 h-3.5" />
              {t('Send reply')}
            </button>
          </div>
        </div>
      ) : (
        !r.reply && (
          <div className="mt-4">
            <button onClick={() => { setDraft(''); setOpen(true); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--brand-primary)] border border-[var(--brand-border)] rounded-md hover:bg-[var(--brand-tint)] transition-colors cursor-pointer">
              <MessageSquareReply className="w-4 h-4" />
              {t('Reply')}
            </button>
          </div>
        )
      )}
    </motion.div>
  );
}
