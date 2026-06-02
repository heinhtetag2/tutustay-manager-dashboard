import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { X, Send, ShieldCheck, Calendar as CalendarIcon } from 'lucide-react';
import { SideSheet } from '@/shared/ui/side-sheet';
import { Portal } from '@/shared/ui/portal';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import { ROOM_TYPES, type Coupon, type DiscountType } from './coupons-data';
import { useCoupons } from './use-coupons';

const INPUT_CLS =
  'w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]';

interface Draft {
  code: string;
  description: string;
  discountType: DiscountType;
  value: string;
  minSpend: string;
  startsAt: string;
  expiresAt: string;
  roomTypes: string[];
  usageLimit: string;
}

const EMPTY_DRAFT: Draft = {
  code: '',
  description: '',
  discountType: 'Percentage',
  value: '',
  minSpend: '',
  startsAt: '2026-06-02',
  expiresAt: '2026-07-02',
  roomTypes: [],
  usageLimit: '',
};

function draftFromCoupon(c: Coupon): Draft {
  return {
    code: c.code,
    description: c.description,
    discountType: c.discountType,
    value: String(c.value),
    minSpend: c.minSpend ? String(c.minSpend) : '',
    startsAt: c.startsAt.slice(0, 10),
    expiresAt: c.expiresAt.slice(0, 10),
    roomTypes: c.roomTypes,
    usageLimit: c.usageLimit ? String(c.usageLimit) : '',
  };
}

/** Create/edit coupon side sheet. Pass `coupon` to edit, or `null` to create. */
export function CouponFormSheet({ coupon, onClose }: { coupon: Coupon | null; onClose: () => void }) {
  const { t } = useTranslation();
  const addCoupon = useCoupons((s) => s.addCoupon);
  const updateCoupon = useCoupons((s) => s.updateCoupon);
  const [draft, setDraft] = useState<Draft>(() => (coupon ? draftFromCoupon(coupon) : EMPTY_DRAFT));

  const canSave =
    draft.code.trim().length > 0 &&
    Number(draft.value) > 0 &&
    draft.startsAt !== '' &&
    draft.expiresAt !== '';

  const toggleRoomType = (rt: string) =>
    setDraft((d) => ({
      ...d,
      roomTypes: d.roomTypes.includes(rt) ? d.roomTypes.filter((x) => x !== rt) : [...d.roomTypes, rt],
    }));

  const save = () => {
    if (!canSave) return;
    const payload = {
      code: draft.code.trim().toUpperCase(),
      description: draft.description.trim(),
      discountType: draft.discountType,
      value: Number(draft.value),
      minSpend: Number(draft.minSpend) || 0,
      startsAt: draft.startsAt,
      expiresAt: draft.expiresAt,
      roomTypes: draft.roomTypes,
      usageLimit: Number(draft.usageLimit) || 0,
      // Hotel-created/edited coupons go to the super-admin for review before going live.
      approval: 'Pending' as const,
      submittedAt: new Date().toISOString(),
      reviewNote: undefined,
    };
    if (coupon) updateCoupon(coupon.id, payload);
    else addCoupon({ ...payload, enabled: true });
    onClose();
  };

  return (
    <SideSheet onClose={onClose}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)] shrink-0">
        <div>
          <h2 className="text-base font-medium text-[var(--text-primary)]">{coupon ? t('Edit coupon') : t('New coupon')}</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{coupon ? t('Changes are re-sent to the super-admin for approval.') : t('New coupons are sent to the super-admin for approval before going live.')}</p>
        </div>
        <button onClick={onClose} className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <Field label={t('Coupon code')}>
          <input
            type="text"
            value={draft.code}
            onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value.toUpperCase() }))}
            placeholder="SUMMER25"
            className={`${INPUT_CLS} uppercase`}
          />
        </Field>

        <Field label={t('Description')}>
          <input
            type="text"
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder={t('What this coupon is for')}
            className={INPUT_CLS}
          />
        </Field>

        <Field label={t('Discount type')}>
          <div className="grid grid-cols-2 gap-2">
            {(['Percentage', 'Fixed'] as DiscountType[]).map((dt) => {
              const on = draft.discountType === dt;
              return (
                <button
                  key={dt}
                  onClick={() => setDraft((d) => ({ ...d, discountType: dt }))}
                  className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors cursor-pointer ${on ? 'border-[var(--brand-primary)] bg-[var(--brand-tint)] text-[var(--brand-primary)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]'}`}
                >
                  {dt === 'Percentage' ? t('Percentage') : t('Fixed amount')}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={draft.discountType === 'Percentage' ? t('Discount (%)') : t('Discount amount')}>
            <input
              type="number"
              min={0}
              value={draft.value}
              onChange={(e) => setDraft((d) => ({ ...d, value: e.target.value }))}
              placeholder={draft.discountType === 'Percentage' ? '25' : '50000'}
              className={`${INPUT_CLS} tabular-nums`}
            />
          </Field>
          <Field label={t('Minimum spend')}>
            <input
              type="number"
              min={0}
              value={draft.minSpend}
              onChange={(e) => setDraft((d) => ({ ...d, minSpend: e.target.value }))}
              placeholder="0"
              className={`${INPUT_CLS} tabular-nums`}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t('Starts')}>
            <DateField value={draft.startsAt} onChange={(v) => setDraft((d) => ({ ...d, startsAt: v }))} />
          </Field>
          <Field label={t('Expires')}>
            <DateField value={draft.expiresAt} onChange={(v) => setDraft((d) => ({ ...d, expiresAt: v }))} />
          </Field>
        </div>

        <Field label={t('Applies to')} hint={t('Leave all unselected to apply to every room type.')}>
          <div className="flex flex-wrap gap-2">
            {ROOM_TYPES.map((rt) => {
              const on = draft.roomTypes.includes(rt);
              return (
                <button
                  key={rt}
                  onClick={() => toggleRoomType(rt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${on ? 'border-[var(--brand-primary)] bg-[var(--brand-tint)] text-[var(--brand-primary)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]'}`}
                >
                  {t(rt)}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label={t('Usage limit')} hint={t('Leave blank for unlimited redemptions.')}>
          <input
            type="number"
            min={0}
            value={draft.usageLimit}
            onChange={(e) => setDraft((d) => ({ ...d, usageLimit: e.target.value }))}
            placeholder={t('Unlimited')}
            className={`${INPUT_CLS} tabular-nums`}
          />
        </Field>
      </div>

      <div className="px-6 py-4 border-t border-[var(--surface-subtle)] shrink-0">
        <div className="flex items-start gap-2 mb-3 text-xs text-[var(--text-secondary)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
          <span>{t('This coupon will be submitted to the super-admin and goes live once approved.')}</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">{t('Cancel')}</button>
          <button
            onClick={save}
            disabled={!canSave}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {coupon ? t('Submit changes') : t('Submit for approval')}
          </button>
        </div>
      </div>
    </SideSheet>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-[var(--text-tertiary)] mt-1.5">{hint}</p>}
    </div>
  );
}

/** Date picker that matches the design system — opens the shared brand calendar.
 *  Rendered in a Portal with fixed positioning so it's never clipped by the
 *  sheet's scroll area / footer, and flips above the field when space is tight. */
function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; openUp: boolean }>({ left: 0, top: 0, openUp: false });
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;

  const CAL_HEIGHT = 360;
  const CAL_WIDTH = 300;

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const openUp = r.bottom + CAL_HEIGHT > window.innerHeight - 12;
      setPos({
        left: Math.min(r.left, window.innerWidth - CAL_WIDTH - 12),
        top: openUp ? r.top - 6 : r.bottom + 6,
        openUp,
      });
    }
    setOpen((o) => !o);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className={`${INPUT_CLS} flex items-center justify-between gap-2 cursor-pointer ${value ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
      >
        <span className="tabular-nums">{selected ? format(selected, 'MMM d, yyyy') : t('Select date')}</span>
        <CalendarIcon className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
      </button>
      {open && (
        <Portal>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[61] bg-white border border-[var(--border-default)] rounded-md p-3 shadow-[0_8px_28px_rgba(44,38,39,0.14)]"
            style={{
              left: pos.left,
              top: pos.top,
              transform: pos.openUp ? 'translateY(-100%)' : 'none',
              '--primary': 'var(--brand-primary)',
              '--primary-foreground': '#FFFFFF',
            } as React.CSSProperties}
          >
            <CalendarUI
              mode="single"
              defaultMonth={selected}
              selected={selected}
              onSelect={(d) => {
                if (d) {
                  onChange(format(d, 'yyyy-MM-dd'));
                  setOpen(false);
                }
              }}
              className="border-0 shadow-none p-0"
            />
          </div>
        </Portal>
      )}
    </>
  );
}
