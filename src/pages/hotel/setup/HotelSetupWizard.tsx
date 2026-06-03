import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  X,
  ArrowLeft,
  Building2,
  Hotel,
  ConciergeBell,
  Umbrella,
  Sofa,
  Car,
  Landmark,
  Check,
  MapPin,
  ScrollText,
  Briefcase,
  Star,
  Upload,
  Trash2,
  Image as ImageIcon,
  Pencil,
  ChevronDown,
  Wifi,
  Croissant,
  SquareParking,
  Waves,
  Dumbbell,
  Flower2,
  Banknote,
  Plane,
  Coffee,
  type LucideIcon,
} from 'lucide-react';

import { BrandSelect } from '@/shared/ui/brand-select';
import { ImageCropper } from '@/pages/agents/ImageCropper';
import setupIllustration from '@/assets/illustrations/treasure-chest.svg';
import kbzpayLogo from '@/assets/logos/banks/kbzpay.webp';
import uabLogo from '@/assets/logos/banks/uab.webp';
import { useHotel } from '../use-hotel';
import {
  AMENITIES,
  ACCOMMODATION_TYPES,
  type ContractStatus,
  type Property,
} from '../hotel-data';
import { SetupField, AdditionalInputs, StepHeader, setupInput } from './setup-fields';
import { MapPicker } from './MapPicker';
import { TimePicker } from './TimePicker';
import { DatePicker } from './DatePicker';

type TFn = ReturnType<typeof useTranslation>['t'];
type Patch = (patch: Partial<Property>) => void;

interface StepProps {
  draft: Property;
  set: Patch;
  t: TFn;
  showErrors: boolean;
  errors: Record<string, string>;
}

const STEPS = [
  { key: 'basic', title: 'Tell us about your property', lead: 'The essentials guests see first — your name, photo, and rating.', Icon: Building2 },
  { key: 'type', title: 'What type of property is it?', lead: 'Pick the category that best describes your place — it shapes how guests find and filter you.', Icon: Hotel },
  { key: 'address', title: 'Confirm your address', lead: "Enter your property's detailed address. If it isn't clear and accurate on the map, guests will struggle to find you.", Icon: MapPin },
  { key: 'policies', title: 'Policies & amenities', lead: 'Set guest expectations for arrival and stay.', Icon: ScrollText },
  { key: 'owner', title: 'Owner, business & contract', lead: 'The legal entity behind the property, your verification document, and the contract terms.', Icon: Briefcase },
  { key: 'banking', title: 'Set up your settlement', lead: 'Tell us how bookings are settled and which bank account to use. You can set this up later if you prefer.', Icon: Landmark },
] as const;

/**
 * Settlement banks the property can be paid out to.
 * Drop logo files into src/assets/logos/banks/ (e.g. kbz.svg), import them at
 * the top of this file, and set `logo` below. Until then the Landmark icon shows.
 */
const BANK_OPTIONS: { name: string; subtitle: string; logo?: string }[] = [
  { name: 'KBZPay', subtitle: 'KBZ mobile wallet', logo: kbzpayLogo },
  { name: 'UAB Bank', subtitle: 'uab pay · online banking', logo: uabLogo },
  { name: 'Other bank', subtitle: 'Add any local bank account' },
];

const FOREIGN_POLICIES = ['Foreigners welcome', 'Locals only (no foreigners)'] as const;
const BREAKFAST_POLICIES = ['Free breakfast included', 'Breakfast available (paid)', 'No breakfast'] as const;
const DOCUMENT_TYPES = ['Business license', 'Hotel license', 'Company registration', 'Other'] as const;
const SETTLE_METHODS = [
  { value: 'Prepaid', desc: 'Guests pay TutuStay upfront; we settle to you on schedule.' },
  { value: 'Postpaid', desc: 'You collect from guests, then settle commission with TutuStay.' },
] as const;

/** Per-accommodation-type card metadata: icon + a one-line description. */
const TYPE_META: Record<string, { Icon: LucideIcon; headline: string; desc: string; tint: string; fg: string }> = {
  'Hotel': { Icon: ConciergeBell, headline: 'Full-service hotel', desc: 'Reception, daily housekeeping, and on-site staff looking after every guest.', tint: '#f1ebfe', fg: '#7c3aed' },
  'Resort': { Icon: Umbrella, headline: 'Leisure resort', desc: 'A destination in itself — on-site dining, pools, and things to do all day.', tint: '#fff0e1', fg: '#ea580c' },
  'Guesthouse': { Icon: Sofa, headline: 'Cosy guesthouse', desc: 'Smaller and more personal, with a warm, host-led feel for your guests.', tint: 'var(--color-data-green-10)', fg: 'var(--color-data-green-60)' },
  'Motel': { Icon: Car, headline: 'Roadside motel', desc: 'Simple rooms with easy parking — ideal for short stops and road trips.', tint: '#fdeaea', fg: '#dc2626' },
};

const AMENITY_ICONS: Record<string, LucideIcon> = {
  'WiFi': Wifi,
  'Breakfast': Croissant,
  'Parking': SquareParking,
  'Swimming Pool': Waves,
  'Fitness Centre/Gym': Dumbbell,
  'SPA & Wellness Centre': Flower2,
  'Currency Exchange & ATM': Banknote,
  'Airport Pickup': Plane,
  'Cafe': Coffee,
};

/** Required-field validation per step. Returns a field→message map. */
function validate(step: number, d: Property, t: TFn): Record<string, string> {
  const req = t('Required');
  const e: Record<string, string> = {};
  if (step === 0) {
    if (!d.name.trim()) e.name = req;
    if (d.starRating < 1) e.starRating = t('Select a star rating');
  } else if (step === 1) {
    if (!d.accommodationType) e.accommodationType = t('Choose a property type');
  } else if (step === 2) {
    if (!d.country.trim()) e.country = req;
    if (!d.state.trim()) e.state = req;
    if (!d.district.trim()) e.district = req;
    if (!d.township.trim()) e.township = req;
    if (!d.address.trim()) e.address = req;
    if (d.latitude == null || d.longitude == null) e.map = t('Drop a pin on the map');
  } else if (step === 3) {
    if (!d.checkInTime.trim()) e.checkInTime = req;
    if (!d.checkOutTime.trim()) e.checkOutTime = req;
  } else if (step === 4) {
    if (!d.representativeName.trim()) e.representativeName = req;
    if (!d.companyName.trim()) e.companyName = req;
  }
  return e;
}

export function HotelSetupWizard({ onClose, initialStep = 0 }: { onClose: () => void; initialStep?: number }) {
  const { t, i18n } = useTranslation();
  const { property, updateProperty } = useHotel();
  const [step, setStep] = useState(() => Math.min(Math.max(initialStep, 0), STEPS.length - 1));
  const [draft, setDraft] = useState<Property>(() => ({ ...property }));
  const [showErrors, setShowErrors] = useState(false);
  const [done, setDone] = useState(false);

  const set: Patch = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const errors = useMemo(() => validate(step, draft, t), [step, draft, t]);
  const canProceed = Object.keys(errors).length === 0;
  const isLast = step === STEPS.length - 1;

  const goNext = () => {
    if (!canProceed) {
      setShowErrors(true);
      return;
    }
    if (isLast) {
      updateProperty(draft);
      setDone(true);
      return;
    }
    setShowErrors(false);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const goBack = () => {
    setShowErrors(false);
    setStep((s) => Math.max(0, s - 1));
  };
  // Advance past an optional step; on the last step this finishes setup.
  const goSkip = () => {
    setShowErrors(false);
    if (isLast) {
      updateProperty(draft);
      setDone(true);
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const isSkippable = STEPS[step].key === 'banking';

  // Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const stepProps: StepProps = { draft, set, t, showErrors, errors };

  if (done) return <SetupSuccess t={t} name={draft.name} onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-40 bg-[var(--surface-muted)] flex flex-col">
      {/* Top bar */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 md:px-10 bg-[var(--surface-muted)]">
        <div aria-label="Logo placeholder" className="h-9 w-24 border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] rounded-md flex items-center justify-center text-[10px] font-medium tracking-wide text-[var(--text-secondary)] select-none">
          LOGO
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              aria-label={t('Display language')}
              className="appearance-none bg-white border border-[var(--border-default)] rounded-md pl-3 pr-7 py-1.5 text-xs font-medium text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="ko">KO</option>
              <option value="my">MY</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)] pointer-events-none" />
          </div>
          <button type="button" onClick={onClose} aria-label={t('Close')} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Body: form with the illustration peeking bottom-right behind it */}
      <div className="flex-1 relative min-h-0">
        {/* Illustration overlay — desktop only, behind the form content */}
        <img
          src={setupIllustration}
          alt=""
          aria-hidden
          className="hidden lg:block pointer-events-none select-none absolute bottom-0 right-0 z-0 w-[32%] max-w-[360px] xl:max-w-[420px] h-auto"
        />
        {/* The form */}
        <div className="h-full overflow-y-auto relative z-10">
          <div className={`w-full ${STEPS[step].key === 'type' ? 'max-w-none px-6 md:px-10 lg:px-14' : STEPS[step].key === 'banking' ? 'max-w-4xl px-6 md:px-10 lg:px-14' : 'max-w-2xl px-6 md:px-12 lg:px-16'} pt-4 md:pt-5 pb-10 md:pb-12`}>
            <button
              type="button"
              onClick={step === 0 ? onClose : goBack}
              className="-ml-2 mb-6 inline-flex items-center justify-center w-9 h-9 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
              aria-label={t('Back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--text-tertiary)] mb-3">{t('Step')} {step + 1} {t('of')} {STEPS.length}</div>
            <h1 className="text-2xl md:text-3xl font-serif text-[var(--text-primary)] leading-snug">{t(STEPS[step].title)}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{t(STEPS[step].lead)}</p>

            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 space-y-5"
            >
              {step === 0 && <BasicInfoStep {...stepProps} />}
              {step === 1 && <AccommodationTypeStep {...stepProps} />}
              {step === 2 && <AddressStep {...stepProps} />}
              {step === 3 && <PoliciesStep {...stepProps} />}
              {step === 4 && <OwnerStep {...stepProps} />}
              {step === 5 && <BankingStep {...stepProps} />}
            </motion.div>

            {/* Action */}
            <div className="mt-10 flex items-center gap-3">
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center justify-center px-12 py-3 text-sm font-medium text-white bg-[var(--text-primary)] rounded-md hover:bg-[var(--text-primary)]/90 transition-colors cursor-pointer"
              >
                {isLast ? t('Finish setup') : t('Continue')}
              </button>
              {isSkippable && (
                <button
                  type="button"
                  onClick={goSkip}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-[var(--text-primary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                >
                  {t('Skip for now')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Steps ----------------------------- */

function BasicInfoStep({ draft, set, t, showErrors, errors }: StepProps) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const err = (k: string) => (showErrors ? errors[k] : undefined);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') setCropSrc(reader.result); };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Photo */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('Hotel photo')}</label>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-md bg-white border border-[var(--border-default)] overflow-hidden flex items-center justify-center shrink-0 text-[var(--text-secondary)]">
            {draft.photoUrl ? <img src={draft.photoUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6" strokeWidth={1.5} />}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)]">{t('Upload a JPG or PNG up to 5MB.')}</p>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onFile} />
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
                {t('Upload image')}
              </button>
              {draft.photoUrl && (
                <button type="button" onClick={() => set({ photoUrl: undefined })} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--danger)] hover:underline cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                  {t('Remove')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <SetupField
        label={t('Hotel or property name')}
        hint={t('The official name guests will recognise.')}
        required
        error={err('name')}
      >
        <input
          className={setupInput}
          maxLength={120}
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder={t('e.g. Aurora Hotel')}
        />
      </SetupField>

      <SetupField label={t('Description')} hint={t('A short summary guests see on your listing.')}>
        <textarea
          className={`${setupInput} min-h-[88px] resize-none`}
          maxLength={400}
          value={draft.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder={t('e.g. A riverside hotel with skyline views and a rooftop pool.')}
        />
      </SetupField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
        <SetupField label={t('Star rating')} hint={t('Official or self-assessed star class.')} required error={err('starRating')}>
          <div className="flex items-center gap-1 h-[42px]">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => set({ starRating: n })} className="p-0.5 cursor-pointer" aria-label={`${n} ${t('stars')}`}>
                <Star className={`w-6 h-6 transition-colors ${n <= draft.starRating ? 'text-[var(--color-data-yellow-40)] fill-[var(--color-data-yellow-40)]' : 'text-[var(--border-strong)]'}`} />
              </button>
            ))}
          </div>
        </SetupField>
        <SetupField label={t('Number of guest rooms')} hint={t('Total rooms available to book.')}>
          <input
            type="number"
            min={0}
            className={setupInput}
            value={draft.guestRooms || ''}
            onChange={(e) => set({ guestRooms: Number(e.target.value) })}
            placeholder={t('e.g. 40')}
          />
        </SetupField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
        <SetupField label={t('Contact number')} hint={t('Main reception line for guests.')}>
          <input className={setupInput} value={draft.contactNumber} onChange={(e) => set({ contactNumber: e.target.value })} placeholder={t('e.g. 09 77 25 85 55 55')} />
        </SetupField>
        <SetupField label={t('Contact email')} hint={t('Where booking enquiries are sent.')}>
          <input type="email" className={setupInput} value={draft.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} placeholder={t('e.g. hello@hotel.com')} />
        </SetupField>
      </div>

      {cropSrc && <ImageCropper src={cropSrc} onCancel={() => setCropSrc(null)} onSave={(url) => { set({ photoUrl: url }); setCropSrc(null); }} />}
    </>
  );
}

function AccommodationTypeStep({ draft, set, t, showErrors, errors }: StepProps) {
  const error = showErrors ? errors.accommodationType : undefined;
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ACCOMMODATION_TYPES.map((type) => {
          const meta = TYPE_META[type];
          const Icon = meta?.Icon ?? Building2;
          const selected = draft.accommodationType === type;
          return (
            <div
              key={type}
              className="flex flex-col rounded-md border border-[var(--border-default)] bg-white p-5 min-h-[280px]"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${selected ? '' : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]'}`}
                  style={selected ? { backgroundColor: meta?.tint, color: meta?.fg } : undefined}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)] truncate">{t(type)}</span>
              </div>
              <h4 className="text-base font-semibold text-[var(--text-primary)] leading-snug">{t(meta?.headline ?? '')}</h4>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed flex-1">{t(meta?.desc ?? '')}</p>
              <button
                type="button"
                onClick={() => set({ accommodationType: type })}
                aria-pressed={selected}
                className={`mt-5 w-full py-2 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                  selected
                    ? 'bg-[var(--success-tint)] text-[var(--success)] border-[var(--success)]'
                    : 'bg-white text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--surface-subtle)]'
                }`}
              >
                {selected ? t('Selected') : t('Select')}
              </button>
            </div>
          );
        })}
      </div>
      {error && <p className="text-xs text-[var(--danger)] mt-3">{error}</p>}
    </div>
  );
}

function BankingStep({ draft, set, t }: StepProps) {
  const [agreed, setAgreed] = useState(true);
  const postpaid = draft.settleMethod === 'Postpaid';
  const bankHeading = postpaid ? t('Where commission is settled from') : t('Where we send your payouts');
  const consentText = postpaid
    ? t('I confirm this account belongs to the property owner and authorise TutuStay to collect the agreed commission from it. You can change these details anytime in Settings.')
    : t('I confirm this account belongs to the property owner and authorise TutuStay to send all booking settlements to it. Payouts follow the agreed commission and settlement schedule, and you can change these details anytime in Settings.');
  return (
    <div>
      {/* Settlement method */}
      <div className="text-sm font-medium text-[var(--text-primary)] mb-3">{t('How are bookings settled?')}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-w-2xl">
        {SETTLE_METHODS.map((m) => {
          const selected = draft.settleMethod === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => set({ settleMethod: m.value })}
              aria-pressed={selected}
              className={`flex items-start gap-3 text-left rounded-md border bg-white p-4 transition-colors cursor-pointer ${
                selected ? 'border-[var(--brand-primary)]' : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
              }`}
            >
              <span
                className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  selected ? 'border-[var(--brand-primary)]' : 'border-[var(--border-strong)]'
                }`}
              >
                {selected && <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-primary)]" />}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)]">{t(m.value)}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">{t(m.desc)}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{bankHeading}</div>
      <div className="text-xs text-[var(--text-secondary)] mb-3">{t('Choose your settlement bank')}</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {BANK_OPTIONS.map((bank) => {
          const selected = draft.settlementBank === bank.name;
          return (
            <button
              key={bank.name}
              type="button"
              onClick={() => set({ settlementBank: selected ? '' : bank.name })}
              aria-pressed={selected}
              className={`flex items-center gap-3 text-left rounded-md border bg-white p-4 transition-colors cursor-pointer ${
                selected
                  ? 'border-[var(--brand-primary)]'
                  : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden transition-colors ${bank.logo ? '' : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]'}`}>
                {bank.logo ? <img src={bank.logo} alt="" className="w-9 h-9 object-contain" /> : <Landmark className="w-5 h-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{bank.name}</div>
                <div className="text-xs text-[var(--text-secondary)] truncate">{bank.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Consent */}
      <label className="flex items-start gap-2.5 mt-20 cursor-pointer select-none">
        <span className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="peer sr-only"
          />
          <span
            className={`w-5 h-5 rounded-[5px] flex items-center justify-center border transition-colors ${
              agreed
                ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
                : 'bg-white border-[var(--border-strong)]'
            }`}
          >
            {agreed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
          </span>
        </span>
        <span className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          {consentText}{' '}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="font-medium text-[var(--text-primary)] underline underline-offset-2 hover:text-[var(--brand-primary)] transition-colors"
          >
            {t('Learn more about payout terms')}
          </a>
        </span>
      </label>
    </div>
  );
}

function AddressStep({ draft, set, t, showErrors, errors }: StepProps) {
  const err = (k: string) => (showErrors ? errors[k] : undefined);
  return (
    <>
      <SetupField label={t('Country')} required error={err('country')}>
        <BrandSelect
          value={draft.country}
          onValueChange={(v) => set({ country: v })}
          options={['Myanmar', 'Thailand', 'Singapore', 'Malaysia', 'Vietnam'].map((c) => ({ value: c, label: t(c) }))}
        />
      </SetupField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
        <SetupField label={t('State / Region')} required error={err('state')}>
          <input className={setupInput} value={draft.state} onChange={(e) => set({ state: e.target.value })} placeholder={t('e.g. Nay Pyi Taw')} />
        </SetupField>
        <SetupField label={t('District')} required error={err('district')}>
          <input className={setupInput} value={draft.district} onChange={(e) => set({ district: e.target.value })} placeholder={t('e.g. Pyinmana')} />
        </SetupField>
      </div>

      <SetupField label={t('Township')} required error={err('township')}>
        <input className={setupInput} value={draft.township} onChange={(e) => set({ township: e.target.value })} placeholder={t('e.g. Pyinmana')} />
      </SetupField>

      <SetupField
        label={t('Street address')}
        hint={t('Building number, street, and any landmark.')}
        required
        error={err('address')}
      >
        <textarea
          className={`${setupInput} resize-none`}
          rows={2}
          maxLength={200}
          value={draft.address}
          onChange={(e) => set({ address: e.target.value })}
          placeholder={t('e.g. No. 20 Kyat Kone Street')}
        />
      </SetupField>

      <SetupField label={t('Pin on map')} hint={t('Drag the pin to your exact location.')} required error={err('map')}>
        <MapPicker
          lat={draft.latitude}
          lng={draft.longitude}
          onChange={(lat, lng) => set({ latitude: lat, longitude: lng })}
        />
      </SetupField>
    </>
  );
}

function PoliciesStep({ draft, set, t, showErrors, errors }: StepProps) {
  const err = (k: string) => (showErrors ? errors[k] : undefined);
  const toggle = (a: string) =>
    set({ mainAmenities: draft.mainAmenities.includes(a) ? draft.mainAmenities.filter((x) => x !== a) : [...draft.mainAmenities, a] });

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
        <SetupField label={t('Check-in time')} required error={err('checkInTime')}>
          <TimePicker value={draft.checkInTime} onChange={(v) => set({ checkInTime: v })} ariaLabel={t('Check-in time')} placeholder={t('Select time')} />
        </SetupField>
        <SetupField label={t('Check-out time')} required error={err('checkOutTime')}>
          <TimePicker value={draft.checkOutTime} onChange={(v) => set({ checkOutTime: v })} ariaLabel={t('Check-out time')} placeholder={t('Select time')} />
        </SetupField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
        <SetupField label={t('Foreign guest policy')} hint={t('Whether non-locals can book your property.')}>
          <BrandSelect
            value={draft.foreignPolicy}
            onValueChange={(v) => set({ foreignPolicy: v })}
            options={FOREIGN_POLICIES.map((p) => ({ value: p, label: t(p) }))}
          />
        </SetupField>
        <SetupField label={t('Breakfast policy')} hint={t('What guests can expect for breakfast.')}>
          <BrandSelect
            value={draft.breakfastPolicy}
            onValueChange={(v) => set({ breakfastPolicy: v })}
            options={BREAKFAST_POLICIES.map((p) => ({ value: p, label: t(p) }))}
          />
        </SetupField>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)]">{t('Main amenities')}</label>
        <p className="text-xs text-[var(--text-secondary)] mt-1 mb-3">{t('Highlight what makes your stay stand out.')}</p>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => {
            const on = draft.mainAmenities.includes(a);
            const Icon = AMENITY_ICONS[a];
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggle(a)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-colors cursor-pointer ${
                  on
                    ? 'bg-[var(--text-primary)] text-white border-[var(--text-primary)]'
                    : 'bg-white text-[var(--text-tertiary)] border-[var(--border-default)] hover:bg-[var(--surface-subtle)]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {t(a)}
              </button>
            );
          })}
        </div>
      </div>

      <AdditionalInputs showLabel={t('Show front-desk contact')} hideLabel={t('Hide front-desk contact')}>
        <SetupField label={t('Front desk number')} hint={t('Reachable by guests for arrival questions.')}>
          <input className={setupInput} value={draft.frontDeskNumber} onChange={(e) => set({ frontDeskNumber: e.target.value })} placeholder="097 ..." />
        </SetupField>
        <SetupField label={t('Front desk email')}>
          <input className={setupInput} value={draft.frontDeskEmail} onChange={(e) => set({ frontDeskEmail: e.target.value })} placeholder="frontdesk@hotel.com" />
        </SetupField>
      </AdditionalInputs>
    </>
  );
}

function OwnerStep({ draft, set, t, showErrors, errors }: StepProps) {
  const err = (k: string) => (showErrors ? errors[k] : undefined);
  return (
    <div className="space-y-8">
      {/* Business & verification */}
      <div className="space-y-5">
        <StepHeader title={t('Business & verification')} subtitle={t('The legal entity behind the property and the document we verify it with.')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
          <SetupField label={t('Legal representative / business operator')} required error={err('representativeName')}>
            <input className={setupInput} value={draft.representativeName} onChange={(e) => set({ representativeName: e.target.value })} />
          </SetupField>
          <SetupField label={t('Company name')} required error={err('companyName')}>
            <input className={setupInput} value={draft.companyName} onChange={(e) => set({ companyName: e.target.value })} />
          </SetupField>
          <SetupField label={t('Document type')}>
            <BrandSelect
              value={draft.documentType}
              onValueChange={(v) => set({ documentType: v })}
              options={DOCUMENT_TYPES.map((d) => ({ value: d, label: t(d) }))}
            />
          </SetupField>
          <SetupField label={t('Business registration number')}>
            <input className={setupInput} value={draft.businessRegNumber} onChange={(e) => set({ businessRegNumber: e.target.value })} />
          </SetupField>
          <SetupField label={t('Business location')}>
            <input className={setupInput} value={draft.businessLocation} onChange={(e) => set({ businessLocation: e.target.value })} placeholder={t('e.g. Insein, Yangon')} />
          </SetupField>
          <SetupField label={t('Nature of business')}>
            <input className={setupInput} value={draft.natureOfBusiness} onChange={(e) => set({ natureOfBusiness: e.target.value })} placeholder={t('e.g. Hotel & hospitality')} />
          </SetupField>
        </div>
        <SetupField label={t('Document issue date')}>
          <DatePicker value={draft.documentDate} onChange={(v) => set({ documentDate: v })} ariaLabel={t('Document issue date')} placeholder={t('Select date')} />
        </SetupField>
      </div>

      {/* Contract */}
      <div className="space-y-5">
        <StepHeader title={t('Contract')} subtitle={t('Your commission, the contract term, and who we contact about it.')} />

        <SetupField label={t('Commission rate')} hint={t('Standard commission rate in your region.')}>
          <input
            readOnly
            value={`${draft.commissionRate}%`}
            className={`${setupInput} bg-[var(--surface-subtle)] text-[var(--text-secondary)] cursor-not-allowed`}
          />
        </SetupField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
          <SetupField label={t('Contact person / host name')}>
            <input className={setupInput} value={draft.contactPersonName} onChange={(e) => set({ contactPersonName: e.target.value })} />
          </SetupField>
          <SetupField label={t('Contact person / host email')}>
            <input type="email" className={setupInput} value={draft.contactPersonEmail} onChange={(e) => set({ contactPersonEmail: e.target.value })} placeholder="host@hotel.com" />
          </SetupField>
          <SetupField label={t('Contact person phone')}>
            <input className={setupInput} value={draft.contactPersonPhone} onChange={(e) => set({ contactPersonPhone: e.target.value })} placeholder="09 ..." />
          </SetupField>
          <SetupField label={t('Property contracting people')}>
            <input className={setupInput} value={draft.contractingPeople} onChange={(e) => set({ contractingPeople: e.target.value })} />
          </SetupField>
        </div>

        <SetupField label={t('Contract status')}>
          <BrandSelect
            value={draft.contractStatus}
            onValueChange={(v) => set({ contractStatus: v as ContractStatus })}
            options={(['Pending', 'Approved', 'Rejected'] as ContractStatus[]).map((s) => ({ value: s, label: t(s) }))}
          />
        </SetupField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
          <SetupField label={t('Contract start')}>
            <DatePicker value={draft.contractStart} onChange={(v) => set({ contractStart: v })} ariaLabel={t('Contract start')} placeholder={t('Select date')} />
          </SetupField>
          <SetupField label={t('Contract end date')}>
            <DatePicker value={draft.contractEnd} onChange={(v) => set({ contractEnd: v })} ariaLabel={t('Contract end date')} placeholder={t('Select date')} />
          </SetupField>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Completion screen ----------------------- */

function SetupSuccess({ t, name, onClose }: { t: TFn; name: string; onClose: () => void }) {
  // A few celebratory sparkles around the check, each popping in with a stagger.
  const sparkles = [
    { x: -90, y: -40, s: 8, d: 0.45, c: 'var(--brand-primary)' },
    { x: 96, y: -28, s: 10, d: 0.55, c: 'var(--color-data-yellow-40)' },
    { x: -70, y: 56, s: 7, d: 0.6, c: 'var(--success)' },
    { x: 84, y: 60, s: 9, d: 0.5, c: 'var(--brand-accent)' },
    { x: 0, y: -86, s: 6, d: 0.65, c: 'var(--brand-primary)' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-40 bg-[var(--surface-muted)] flex flex-col items-center justify-center px-6 text-center"
    >
      <div className="relative">
        {sparkles.map((sp, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: sp.d, type: 'spring', duration: 0.6, bounce: 0.6 }}
            className="absolute rounded-full"
            style={{ width: sp.s, height: sp.s, background: sp.c, left: '50%', top: '50%', x: sp.x, y: sp.y }}
          />
        ))}
        {/* Halo + check */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.45 }}
          className="w-28 h-28 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.12, type: 'spring', duration: 0.5, bounce: 0.5 }}
            className="w-18 h-18 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center"
            style={{ width: 72, height: 72 }}
          >
            <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none">
              <motion.path
                d="M5 12.5l4 4 10-11"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.38, duration: 0.4, ease: 'easeOut' }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="text-3xl md:text-4xl font-serif text-[var(--text-primary)] mt-10"
      >
        {t("You're all set!")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed max-w-md"
      >
        {name ? `${name} ${t('is set up and ready to take bookings. You can manage everything from your dashboard.')}` : t('Your property is set up and ready to take bookings. You can manage everything from your dashboard.')}
      </motion.p>
      <motion.button
        type="button"
        onClick={onClose}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="mt-8 inline-flex items-center justify-center px-12 py-3 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
      >
        {t('Go to dashboard')}
      </motion.button>
    </motion.div>
  );
}

