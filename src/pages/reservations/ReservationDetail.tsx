import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { differenceInYears, addDays, addHours, differenceInHours, isSameDay } from 'date-fns';
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
  TicketPercent,
  ArrowLeftRight,
  Check,
  Search,
  X,
  MessageSquareText,
  CalendarPlus,
  CalendarClock,
  Minus,
  Plus,
  Send,
  Wallet,
  Lock,
} from 'lucide-react';

import { useDateFormat } from '@/shared/hooks/useDateFormat';
import { useCustomers } from '@/pages/customers/use-customers';
import { formatMoney } from '@/pages/customers/customers-data';
import { CouponBadge, discountLabel, originalAmount } from '@/shared/ui/coupon-badge';
import { STAT_TONE } from '@/shared/ui/stat-tone';
import { Portal } from '@/shared/ui/portal';
import { useHotel } from '@/pages/hotel/use-hotel';
import { type Room } from '@/pages/hotel/hotel-data';
import { formatAmount, rateLabel, isPaid, isDayUse, paymentMethodLabel, type Reservation, type ReservationStatus, type RateType } from './reservations-data';
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
  const changeRoom = useReservations((s) => s.changeRoom);
  const extendStay = useReservations((s) => s.extendStay);
  const setPaid = useReservations((s) => s.setPaid);
  const customer = useCustomers((s) => s.customers.find((c) => c.id === reservation?.customerId));
  const { formatDate, formatDateTime, formatDateTimeLong } = useDateFormat();
  const [changeRoomOpen, setChangeRoomOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  // Running feed of internal notes — seeded from the reservation's saved note.
  const [notes, setNotes] = useState<{ id: number; text: string; date: string }[]>(() =>
    reservation?.managerNote
      ? [{ id: 1, text: reservation.managerNote, date: reservation.managerNoteAt ?? reservation.createdAt }]
      : [],
  );
  // Admin actions performed this session (room change, extension, status) —
  // prepended to the activity timeline so the log shows what the manager did.
  const [actionEvents, setActionEvents] = useState<{ Icon: React.ElementType; tone: string; label: string; detail: string; date: string }[]>([]);
  const logAction = (e: { Icon: React.ElementType; tone: string; label: string; detail: string }) =>
    setActionEvents((prev) => [{ ...e, date: new Date().toISOString() }, ...prev]);

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
  const paid = isPaid(r);
  const phone = customer?.phone;
  const dob = customer?.dateOfBirth ? new Date(customer.dateOfBirth) : null;
  const age = dob ? differenceInYears(TODAY, dob) : null;

  const dayUse = r.rateType === 'Session';
  const stats = [
    dayUse
      ? { title: 'Booking type', Icon: CloudMoon, value: t('Day use'), subtitle: `${formatDateTime(r.checkIn)} → ${formatDateTime(r.checkOut)}`, tone: 'purple' as const }
      : { title: 'Nights', Icon: CloudMoon, value: String(r.nights), subtitle: `${formatDateTime(r.checkIn)} → ${formatDateTime(r.checkOut)}`, tone: 'purple' as const },
    { title: 'Guests', Icon: Users, value: String(r.guests), subtitle: t('In this reservation'), tone: 'pink' as const },
    { title: 'Amount', Icon: CreditCard, value: formatAmount(r.amount), subtitle: r.coupon ? `${t('Saved')} ${formatAmount(r.coupon.amountSaved)} · ${r.coupon.code}` : t('Total for the stay'), tone: 'success' as const },
    { title: 'Booked on', Icon: Clock, value: formatDate(r.createdAt), subtitle: r.code, tone: 'brand' as const },
  ];

  const addNote = () => {
    const text = noteDraft.trim();
    if (!text) return;
    setNotes((prev) => [{ id: Date.now(), text, date: new Date().toISOString() }, ...prev]);
    setNoteDraft('');
  };

  // Reservation activity — newest first: current status, room, then created.
  const statusEvent =
    r.status === 'Checked-in'
      ? { Icon: LogIn, tone: 'bg-[var(--success-tint)] text-[var(--success)]', label: t('Checked in'), detail: `${t('Room')} ${r.roomNo}`, date: r.checkIn }
      : r.status === 'Checked-out'
        ? { Icon: LogOut, tone: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]', label: t('Checked out'), detail: t('Stay completed'), date: r.checkOut }
        : r.status === 'Cancelled'
          ? { Icon: Ban, tone: 'bg-[var(--danger-tint)] text-[var(--danger)]', label: t('Cancelled'), detail: t('Reservation cancelled'), date: r.createdAt }
          : r.status === 'No-show'
            ? { Icon: TriangleAlert, tone: 'bg-[var(--warning-tint)] text-[var(--warning-strong)]', label: t('No-show'), detail: t('Guest did not arrive'), date: r.checkIn }
            : { Icon: CheckCircle2, tone: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]', label: t('Confirmed'), detail: t('Awaiting arrival'), date: r.checkIn };
  const events = [
    ...actionEvents,
    statusEvent,
    { Icon: BedDouble, tone: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]', label: t('Room assigned'), detail: `${t(r.roomType)} · ${t('Room')} ${r.roomNo}`, date: r.createdAt },
    { Icon: CalendarPlus, tone: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]', label: t('Reservation created'), detail: r.code, date: r.createdAt },
  ];

  // Status actions — rendered inline in the header on desktop and in a sticky
  // bottom bar on mobile, so the primary action is always within thumb reach.
  const hasStatusActions = r.status === 'Confirmed' || r.status === 'Checked-in';
  const statusActions = (
    <>
      {r.status === 'Confirmed' && (
        <>
          <button onClick={() => setStatus(r.id, 'Cancelled')} className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer">
            <Ban className="w-4 h-4" />
            {t('Cancel')}
          </button>
          {paid ? (
            /* Already paid (online or settled) — check-in is available. */
            <button onClick={() => setStatus(r.id, 'Checked-in')} className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--success-strong)] rounded-md hover:bg-[var(--success)] transition-colors cursor-pointer">
              <LogIn className="w-4 h-4" />
              {t('Check in')}
            </button>
          ) : (
            /* Walk-in awaiting payment — must settle before check-in. */
            <button
              onClick={() => { logAction({ Icon: Wallet, tone: 'bg-[var(--success-tint)] text-[var(--success)]', label: t('Payment received'), detail: `${paymentMethodLabel(r)} · ${formatAmount(r.amount)}` }); setPaid(r.id); }}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              {t('Mark as paid')}
            </button>
          )}
        </>
      )}
      {r.status === 'Checked-in' && (
        <button onClick={() => setStatus(r.id, 'Checked-out')} className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-data-orange-50)] rounded-md hover:bg-[var(--color-data-orange-60)] transition-colors cursor-pointer">
          <LogOut className="w-4 h-4" />
          {t('Check out')}
        </button>
      )}
      {(r.status === 'Checked-out' || r.status === 'Cancelled' || r.status === 'No-show') && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-md">
          <Lock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
          {t(r.status)}
        </span>
      )}
    </>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full ${hasStatusActions ? 'max-lg:pb-28' : ''}`}>
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
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${paid ? 'bg-[var(--success-tint)] text-[var(--success)]' : 'bg-[var(--color-data-orange-10)] text-[var(--color-data-orange-50)]'}`}>
                <Wallet className="w-3 h-3" />
                {paid ? t('Paid') : t('Unpaid')}
              </span>
              <span className="text-sm text-[var(--text-tertiary)] tabular-nums">{r.code}</span>
              <span className="text-sm text-[var(--text-secondary)]">·</span>
              <span className="text-sm text-[var(--text-tertiary)]">{r.guestEmail}</span>
            </div>
          </div>
        </div>

        {/* Status actions — inline on desktop; a sticky bottom bar on mobile (see below). */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {statusActions}
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

      {/* Unpaid notice — a walk-in must settle before check-in is allowed. */}
      {r.status === 'Confirmed' && !paid && (
        <div className="flex items-start gap-3 mb-6 px-4 py-3 bg-[var(--color-data-orange-10)] border border-[var(--color-data-orange-20)] rounded-md">
          <Wallet className="w-4 h-4 text-[var(--color-data-orange-50)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {t('This is a walk-in booking awaiting payment. Mark it as paid to enable check-in.')}
          </p>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
        {stats.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.08 }} className="bg-white border border-[var(--border-default)] rounded-md p-3 sm:p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group">
            <div className="flex justify-between items-start mb-1.5 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className={`p-2 rounded-md transition-colors ${STAT_TONE[card.tone]}`}>
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
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Reservation details')}</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Stay and room information')}</p>
              </div>
              {(r.status === 'Confirmed' || r.status === 'Checked-in') && (
                <div className="flex items-center gap-2 shrink-0 max-sm:w-full">
                  <button
                    onClick={() => setExtendOpen(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--brand-primary)] bg-white border border-[var(--brand-border)] rounded-md hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    <CalendarClock className="w-4 h-4" />
                    {isDayUse(r.rateType) ? t('Extend session') : t('Extend stay')}
                  </button>
                  <button
                    onClick={() => setChangeRoomOpen(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--brand-primary)] bg-white border border-[var(--brand-border)] rounded-md hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    {t('Change room')}
                  </button>
                </div>
              )}
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
              <InfoRow Icon={CreditCard} label={t('Amount')}>
                <span className="flex items-center gap-2 flex-wrap">
                  {r.coupon && <span className="text-sm text-[var(--text-tertiary)] line-through tabular-nums">{formatAmount(originalAmount(r.amount, r.coupon))}</span>}
                  <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{formatAmount(r.amount)}</span>
                </span>
              </InfoRow>
              {r.coupon && (
                <InfoRow Icon={TicketPercent} label={t('Coupon')}>
                  <span className="flex items-center gap-2 flex-wrap">
                    <CouponBadge coupon={r.coupon} />
                    <span className="text-sm text-[var(--text-secondary)] tabular-nums">{discountLabel(r.coupon)} · −{formatAmount(r.coupon.amountSaved)}</span>
                  </span>
                </InfoRow>
              )}
              <InfoRow Icon={Wallet} label={t('Payment')}>
                <span className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full ${paid ? 'bg-[var(--success-tint)] text-[var(--success)]' : 'bg-[var(--color-data-orange-10)] text-[var(--color-data-orange-50)]'}`}>
                    {paid ? t('Paid') : t('Unpaid')}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">· {t(paymentMethodLabel(r))}</span>
                </span>
              </InfoRow>
              <InfoRow Icon={Clock} label={t('Booked on')}><span className="text-sm text-[var(--text-primary)] tabular-nums">{formatDateTimeLong(r.createdAt)}</span></InfoRow>
            </div>
          </section>

          {/* Guest request — the note the customer left at booking. */}
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Guest request')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Note left by the guest when booking')}</p>
            </div>
            <div className="px-6 py-5">
              {r.guestNote ? (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                    <MessageSquareText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 bg-[var(--surface-subtle)]/60 rounded-md px-3.5 py-2.5">
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">{r.guestNote}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                  <MessageSquareText className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                  {t('The guest didn’t leave a note at booking.')}
                </div>
              )}
            </div>
          </section>

          {/* Admin notes — running feed of internal notes, admins only. */}
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex items-center justify-between">
              <div>
                <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Admin notes')}</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Internal notes visible to admins only')}</p>
              </div>
              <span className="text-xs text-[var(--text-secondary)] tabular-nums">{notes.length}</span>
            </div>
            <div className="px-6 py-5">
              {notes.length > 0 && (
                <ul className="space-y-3 mb-4">
                  {notes.map((n) => (
                    <li key={n.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-xs font-medium shrink-0">H</div>
                      <div className="flex-1 min-w-0 bg-[var(--surface-subtle)] rounded-md px-3 py-2">
                        <p className="text-sm text-[var(--text-primary)] break-words">{n.text}</p>
                        <span className="text-xs text-[var(--text-secondary)] mt-1 block tabular-nums">{formatDateTime(n.date)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-xs font-medium shrink-0">H</div>
                <div className="flex-1">
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') addNote(); }}
                    placeholder={t('Add a note for your team...')}
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm resize-none focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[var(--text-secondary)]">⌘ + Enter {t('to save')}</span>
                    <button
                      onClick={addNote}
                      disabled={!noteDraft.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {t('Save note')}
                    </button>
                  </div>
                </div>
              </div>
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

          {/* Activity — this reservation's lifecycle events. */}
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Activity')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Recent reservation events')}</p>
            </div>
            <ol className="px-6 py-5">
              {events.map((event, i) => {
                const isLast = i === events.length - 1;
                return (
                  <li key={`${event.label}-${i}`} className="flex gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${event.tone}`}>
                        <event.Icon className="w-4 h-4" />
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-[var(--border-default)] my-1" />}
                    </div>
                    <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-5'}`}>
                      <div className="text-sm font-medium text-[var(--text-primary)]">{event.label}</div>
                      {event.detail && <div className="text-xs text-[var(--text-secondary)] mt-0.5">{event.detail}</div>}
                      {event.date && <div className="text-xs text-[var(--text-secondary)] mt-1 tabular-nums">{formatDateTime(event.date)}</div>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {changeRoomOpen && (
          <ChangeRoomDialog
            reservation={r}
            onClose={() => setChangeRoomOpen(false)}
            onConfirm={(room, amount) => {
              logAction({ Icon: ArrowLeftRight, tone: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]', label: t('Room changed'), detail: `${t(r.roomType)} · ${t('Room')} ${r.roomNo} → ${t(room.typeName)} · ${t('Room')} ${room.number}` });
              changeRoom(r.id, room.typeName, room.number, amount);
              setChangeRoomOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {extendOpen && (
          <ExtendStayDialog
            reservation={r}
            formatDateTimeLong={formatDateTimeLong}
            onClose={() => setExtendOpen(false)}
            onConfirm={({ checkOut, nights, amount, rateType, mode, converted, extra }) => {
              const label = converted ? t('Converted to overnight') : mode === 'session' ? t('Session extended') : t('Stay extended');
              const unit = mode === 'session' ? (extra === 1 ? t('session') : t('sessions')) : (extra === 1 ? t('night') : t('nights'));
              const detail = converted
                ? `${nights} ${nights === 1 ? t('night') : t('nights')} · ${t('until')} ${formatDateTime(checkOut)}`
                : `+${extra} ${unit} · ${t('until')} ${formatDateTime(checkOut)}`;
              logAction({ Icon: converted ? ArrowLeftRight : CalendarClock, tone: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]', label, detail });
              extendStay(r.id, checkOut, nights, amount, rateType);
              setExtendOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile sticky action bar — keeps the primary action within thumb reach. */}
      {hasStatusActions && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-center gap-2 px-4 py-3 bg-white border-t border-[var(--border-default)] shadow-[0_-4px_16px_rgba(44,38,39,0.06)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {statusActions}
        </div>
      )}
    </motion.div>
  );
}

/** Modal to move a reservation to a different room. Lists active rooms with
 *  price + capacity, previews the new total, and marks the current room. */
function ChangeRoomDialog({
  reservation: r,
  onClose,
  onConfirm,
}: {
  reservation: Reservation;
  onClose: () => void;
  onConfirm: (room: Room, amount: number) => void;
}) {
  const { t } = useTranslation();
  const rooms = useHotel((s) => s.rooms);
  const [query, setQuery] = useState('');
  const [selId, setSelId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const available = rooms
    .filter((rm) => rm.status === 'Active')
    .filter((rm) => !q || `${rm.number} ${rm.typeName}`.toLowerCase().includes(q))
    .sort((a, b) => a.typeName.localeCompare(b.typeName) || a.number.localeCompare(b.number));

  const nights = r.nights > 0 ? r.nights : 1;
  const sel = rooms.find((rm) => rm.id === selId) ?? null;
  const newAmount = sel ? sel.price * nights : r.amount;
  const isCurrentRoom = (rm: Room) => rm.number === r.roomNo && rm.typeName === r.roomType;

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
        />
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md bg-white rounded-md border border-[var(--border-default)] shadow-[0_16px_48px_rgba(44,38,39,0.22)] flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--surface-subtle)] shrink-0">
            <div>
              <h3 className="text-base font-medium text-[var(--text-primary)]">{t('Change room')}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Move')} {r.guestName} {t('to a different room.')}</p>
            </div>
            <button onClick={onClose} className="p-1.5 -mr-1 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer" aria-label={t('Close')}><X className="w-4 h-4" /></button>
          </div>

          {/* Current room */}
          <div className="px-5 py-2.5 bg-[var(--surface-subtle)]/50 border-b border-[var(--surface-subtle)] text-xs text-[var(--text-secondary)] shrink-0">
            {t('Currently')}: <span className="font-medium text-[var(--text-primary)]">{t(r.roomType)} · {t('Room')} {r.roomNo}</span> · <span className="tabular-nums">{formatAmount(r.amount)}</span>
          </div>

          {/* Search */}
          <div className="px-4 pt-3 pb-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Search room number or type…')}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
              />
            </div>
          </div>

          {/* Room list */}
          <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1 min-h-[120px]">
            {available.length === 0 ? (
              <div className="py-10 text-center text-sm text-[var(--text-secondary)]">{t('No rooms match your search.')}</div>
            ) : (
              available.map((rm) => {
                const current = isCurrentRoom(rm);
                const selected = selId === rm.id;
                const overCap = rm.occupancy < r.guests;
                return (
                  <button
                    key={rm.id}
                    onClick={() => !current && setSelId(rm.id)}
                    disabled={current}
                    className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors flex items-center gap-3 ${
                      current
                        ? 'border-[var(--border-default)] bg-[var(--surface-subtle)]/40 cursor-default'
                        : selected
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-tint)] cursor-pointer'
                          : 'border-[var(--border-default)] bg-white hover:bg-[var(--surface-subtle)] cursor-pointer'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[var(--text-primary)]">{t('Room')} {rm.number} · {t(rm.typeName)}</div>
                      <div className="text-xs text-[var(--text-secondary)] tabular-nums mt-0.5">
                        {t('Floor')} {rm.floor} · {t('up to')} {rm.occupancy} {rm.occupancy === 1 ? t('guest') : t('guests')}
                        {overCap && <span className="text-[var(--warning-strong)]"> · {t('over capacity')}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{formatAmount(rm.price)}<span className="text-[var(--text-tertiary)] font-normal">/{t('night')}</span></div>
                      {current && <span className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wide">{t('Current')}</span>}
                    </div>
                    {selected && <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-[var(--surface-subtle)] shrink-0">
            {sel && (
              <div className="text-xs text-[var(--text-secondary)] mb-3">
                {t('New total')}: <span className="font-medium text-[var(--text-primary)] tabular-nums">{formatAmount(newAmount)}</span>
                {newAmount !== r.amount && <span className="text-[var(--text-tertiary)]"> ({t('was')} <span className="tabular-nums line-through">{formatAmount(r.amount)}</span>)</span>}
                <span className="block text-[var(--text-tertiary)] mt-0.5">{nights} {nights === 1 ? t('night') : t('nights')} × {formatAmount(sel.price)}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">{t('Cancel')}</button>
              <button
                onClick={() => sel && onConfirm(sel, newAmount)}
                disabled={!sel}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {t('Confirm change')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </Portal>
  );
}

/** Modal to extend a stay by N nights — previews the new check-out + total. */
function ExtendStayDialog({
  reservation: r,
  formatDateTimeLong,
  onClose,
  onConfirm,
}: {
  reservation: Reservation;
  formatDateTimeLong: (v: string) => string;
  onClose: () => void;
  onConfirm: (payload: { checkOut: string; nights: number; amount: number; rateType?: RateType; mode: 'night' | 'session'; converted: boolean; extra: number }) => void;
}) {
  const { t } = useTranslation();
  const roomTypes = useHotel((s) => s.roomTypes);
  const rt = roomTypes.find((x) => x.name === r.roomType);

  // The booking can be extended by night or by session. The unit defaults to
  // the booking's own type, but the manager can switch — e.g. add a few hours
  // (a session) to an overnight stay, or turn a day-use booking into an
  // overnight one.
  const bookingIsSession = isDayUse(r.rateType);
  const [mode, setMode] = useState<'night' | 'session'>(bookingIsSession ? 'session' : 'night');
  const [extra, setExtra] = useState(1);

  // Rates come from the room type (the current published price), falling back
  // to values derived from the booking when the room type can't be found.
  const nightlyRate = rt?.regularPrice || (r.nights > 0 ? Math.round(r.amount / r.nights) : r.amount);
  const sessionRate = rt?.sessionPrice || r.amount;
  const sessionLen = rt?.sessionHours || Math.max(1, differenceInHours(new Date(r.checkOut), new Date(r.checkIn)));
  const bookedHours = Math.max(1, differenceInHours(new Date(r.checkOut), new Date(r.checkIn)));

  // Extending a day-use booking by night converts it into an overnight stay.
  const converting = bookingIsSession && mode === 'night';

  let newCheckOut: string;
  let newNights: number;
  let newAmount: number;
  let newRateType: RateType | undefined;
  if (mode === 'session') {
    // Add session blocks — push the check-out time forward; nights unchanged.
    newCheckOut = addHours(new Date(r.checkOut), extra * sessionLen).toISOString();
    newNights = r.nights;
    newAmount = r.amount + sessionRate * extra;
    newRateType = undefined;
  } else if (converting) {
    // Day-use → overnight: reprice at the nightly rate, standard noon check-out.
    const noon = new Date(r.checkIn);
    noon.setHours(12, 0, 0, 0);
    newCheckOut = addDays(noon, extra).toISOString();
    newNights = extra;
    newAmount = nightlyRate * extra;
    newRateType = 'Regular';
  } else {
    // Overnight stay — add nights.
    newCheckOut = addDays(new Date(r.checkOut), extra).toISOString();
    newNights = r.nights + extra;
    newAmount = r.amount + nightlyRate * extra;
    newRateType = undefined;
  }

  const delta = newAmount - r.amount;
  const unitPrice = mode === 'session' ? sessionRate : nightlyRate;
  const unitLabel = mode === 'session' ? (extra === 1 ? t('session') : t('sessions')) : (extra === 1 ? t('night') : t('nights'));
  const resultOvernight = newNights > 0;
  // Session blocks can push the check-out past midnight onto a later day.
  const crossesMidnight = mode === 'session' && !isSameDay(new Date(r.checkOut), new Date(newCheckOut));

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
        />
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md bg-white rounded-md border border-[var(--border-default)] shadow-[0_16px_48px_rgba(44,38,39,0.22)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--surface-subtle)]">
            <div>
              <h3 className="text-base font-medium text-[var(--text-primary)]">{converting ? t('Convert to overnight') : mode === 'session' ? t('Extend session') : t('Extend stay')}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {converting
                  ? <>{t('Turn')} {r.guestName}{t("'s day-use booking into an overnight stay.")}</>
                  : mode === 'session'
                    ? <>{t('Add more time to')} {r.guestName}{t("'s booking.")}</>
                    : <>{t('Add more nights to')} {r.guestName}{t("'s stay.")}</>}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 -mr-1 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer" aria-label={t('Close')}><X className="w-4 h-4" /></button>
          </div>

          {/* Current */}
          <div className="px-5 py-2.5 bg-[var(--surface-subtle)]/50 border-b border-[var(--surface-subtle)] text-xs text-[var(--text-secondary)]">
            {t('Current check-out')}: <span className="font-medium text-[var(--text-primary)] tabular-nums">{formatDateTimeLong(r.checkOut)}</span> · {bookingIsSession ? `${bookedHours} ${t('hrs')}` : `${r.nights} ${r.nights === 1 ? t('night') : t('nights')}`}
          </div>

          <div className="px-5 py-5">
            {/* Unit toggle — extend by night or by session block. */}
            <div className="inline-flex w-full rounded-md bg-[var(--surface-subtle)] p-0.5 mb-5">
              {(['night', 'session'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setExtra(1); }}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-[5px] transition-colors cursor-pointer ${mode === m ? 'bg-white text-[var(--text-primary)] shadow-[0_1px_2px_rgba(44,38,39,0.08)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
                >
                  {m === 'night' ? t('By night') : t('By session')}
                </button>
              ))}
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text-primary)]">{mode === 'session' ? t('Add sessions') : t('Add nights')}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExtra((n) => Math.max(1, n - 1))}
                  disabled={extra <= 1}
                  className="w-8 h-8 inline-flex items-center justify-center border border-[var(--border-default)] rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={mode === 'session' ? t('Fewer sessions') : t('Fewer nights')}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-lg font-medium text-[var(--text-primary)] tabular-nums">{extra}</span>
                <button
                  onClick={() => setExtra((n) => Math.min(30, n + 1))}
                  disabled={extra >= 30}
                  className="w-8 h-8 inline-flex items-center justify-center border border-[var(--border-default)] rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={mode === 'session' ? t('More sessions') : t('More nights')}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversion / midnight notices */}
            {converting && (
              <div className="mt-4 flex items-start gap-2 px-3 py-2.5 bg-[var(--brand-tint)] border border-[var(--brand-border)] rounded-md">
                <ArrowLeftRight className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[var(--text-primary)] leading-relaxed">{t('This converts the day-use booking into an overnight stay, repriced at the nightly rate.')}</p>
              </div>
            )}
            {crossesMidnight && (
              <div className="mt-4 flex items-start gap-2 px-3 py-2.5 bg-[var(--color-data-orange-10)] border border-[var(--color-data-orange-20)] rounded-md">
                <TriangleAlert className="w-3.5 h-3.5 text-[var(--color-data-orange-50)] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[var(--text-primary)] leading-relaxed">{t('This runs past midnight — check-out lands on')} <span className="font-medium tabular-nums">{formatDateTimeLong(newCheckOut)}</span>.</p>
              </div>
            )}

            {/* Preview */}
            <div className="mt-5 rounded-md border border-[var(--border-default)] divide-y divide-[var(--surface-subtle)]">
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-xs text-[var(--text-secondary)]">{t('New check-out')}</span>
                <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{formatDateTimeLong(newCheckOut)}</span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-xs text-[var(--text-secondary)]">{resultOvernight ? t('Total nights') : t('Total time')}</span>
                <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">{resultOvernight ? `${newNights} ${newNights === 1 ? t('night') : t('nights')}` : `${bookedHours + extra * sessionLen} ${t('hrs')}`}</span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-xs text-[var(--text-secondary)]">{t('New total')}</span>
                <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">
                  {formatAmount(newAmount)} <span className={`font-normal ${delta >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{delta >= 0 ? '+' : '−'}{formatAmount(Math.abs(delta))}</span>
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-2 tabular-nums">{converting ? `${extra} ${unitLabel} × ${formatAmount(unitPrice)}/${t('night')}` : `+${extra} ${unitLabel} × ${formatAmount(unitPrice)}/${mode === 'session' ? t('session') : t('night')}`}</p>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-[var(--surface-subtle)] flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">{t('Cancel')}</button>
            <button
              onClick={() => onConfirm({ checkOut: newCheckOut, nights: newNights, amount: newAmount, rateType: newRateType, mode, converted: converting, extra })}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              {converting ? t('Convert to overnight') : t('Confirm extension')}
            </button>
          </div>
        </motion.div>
      </div>
    </Portal>
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
