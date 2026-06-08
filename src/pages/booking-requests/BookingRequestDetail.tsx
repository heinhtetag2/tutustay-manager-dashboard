import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { differenceInYears } from 'date-fns';
import {
  ChevronRight,
  Check,
  X,
  Mail,
  Phone,
  Hash,
  BedDouble,
  Tag,
  CalendarRange,
  Users,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  CloudMoon,
  ArrowUpRight,
  Inbox,
  RotateCcw,
  User,
  Cake,
  Flag,
  CalendarCheck,
  CalendarDays,
} from 'lucide-react';

import { useDateFormat } from '@/shared/hooks/useDateFormat';
import { useCustomers } from '@/pages/customers/use-customers';
import { formatMoney } from '@/pages/customers/customers-data';
import { formatAmount, type RequestStatus, type RateType } from './booking-requests-data';
import { useBookingRequests } from './use-booking-requests';

const NOW = new Date('2026-06-01T09:00:00');

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function statusBadge(status: RequestStatus) {
  return {
    Pending: { cls: 'bg-[var(--warning-tint)] text-[var(--warning-strong)]', Icon: Clock },
    Approved: { cls: 'bg-[var(--success-tint)] text-[var(--success)]', Icon: CheckCircle2 },
    Declined: { cls: 'bg-[var(--danger-tint)] text-[var(--danger)]', Icon: XCircle },
  }[status];
}

function RateChip({ rate, t }: { rate: RateType; t: (k: string) => string }) {
  const cls = {
    Regular: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]',
    Weekend: 'bg-[var(--accent-violet-tint)] text-[var(--accent-violet-deep)] border-[var(--accent-violet-tint-2)]',
    Session: 'bg-[var(--brand-tint)] text-[var(--brand-primary)] border-[var(--brand-border)]',
  }[rate];
  return <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border ${cls}`}>{rate === 'Session' ? t('Day use') : `${t(rate)} ${t('rate')}`}</span>;
}

export default function BookingRequestDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const request = useBookingRequests((s) => s.requests.find((r) => r.id === id));
  const setStatus = useBookingRequests((s) => s.setStatus);
  const customer = useCustomers((s) => s.customers.find((c) => c.id === request?.customerId));
  const { formatDate, formatDateTime, formatDateTimeLong } = useDateFormat();

  if (!request) {
    return (
      <div className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
        <div className="bg-white border border-[var(--border-default)] rounded-md p-12 text-center">
          <p className="text-[var(--text-secondary)]">{t('Booking request not found.')}</p>
          <button onClick={() => navigate('/booking-requests')} className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] rounded-md text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer">
            {t('Back to Booking Requests')}
          </button>
        </div>
      </div>
    );
  }

  const badge = statusBadge(request.status);
  const phone = customer?.phone;
  const dob = customer?.dateOfBirth ? new Date(customer.dateOfBirth) : null;
  const age = dob ? differenceInYears(NOW, dob) : null;

  const stats = [
    { title: 'Nights', Icon: CloudMoon, value: String(request.nights), subtitle: `${formatDateTime(request.checkIn)} → ${formatDateTime(request.checkOut)}` },
    { title: 'Guests', Icon: Users, value: String(request.guests), subtitle: t('In this booking') },
    { title: 'Amount', Icon: CreditCard, value: formatAmount(request.amount), subtitle: `${t(request.rateType)} ${t('rate')}` },
    { title: 'Requested', Icon: Clock, value: formatDate(request.requestedAt), subtitle: t('Request received') },
  ];

  const events = [
    request.status !== 'Pending'
      ? request.status === 'Approved'
        ? { Icon: CheckCircle2, tone: 'bg-[var(--success-tint)] text-[var(--success)]', label: t('Approved'), detail: t('Booking confirmed'), date: request.requestedAt }
        : { Icon: XCircle, tone: 'bg-[var(--danger-tint)] text-[var(--danger)]', label: t('Declined'), detail: t('Request not accepted'), date: request.requestedAt }
      : { Icon: Clock, tone: 'bg-[var(--warning-tint)] text-[var(--warning-strong)]', label: t('Awaiting decision'), detail: t('Pending review'), date: request.requestedAt },
    { Icon: Inbox, tone: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]', label: t('Request received'), detail: `${t(request.roomType)} · ${request.nights} ${request.nights === 1 ? t('night') : t('nights')}`, date: request.requestedAt },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] mb-4">
        <button onClick={() => navigate('/booking-requests')} className="text-[13px] leading-none font-normal hover:text-[var(--text-primary)] transition-colors cursor-pointer">{t('Booking Requests')}</button>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
        <span className="text-[13px] leading-none text-[var(--text-primary)] font-medium truncate">{request.guestName}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-xl font-medium shrink-0">{initialOf(request.guestName)}</div>
          <div className="min-w-0">
            <h1 className="text-3xl font-serif text-[var(--text-primary)] leading-tight mb-1.5">{request.guestName}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${badge.cls}`}>
                <badge.Icon className="w-3 h-3" />
                {t(request.status)}
              </span>
              <span className="text-sm text-[var(--text-tertiary)]">{request.guestEmail}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {request.status === 'Pending' ? (
            <>
              <button onClick={() => setStatus(request.id, 'Declined')} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer">
                <X className="w-4 h-4" />
                {t('Decline')}
              </button>
              <button onClick={() => setStatus(request.id, 'Approved')} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--success-strong)] rounded-md hover:bg-[var(--success)] transition-colors cursor-pointer">
                <Check className="w-4 h-4" />
                {t('Approve')}
              </button>
            </>
          ) : (
            <button onClick={() => setStatus(request.id, 'Pending')} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
              <RotateCcw className="w-4 h-4" />
              {t('Reset to pending')}
            </button>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
        {stats.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} className="bg-white border border-[var(--border-default)] rounded-md p-3 sm:p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group">
            <div className="flex justify-between items-start mb-1.5 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors">
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)] tabular-nums">{card.value}</div>
            <div className="text-[11px] sm:text-xs text-[var(--text-tertiary)] mt-1 sm:mt-2 truncate">{card.subtitle}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: booking details */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Booking details')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Requested stay and pricing')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
              <InfoRow Icon={BedDouble} label={t('Room type')}><span className="text-sm text-[var(--text-primary)]">{t(request.roomType)}</span></InfoRow>
              <InfoRow Icon={Tag} label={t('Rate type')}><RateChip rate={request.rateType} t={t} /></InfoRow>
              <InfoRow Icon={CalendarRange} label={t('Check-in')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{formatDateTimeLong(request.checkIn)}</span></InfoRow>
              <InfoRow Icon={CalendarRange} label={t('Check-out')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{formatDateTimeLong(request.checkOut)}</span></InfoRow>
              <InfoRow Icon={CloudMoon} label={t('Nights')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{request.nights}</span></InfoRow>
              <InfoRow Icon={Users} label={t('Guests')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{request.guests}</span></InfoRow>
              <InfoRow Icon={CreditCard} label={t('Amount')}><span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{formatAmount(request.amount)}</span></InfoRow>
              <InfoRow Icon={Clock} label={t('Requested at')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{formatDateTimeLong(request.requestedAt)}</span></InfoRow>
            </div>
          </section>

          {/* Guest profile — full context for the decision */}
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Guest profile')}</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{customer ? t('Registered customer details') : t('Limited details — not a registered customer')}</p>
              </div>
              {customer && (
                <button onClick={() => navigate(`/customers/${customer.id}`)} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer shrink-0">
                  {t('View full profile')}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
              <InfoRow Icon={Mail} label={t('Email')}>
                <a href={`mailto:${request.guestEmail}`} className="text-sm text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors break-all">{request.guestEmail}</a>
              </InfoRow>
              <InfoRow Icon={Phone} label={t('Phone')}>
                <span className="text-sm text-[var(--text-primary)] tabular-nums">{phone || t('Not registered')}</span>
              </InfoRow>
              <InfoRow Icon={Hash} label={t('User ID')}>
                <span className="text-sm text-[var(--text-primary)] tabular-nums">{customer?.userId ?? '—'}</span>
              </InfoRow>
              <InfoRow Icon={User} label={t('Gender')}>
                <span className="text-sm text-[var(--text-primary)]">{customer?.gender ? t(customer.gender) : '—'}</span>
              </InfoRow>
              <InfoRow Icon={Cake} label={t('Age')}>
                <span className="text-sm text-[var(--text-primary)] tabular-nums">{age != null ? `${age} ${t('years')}` : '—'}</span>
              </InfoRow>
              <InfoRow Icon={Flag} label={t('Nationality')}>
                <span className="text-sm text-[var(--text-primary)]">{customer?.nationality || '—'}</span>
              </InfoRow>
              <InfoRow Icon={CalendarCheck} label={t('Total bookings')}>
                <span className="text-sm text-[var(--text-primary)] tabular-nums">{customer ? customer.totalBookings : '—'}</span>
              </InfoRow>
              <InfoRow Icon={CreditCard} label={t('Total payment')}>
                <span className="text-sm text-[var(--text-primary)] tabular-nums">{customer ? formatMoney(customer.totalPayment) : '—'}</span>
              </InfoRow>
            </div>
          </section>

          {request.note && (
            <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
                <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Guest note')}</h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-subtle)] rounded-md px-3 py-2">{request.note}</p>
              </div>
            </section>
          )}
        </div>

        {/* Right: activity */}
        <div className="space-y-6">
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Activity')}</h2>
            </div>
            <ol className="px-6 py-5 space-y-5">
              {events.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${e.tone}`}>
                    <e.Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{e.label}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">{e.detail}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1 tabular-nums">{formatDate(e.date)}</div>
                  </div>
                </li>
              ))}
            </ol>
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
