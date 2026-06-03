import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  X,
  ArrowLeft,
  Building2,
  MapPin,
  ScrollText,
  Briefcase,
  ClipboardCheck,
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
import { useHotel } from '../use-hotel';
import {
  AMENITIES,
  ACCOMMODATION_TYPES,
  type ContractStatus,
  type Property,
} from '../hotel-data';
import { SetupField, AdditionalInputs, setupInput } from './setup-fields';
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
  { key: 'basic', title: 'Tell us about your property', lead: 'The essentials guests see first — your name, accommodation type, and rating.', Icon: Building2 },
  { key: 'address', title: 'Confirm your address', lead: "Enter your property's detailed address. If it isn't clear and accurate on the map, guests will struggle to find you.", Icon: MapPin },
  { key: 'policies', title: 'Policies & amenities', lead: 'Set guest expectations for arrival and stay.', Icon: ScrollText },
  { key: 'owner', title: 'Owner & contract', lead: 'Who operates this property and the terms of your agreement.', Icon: Briefcase },
  { key: 'review', title: 'Review your details', lead: 'Check everything looks right, then finish setup.', Icon: ClipboardCheck },
] as const;

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
    if (!d.accommodationType) e.accommodationType = req;
    if (d.starRating < 1) e.starRating = t('Select a star rating');
  } else if (step === 1) {
    if (!d.country.trim()) e.country = req;
    if (!d.state.trim()) e.state = req;
    if (!d.district.trim()) e.district = req;
    if (!d.township.trim()) e.township = req;
    if (!d.address.trim()) e.address = req;
    if (d.latitude == null || d.longitude == null) e.map = t('Drop a pin on the map');
  } else if (step === 2) {
    if (!d.checkInTime.trim()) e.checkInTime = req;
    if (!d.checkOutTime.trim()) e.checkOutTime = req;
  } else if (step === 3) {
    if (!d.representativeName.trim()) e.representativeName = req;
    if (!d.companyName.trim()) e.companyName = req;
  }
  return e;
}

export function HotelSetupWizard({ onClose }: { onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const { property, updateProperty } = useHotel();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Property>(() => ({ ...property }));
  const [showErrors, setShowErrors] = useState(false);

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
      onClose();
      return;
    }
    setShowErrors(false);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const goBack = () => {
    setShowErrors(false);
    setStep((s) => Math.max(0, s - 1));
  };
  const jumpTo = (i: number) => {
    setShowErrors(false);
    setStep(i);
  };

  // Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const stepProps: StepProps = { draft, set, t, showErrors, errors };

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

      {/* Body: form (left) + setup guide (right) */}
      <div className="flex-1 flex min-h-0">
        {/* The form */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="w-full max-w-2xl px-6 md:px-12 lg:px-16 pt-4 md:pt-5 pb-10 md:pb-12">
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
              {step === 1 && <AddressStep {...stepProps} />}
              {step === 2 && <PoliciesStep {...stepProps} />}
              {step === 3 && <OwnerStep {...stepProps} />}
              {step === 4 && <ReviewStep draft={draft} t={t} onEdit={jumpTo} />}
            </motion.div>

            {/* Action */}
            <div className="mt-10">
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center justify-center px-12 py-3 text-sm font-medium text-white bg-[var(--text-primary)] rounded-md hover:bg-[var(--text-primary)]/90 transition-colors cursor-pointer"
              >
                {isLast ? t('Finish setup') : t('Continue')}
              </button>
            </div>
          </div>
        </div>

        {/* Right: illustration only (desktop only) */}
        <div className="hidden lg:flex flex-1 items-end justify-end px-10 xl:px-20 py-12 pointer-events-none">
          <img src={setupIllustration} alt="" className="w-[85%] max-w-[340px] xl:w-[60%] xl:max-w-[400px] h-auto" />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
        <SetupField label={t('Accommodation type')} hint={t('How is your property classified?')} required error={err('accommodationType')}>
          <BrandSelect
            value={draft.accommodationType}
            onValueChange={(v) => set({ accommodationType: v })}
            options={ACCOMMODATION_TYPES.map((a) => ({ value: a, label: t(a) }))}
          />
        </SetupField>

        <SetupField label={t('Star rating')} hint={t('Official or self-assessed star class.')} required error={err('starRating')}>
          <div className="flex items-center gap-1 h-[42px]">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => set({ starRating: n })} className="p-0.5 cursor-pointer" aria-label={`${n} ${t('stars')}`}>
                <Star className={`w-6 h-6 transition-colors ${n <= draft.starRating ? 'text-[var(--color-data-yellow-40)] fill-[var(--color-data-yellow-40)]' : 'text-[var(--border-strong)]'}`} />
              </button>
            ))}
          </div>
        </SetupField>
      </div>

      {cropSrc && <ImageCropper src={cropSrc} onCancel={() => setCropSrc(null)} onSave={(url) => { set({ photoUrl: url }); setCropSrc(null); }} />}
    </>
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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
        <SetupField label={t('Representative name')} required error={err('representativeName')}>
          <input className={setupInput} value={draft.representativeName} onChange={(e) => set({ representativeName: e.target.value })} />
        </SetupField>
        <SetupField label={t('Business registration number')}>
          <input className={setupInput} value={draft.businessRegNumber} onChange={(e) => set({ businessRegNumber: e.target.value })} />
        </SetupField>
        <SetupField label={t('Company name')} required error={err('companyName')}>
          <input className={setupInput} value={draft.companyName} onChange={(e) => set({ companyName: e.target.value })} />
        </SetupField>
        <SetupField label={t('Manager contact')}>
          <input className={setupInput} value={draft.managerContact} onChange={(e) => set({ managerContact: e.target.value })} />
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
        <SetupField label={t('Contract end')}>
          <DatePicker value={draft.contractEnd} onChange={(v) => set({ contractEnd: v })} ariaLabel={t('Contract end')} placeholder={t('Select date')} />
        </SetupField>
      </div>
    </>
  );
}

function ReviewStep({ draft, t, onEdit }: { draft: Property; t: TFn; onEdit: (i: number) => void }) {
  const dash = '—';
  const sections: { step: number; title: string; rows: [string, string][] }[] = [
    {
      step: 0,
      title: t('Basic information'),
      rows: [
        [t('Name'), draft.name || dash],
        [t('Type'), t(draft.accommodationType) || dash],
        [t('Star rating'), draft.starRating ? `${draft.starRating} ★` : dash],
      ],
    },
    {
      step: 1,
      title: t('Address'),
      rows: [
        [t('Country'), draft.country || dash],
        [t('State / Region'), draft.state || dash],
        [t('District'), draft.district || dash],
        [t('Township'), draft.township || dash],
        [t('Street address'), draft.address || dash],
        [t('Coordinates'), draft.latitude != null ? `${draft.latitude}, ${draft.longitude}` : dash],
      ],
    },
    {
      step: 2,
      title: t('Policies & amenities'),
      rows: [
        [t('Check-in'), draft.checkInTime || dash],
        [t('Check-out'), draft.checkOutTime || dash],
        [t('Amenities'), draft.mainAmenities.length ? draft.mainAmenities.map((a) => t(a)).join(', ') : dash],
        [t('Front desk'), draft.frontDeskNumber || draft.frontDeskEmail || dash],
      ],
    },
    {
      step: 3,
      title: t('Owner & contract'),
      rows: [
        [t('Representative'), draft.representativeName || dash],
        [t('Company'), draft.companyName || dash],
        [t('Reg. number'), draft.businessRegNumber || dash],
        [t('Contract status'), t(draft.contractStatus)],
        [t('Contract term'), draft.contractStart ? `${draft.contractStart} → ${draft.contractEnd || dash}` : dash],
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {sections.map((sec) => (
        <section key={sec.step} className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex items-center justify-between gap-3">
            <h2 className="text-base font-medium text-[var(--text-primary)]">{sec.title}</h2>
            <button
              type="button"
              onClick={() => onEdit(sec.step)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              {t('Edit')}
            </button>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
            {sec.rows.map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-xs text-[var(--text-secondary)] mb-0.5">{k}</dt>
                <dd className="text-sm text-[var(--text-primary)] break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
