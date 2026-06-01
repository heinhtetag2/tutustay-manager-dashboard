import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { format, formatDistanceToNow, differenceInYears } from 'date-fns';
import {
  ChevronRight,
  Mail,
  Phone,
  Hash,
  User,
  Cake,
  Flag,
  CreditCard,
  CalendarDays,
  BedDouble,
  Clock,
  CalendarCheck,
  Star,
  Bookmark,
  Send,
  UserPlus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import { formatMoney, maskResidentId, type CustomerStatus } from './customers-data';
import { useCustomers } from './use-customers';
import { useReviews } from '@/pages/reviews/use-reviews';
import { useDateFormat } from '@/shared/hooks/useDateFormat';

const NOW = new Date('2026-06-01T09:00:00');

function statusBadge(status: CustomerStatus) {
  return status === 'Active'
    ? { cls: 'bg-[var(--success-tint)] text-[var(--success)]', Icon: CheckCircle2 }
    : { cls: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]', Icon: XCircle };
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function CustomerDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const customer = useCustomers((s) => s.customers.find((c) => c.id === id));
  const setNote = useCustomers((s) => s.setNote);
  const review = useReviews((s) => s.reviews.find((r) => r.customerId === id));
  const { formatDate, formatDateTime, formatDateTimeLong } = useDateFormat();
  const [noteDraft, setNoteDraft] = useState(customer?.notes ?? '');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ id: number; text: string; at: string }[]>([]);

  if (!customer) {
    return (
      <div className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
        <div className="bg-white border border-[var(--border-default)] rounded-md p-12 text-center">
          <p className="text-[var(--text-secondary)]">{t('Customer not found.')}</p>
          <button
            onClick={() => navigate('/customers')}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] rounded-md text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
          >
            {t('Back to Customers')}
          </button>
        </div>
      </div>
    );
  }

  const badge = statusBadge(customer.status);
  const last = customer.lastBookingDate ? new Date(customer.lastBookingDate) : null;
  const resv = customer.reservationDate ? new Date(customer.reservationDate) : null;
  const joined = customer.joinedDate ? new Date(customer.joinedDate) : null;
  const dob = customer.dateOfBirth ? new Date(customer.dateOfBirth) : null;
  const age = dob ? differenceInYears(NOW, dob) : null;
  const rating = review?.rating ?? customer.rating ?? 0;
  const noteDirty = noteDraft !== customer.notes;

  const stats = [
    { title: 'Total bookings', Icon: CalendarCheck, value: String(customer.totalBookings), subtitle: t('Lifetime') },
    { title: 'Total payment', Icon: CreditCard, value: formatMoney(customer.totalPayment), subtitle: t('Lifetime spend') },
    { title: 'Last booking', Icon: Clock, value: last ? format(last, 'MMM yyyy') : '—', subtitle: last ? formatDistanceToNow(last, { addSuffix: true }) : t('No bookings yet') },
    { title: 'Member since', Icon: CalendarDays, value: joined ? format(joined, 'MMM yyyy') : '—', subtitle: joined ? formatDistanceToNow(joined, { addSuffix: true }) : t('Not set') },
  ];

  // Recent booking history derived from the customer's aggregate data.
  const avgSpend = customer.totalBookings ? Math.round(customer.totalPayment / customer.totalBookings) : 0;
  const historyCount = last ? Math.min(customer.totalBookings, 4) : 0;
  const bookingEvents = Array.from({ length: historyCount }, (_, i) => {
    const d = new Date(customer.lastBookingDate);
    d.setDate(d.getDate() - i * 26);
    const room = i % 2 === 0 ? (customer.lastRoomType || customer.roomType || 'Deluxe') : (customer.roomType || 'Superior');
    const nights = (i % 3) + 1;
    return {
      Icon: CalendarCheck,
      tone: 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]',
      label: i === 0 ? t('Last booking') : t('Booking'),
      detail: `${t(room)} · ${nights} ${nights === 1 ? t('night') : t('nights')} · ${formatMoney(avgSpend)}`,
      date: d.toISOString(),
      withTime: true,
    };
  });

  const events = [
    customer.status === 'Inactive'
      ? { Icon: XCircle, tone: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]', label: t('Inactive customer'), detail: t('No recent activity'), date: customer.lastBookingDate, withTime: false }
      : { Icon: CheckCircle2, tone: 'bg-[var(--success-tint)] text-[var(--success)]', label: t('Active customer'), detail: t('Account in good standing'), date: customer.lastBookingDate, withTime: false },
    ...bookingEvents,
    joined && { Icon: UserPlus, tone: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]', label: t('Account created'), detail: `${t('User ID')} ${customer.userId}`, date: customer.joinedDate, withTime: false },
  ].filter(Boolean) as { Icon: React.ElementType; tone: string; label: string; detail: string; date: string; withTime?: boolean }[];

  const sendMessage = () => {
    const text = message.trim();
    if (!text) return;
    setMessages((m) => [{ id: m.length + 1, text, at: format(NOW, 'MMM d, h:mm a') }, ...m]);
    setMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] mb-4">
        <button onClick={() => navigate('/customers')} className="text-[13px] leading-none font-normal hover:text-[var(--text-primary)] transition-colors cursor-pointer">
          {t('Customers')}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
        <span className="text-[13px] leading-none text-[var(--text-primary)] font-medium truncate">{customer.fullName}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-xl font-medium shrink-0 overflow-hidden">
            {customer.avatarUrl ? <img src={customer.avatarUrl} alt="" className="w-full h-full object-cover" /> : initialOf(customer.fullName)}
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-serif text-[var(--text-primary)] leading-tight mb-1.5">{customer.fullName}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${badge.cls}`}>
                <badge.Icon className="w-3 h-3" />
                {t(customer.status)}
              </span>
              <span className="text-sm text-[var(--text-tertiary)] tabular-nums">{t('User ID')} {customer.userId}</span>
              <span className="text-sm text-[var(--text-secondary)]">·</span>
              <span className="text-sm text-[var(--text-tertiary)]">{customer.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Profile')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Customer account details')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
              <InfoRow Icon={Mail} label={t('Email')}>
                <a href={`mailto:${customer.email}`} className="text-sm text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors break-all">{customer.email}</a>
              </InfoRow>
              <InfoRow Icon={Phone} label={t('Phone number')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{customer.phone || '—'}</span></InfoRow>
              <InfoRow Icon={Hash} label={t('User ID')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{customer.userId}</span></InfoRow>
              <InfoRow Icon={User} label={t('Gender')}><span className="text-sm text-[var(--text-primary)]">{customer.gender ? t(customer.gender) : '—'}</span></InfoRow>
              <InfoRow Icon={Cake} label={t('Age')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{age != null ? `${age} ${t('years')}` : '—'}</span></InfoRow>
              <InfoRow Icon={Flag} label={t('Nationality')}><span className="text-sm text-[var(--text-primary)]">{customer.nationality || '—'}</span></InfoRow>
              <InfoRow Icon={CreditCard} label={t('Resident reg. no.')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{maskResidentId(customer.residentId)}</span></InfoRow>
              <InfoRow Icon={Hash} label={t('Reservation number')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{customer.reservationNumber || '—'}</span></InfoRow>
              <InfoRow Icon={CalendarDays} label={t('Reservation date')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{resv ? formatDateTimeLong(customer.reservationDate) : '—'}</span></InfoRow>
              <InfoRow Icon={BedDouble} label={t('Room type')}><span className="text-sm text-[var(--text-primary)]">{customer.roomType || '—'}</span></InfoRow>
            </div>
          </section>

          {/* Notes */}
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Notes')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Internal notes for this customer')}</p>
            </div>
            <div className="px-6 py-5">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder={t('Add a note about this customer…')}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm resize-none focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => setNote(customer.id, noteDraft)}
                  disabled={!noteDirty}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('Save note')}
                </button>
              </div>
            </div>
          </section>

          {/* Notify Your Guest */}
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Notify Your Guest')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Send a message to this customer')}</p>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-xs font-medium shrink-0">H</div>
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') sendMessage(); }}
                    placeholder={t('Type your message here…')}
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm resize-none focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                  <div className="flex items-center justify-end mt-2">
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {t('Send')}
                    </button>
                  </div>
                </div>
              </div>
              {messages.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)] mt-4 pl-11">{t('No messages yet')}</p>
              ) : (
                <ul className="space-y-3 mt-4">
                  {messages.map((m) => (
                    <li key={m.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-xs font-medium shrink-0">H</div>
                      <div className="flex-1 min-w-0 bg-[var(--surface-subtle)] rounded-md px-3 py-2">
                        <p className="text-sm text-[var(--text-primary)] break-words">{m.text}</p>
                        <span className="text-xs text-[var(--text-secondary)] mt-1 block tabular-nums">{m.at}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Activity */}
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Activity')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Recent customer events')}</p>
            </div>
            <ol className="px-6 py-5 space-y-5">
              {events.map((event, i) => (
                <li key={`${event.label}-${i}`} className="flex gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${event.tone}`}>
                    <event.Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{event.label}</div>
                    {event.detail && <div className="text-xs text-[var(--text-secondary)] mt-0.5">{event.detail}</div>}
                    {event.date && <div className="text-xs text-[var(--text-secondary)] mt-1 tabular-nums">{event.withTime ? formatDateTime(event.date) : formatDate(event.date)}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Feedback & History */}
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Feedback & History')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Reviews and reservations')}</p>
            </div>
            <div className="px-6 py-5 space-y-5">
              <InfoRow Icon={Star} label={t('Guest reviews')}>
                <span className="inline-flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`w-4 h-4 ${n <= rating ? 'text-[var(--color-data-yellow-40)] fill-[var(--color-data-yellow-40)]' : 'text-[var(--border-strong)]'}`} />
                  ))}
                  {rating > 0 && <span className="ml-1.5 text-xs text-[var(--text-secondary)] tabular-nums">{rating.toFixed(1)}</span>}
                </span>
              </InfoRow>
              <InfoRow Icon={Bookmark} label={t('Total reservation')}>
                <span className="text-sm text-[var(--text-primary)] tabular-nums">{customer.totalBookings}</span>
              </InfoRow>

              {review ? (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/reviews?q=${encodeURIComponent(customer.fullName)}`)}
                    className="w-full text-left rounded-md border border-[var(--border-default)] p-3 hover:border-[var(--brand-border)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer group"
                  >
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">“{review.comment}”</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-primary)] mt-2 group-hover:gap-1.5 transition-all">
                      {t('View in Customer Reviews')}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">{t('No reviews yet')}</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ Icon, label, children }: { Icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-md bg-[var(--surface-subtle)] flex items-center justify-center shrink-0 text-[var(--text-tertiary)]">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-[var(--text-secondary)] mb-0.5">{label}</div>
        {children}
      </div>
    </div>
  );
}
