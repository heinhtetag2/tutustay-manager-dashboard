import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  X,
  RotateCcw,
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
  HelpCircle,
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

import { Portal } from '@/shared/ui/portal';
import { BrandSelect } from '@/shared/ui/brand-select';
import { ImageCropper } from '@/pages/agents/ImageCropper';
import { useHotel } from '../use-hotel';
import {
  AMENITIES,
  ACCOMMODATION_TYPES,
  type ContractStatus,
  type Property,
} from '../hotel-data';
import { SetupField, InfoBanner, AdditionalInputs, setupInput } from './setup-fields';
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
  { key: 'basic', title: 'Tell us about your hotel', lead: 'The essentials guests see first — your name, type, and rating.', Icon: Building2 },
  { key: 'address', title: 'Confirm your address', lead: "Enter your hotel's detailed address. If it isn't clear and accurate on the map, guests will struggle to find you.", Icon: MapPin },
  { key: 'policies', title: 'Policies & amenities', lead: 'Set guest expectations for arrival and stay.', Icon: ScrollText },
  { key: 'owner', title: 'Owner & contract', lead: 'Who operates this property and the terms of your agreement.', Icon: Briefcase },
  { key: 'review', title: 'Review your details', lead: 'Check everything looks right, then finish setup.', Icon: ClipboardCheck },
] as const;

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
  const { t } = useTranslation();
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
    <Portal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-[var(--text-primary)]/40 flex items-center justify-center p-4 md:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-[min(1080px,96vw)] h-[min(88vh,820px)] bg-white rounded-xl overflow-hidden flex shadow-[0_24px_70px_rgba(44,38,39,0.22)]"
        >
          {/* Left intro / step rail */}
          <aside className="hidden md:flex w-[296px] shrink-0 flex-col justify-between p-7 border-r border-[var(--border-default)] bg-[var(--brand-tint)]">
            <div>
              <h2 className="text-2xl font-serif text-[var(--text-primary)] leading-snug">
                {t('Set up your hotel')}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
                {t('Add your property details so guests can find and book you.')}
              </p>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              {t('You can edit any of this later in Settings.')}
            </p>
          </aside>

          {/* Right column */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top header: prominent title (left) + secondary step indicator (right), no divider */}
            <div className="shrink-0 pl-6 md:pl-8 pr-6 md:pr-14 pt-7 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-medium text-[var(--text-primary)] tracking-tight leading-snug">
                    {t(STEPS[step].title)}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                    {t(STEPS[step].lead)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 mt-1">
                  {/* Compact inline segments — right-aligned, not full width */}
                  <div className="flex items-center gap-1">
                    {STEPS.map((s, i) => (
                      <span
                        key={s.key}
                        className={`h-1 w-4 rounded-full transition-colors duration-300 ${
                          i <= step ? 'bg-[var(--brand-primary)]' : 'bg-[var(--border-default)]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-[var(--text-muted)] tabular-nums whitespace-nowrap">
                    {t('Step')} {step + 1} {t('of')} {STEPS.length}
                  </span>
                  <Tooltip.Provider delayDuration={120}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button type="button" aria-label={t('About these steps')} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-help">
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="bottom"
                          align="end"
                          sideOffset={6}
                          className="z-[60] max-w-[240px] rounded-md bg-[var(--text-primary)] px-3 py-2 text-xs leading-relaxed text-white shadow-[0_8px_28px_rgba(44,38,39,0.18)]"
                        >
                          {t('Complete all steps to publish your hotel profile. You can go back and edit any step before finishing.')}
                          <Tooltip.Arrow className="fill-[var(--text-primary)]" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-2xl space-y-5"
              >
                {step === 0 && <BasicInfoStep {...stepProps} />}
                {step === 1 && <AddressStep {...stepProps} />}
                {step === 2 && <PoliciesStep {...stepProps} />}
                {step === 3 && <OwnerStep {...stepProps} />}
                {step === 4 && <ReviewStep draft={draft} t={t} onEdit={jumpTo} />}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-6 md:px-8 py-4 border-t border-[var(--border-default)] bg-white">
              <button
                type="button"
                onClick={() => setDraft({ ...property })}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                {t('Reset')}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="inline-flex items-center px-5 py-2 text-sm font-medium text-[var(--text-primary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {t('Back')}
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
                >
                  {isLast ? t('Finish setup') : t('Next')}
                </button>
              </div>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer"
            aria-label={t('Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </Portal>
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
      <InfoBanner>
        {t('This information appears on your public property profile and across booking listings.')}
      </InfoBanner>

      {/* Photo */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t('Hotel photo')}</label>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-md bg-[var(--surface-subtle)] border border-[var(--border-default)] overflow-hidden flex items-center justify-center shrink-0 text-[var(--text-secondary)]">
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
        counter={{ value: draft.name.length, max: 120 }}
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
        counter={{ value: draft.address.length, max: 200 }}
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
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggle(a)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors cursor-pointer ${
                  on
                    ? 'bg-[var(--brand-tint)] text-[var(--brand-primary)] border-[var(--brand-border)]'
                    : 'bg-white text-[var(--text-tertiary)] border-[var(--border-default)] hover:bg-[var(--surface-subtle)]'
                }`}
              >
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
    <>
      <div className="space-y-4">
        {sections.map((sec) => (
          <div key={sec.step} className="border border-[var(--border-default)] rounded-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface-subtle)] border-b border-[var(--border-default)]">
              <h4 className="text-sm font-medium text-[var(--text-primary)]">{sec.title}</h4>
              <button
                type="button"
                onClick={() => onEdit(sec.step)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                {t('Edit')}
              </button>
            </div>
            <dl className="divide-y divide-[var(--surface-subtle)]">
              {sec.rows.map(([k, v]) => (
                <div key={k} className="flex items-start gap-4 px-4 py-2.5">
                  <dt className="w-32 shrink-0 text-xs font-medium text-[var(--text-secondary)]">{k}</dt>
                  <dd className="text-sm text-[var(--text-primary)] break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}
