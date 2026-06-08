import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { differenceInYears } from 'date-fns';
import {
  ChevronRight,
  LogIn,
  LogOut,
  Ban,
  Mail,
  Phone,
  Hash,
  BedDouble,
  CalendarRange,
  Users,
  CreditCard,
  CloudMoon,
  Clock,
  ArrowUpRight,
  BadgeCheck,
  User,
  Cake,
  Flag,
  CalendarCheck,
  TriangleAlert,
  CheckCircle2,
  Tag,
} from 'lucide-react';

import { useDateFormat } from '@/shared/hooks/useDateFormat';
import { useCustomers } from '@/pages/customers/use-customers';
import { formatMoney } from '@/pages/customers/customers-data';
import { formatAmount, rateLabel, type ReservationStatus } from './reservations-data';
import { useReservations } from './use-reservations';

const TODAY = new Date('2026-06-01T00:00:00');
type DisplayStatus = ReservationStatus | 'Overdue';

function isOverdue(checkOut: string, status: ReservationStatus): boolean {
  if (status !== 'Confirmed' && status !== 'Checked-in') return false;
  return new Date(checkOut) < TODAY;
}
function displayStatus(checkOut: string, status: ReservationStatus): DisplayStatus {
  return isOverdue(checkOut, status) ? 'Overdue' : status;
}
function statusStyle(s: DisplayStatus): string {
  switch (s) {
    case 'Confirmed': return 'bg-[var(--brand-tint)] text-[var(--brand-primary)]';
    case 'Checked-in': return 'bg-[var(--success-tint)] text-[var(--success)]';
    case 'Checked-out': return 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
    case 'Cancelled': return 'bg-[var(--danger-tint)] text-[var(--danger)]';
    case 'No-show': return 'bg-[var(--warning-tint)] text-[var(--warning-strong)]';
    case 'Overdue': return 'bg-[var(--danger-tint)] text-[var(--danger)]';
  }
}
function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function ReservationDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const reservation = useReservations((s) => s.reservations.find((r) => r.id === id));
  const setStatus = useReservations((s) => s.setStatus);
  const customer = useCustomers((s) => s.customers.find((c) => c.id === reservation?.customerId));
  const { formatDate, formatDateTime, formatDateTimeLong } = useDateFormat();

  if (!reservation) {
    return (
      <div className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
        <div className="bg-white border border-[var(--border-default)] rounded-md p-12 text-center">
          <p className="text-[var(--text-secondary)]">{t('Reservation not found.')}</p>
          <button onClick={() => navigate('/reservations')} className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] rounded-md text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer">
            {t('Back to Reservations')}
          </button>
        </div>
      </div>
    );
  }

  const r = reservation;
  const ds = displayStatus(r.checkOut, r.status);
  const overdue = ds === 'Overdue';
  const phone = customer?.phone;
  const dob = customer?.dateOfBirth ? new Date(customer.dateOfBirth) : null;
  const age = dob ? differenceInYears(TODAY, dob) : null;

  const dayUse = r.rateType === 'Session';
  const stats = [
    dayUse
      ? { title: 'Booking type', Icon: CloudMoon, value: t('Day use'), subtitle: `${formatDateTime(r.checkIn)} → ${formatDateTime(r.checkOut)}` }
      : { title: 'Nights', Icon: CloudMoon, value: String(r.nights), subtitle: `${formatDateTime(r.checkIn)} → ${formatDateTime(r.checkOut)}` },
    { title: 'Guests', Icon: Users, value: String(r.guests), subtitle: t('In this reservation') },
    { title: 'Amount', Icon: CreditCard, value: formatAmount(r.amount), subtitle: t('Total for the stay') },
    { title: 'Booked on', Icon: Clock, value: formatDate(r.createdAt), subtitle: r.code },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] mb-4">
        <button onClick={() => navigate('/reservations')} className="text-[13px] leading-none font-normal hover:text-[var(--text-primary)] transition-colors cursor-pointer">{t('Reservation Management')}</button>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
        <span className="text-[13px] leading-none text-[var(--text-primary)] font-medium truncate">{r.code}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-xl font-medium shrink-0">{initialOf(r.guestName)}</div>
          <div className="min-w-0">
            <h1 className="text-3xl font-serif text-[var(--text-primary)] leading-tight mb-1.5">{r.guestName}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${statusStyle(ds)}`}>
                {overdue && <TriangleAlert className="w-3 h-3" />}
                {t(ds)}
              </span>
              <span className="text-sm text-[var(--text-tertiary)] tabular-nums">{r.code}</span>
              <span className="text-sm text-[var(--text-secondary)]">·</span>
              <span className="text-sm text-[var(--text-tertiary)]">{r.guestEmail}</span>
            </div>
          </div>
        </div>

        {/* Status actions */}
        <div className="flex items-center gap-2 shrink-0">
          {r.status === 'Confirmed' && (
            <>
              <button onClick={() => setStatus(r.id, 'Cancelled')} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer">
                <Ban className="w-4 h-4" />
                {t('Cancel')}
              </button>
              <button onClick={() => setStatus(r.id, 'Checked-in')} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--success-strong)] rounded-md hover:bg-[var(--success)] transition-colors cursor-pointer">
                <LogIn className="w-4 h-4" />
                {t('Check in')}
              </button>
            </>
          )}
          {r.status === 'Checked-in' && (
            <button onClick={() => setStatus(r.id, 'Checked-out')} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-data-orange-50)] rounded-md hover:bg-[var(--color-data-orange-60)] transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
              {t('Check out')}
            </button>
          )}
          {(r.status === 'Checked-out' || r.status === 'Cancelled' || r.status === 'No-show') && (
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
              <CheckCircle2 className="w-4 h-4" />
              {t('Closed')}
            </span>
          )}
        </div>
      </div>

      {/* Overdue alert */}
      {overdue && (
        <div className="flex items-start gap-3 mb-6 px-4 py-3 bg-[var(--danger-tint)] border border-[var(--danger-border)] rounded-md">
          <TriangleAlert className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--danger)] leading-relaxed">
            {t('This reservation is overdue — the check-out date has passed but the guest is still checked in. Check them out to resolve it.')}
          </p>
        </div>
      )}

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
        {/* Left: stay details */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Reservation details')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Stay and room information')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
              <InfoRow Icon={Hash} label={t('Reservation code')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{r.code}</span></InfoRow>
              <InfoRow Icon={BedDouble} label={t('Room')}><span className="text-sm text-[var(--text-primary)]">{t(r.roomType)} · {t('Room')} {r.roomNo}</span></InfoRow>
              <InfoRow Icon={Tag} label={t('Booking type')}>
                <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)]">
                  {t(rateLabel(r.rateType))}
                </span>
              </InfoRow>
              <InfoRow Icon={CalendarRange} label={t('Check-in')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{formatDateTimeLong(r.checkIn)}</span></InfoRow>
              <InfoRow Icon={CalendarRange} label={t('Check-out')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{formatDateTimeLong(r.checkOut)}</span></InfoRow>
              <InfoRow Icon={CloudMoon} label={t('Duration')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{dayUse ? t('Day use') : `${r.nights} ${r.nights === 1 ? t('night') : t('nights')}`}</span></InfoRow>
              <InfoRow Icon={Users} label={t('Guests')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{r.guests}</span></InfoRow>
              <InfoRow Icon={CreditCard} label={t('Amount')}><span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{formatAmount(r.amount)}</span></InfoRow>
              <InfoRow Icon={Clock} label={t('Booked on')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{formatDateTimeLong(r.createdAt)}</span></InfoRow>
            </div>
          </section>
        </div>

        {/* Right: guest */}
        <div className="space-y-6">
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Guest')}</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{customer ? t('Registered customer') : t('Not a registered customer')}</p>
              </div>
              {customer && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[var(--success-tint)] text-[var(--success)]">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {t('Verified')}
                </span>
              )}
            </div>
            <div className="px-6 py-5 space-y-5">
              <InfoRow Icon={Mail} label={t('Email')}><a href={`mailto:${r.guestEmail}`} className="text-sm text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors break-all">{r.guestEmail}</a></InfoRow>
              <InfoRow Icon={Phone} label={t('Phone')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{phone || t('Not registered')}</span></InfoRow>
              <InfoRow Icon={User} label={t('Gender')}><span className="text-sm text-[var(--text-primary)]">{customer?.gender ? t(customer.gender) : '—'}</span></InfoRow>
              <InfoRow Icon={Cake} label={t('Age')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{age != null ? `${age} ${t('years')}` : '—'}</span></InfoRow>
              <InfoRow Icon={Flag} label={t('Nationality')}><span className="text-sm text-[var(--text-primary)]">{customer?.nationality || '—'}</span></InfoRow>
              <InfoRow Icon={CalendarCheck} label={t('Total bookings')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{customer ? customer.totalBookings : '—'}</span></InfoRow>
              <InfoRow Icon={CreditCard} label={t('Total payment')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{customer ? formatMoney(customer.totalPayment) : '—'}</span></InfoRow>
            </div>
            {customer ? (
              <button
                onClick={() => navigate(`/customers/${customer.id}`)}
                className="w-full flex items-center justify-center gap-1.5 px-6 py-3.5 border-t border-[var(--surface-subtle)] text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
              >
                {t('View full profile')}
                <ArrowUpRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="px-6 py-3.5 border-t border-[var(--surface-subtle)] text-xs text-[var(--text-secondary)] text-center">
                {t('This guest booked without an account, so there’s no customer profile yet.')}
              </div>
            )}
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
