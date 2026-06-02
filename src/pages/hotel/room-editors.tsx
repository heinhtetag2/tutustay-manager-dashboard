import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Wifi, Utensils, Car, Waves, Dumbbell, Flower2, Banknote, Plane, Coffee, Tag, CloudMoon, Users, Info } from 'lucide-react';
import { SideSheet } from '@/shared/ui/side-sheet';
import { BrandSelect } from '@/shared/ui/brand-select';
import { AMENITIES, totalBeds, type Room, type RoomType, type RoomStatus } from './hotel-data';

/** Maps each amenity to a representative icon. */
export const amenityIcon: Record<string, React.ElementType> = {
  WiFi: Wifi,
  Breakfast: Utensils,
  Parking: Car,
  'Swimming Pool': Waves,
  'Fitness Centre/Gym': Dumbbell,
  'SPA & Wellness Centre': Flower2,
  'Currency Exchange & ATM': Banknote,
  'Airport Pickup': Plane,
  Cafe: Coffee,
};

export function AmenityIcon({ name, className }: { name: string; className?: string }) {
  const Icon = amenityIcon[name] ?? Tag;
  return <Icon className={className ?? 'w-3.5 h-3.5'} />;
}

export const fieldInput =
  'w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]';

export function AmenityToggles({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {AMENITIES.map((a) => {
        const on = value.includes(a);
        return (
          <button
            key={a}
            type="button"
            onClick={() => onChange(on ? value.filter((x) => x !== a) : [...value, a])}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer ${on ? 'bg-[var(--brand-tint)] text-[var(--brand-primary)] border-[var(--brand-border)]' : 'bg-white text-[var(--text-tertiary)] border-[var(--border-default)] hover:bg-[var(--surface-subtle)]'}`}
          >
            <AmenityIcon name={a} className="w-3.5 h-3.5" />
            {a}
          </button>
        );
      })}
    </div>
  );
}

export function F({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  );
}

function ModalShell({ title, onClose, onSave, saveLabel, children }: { title: string; onClose: () => void; onSave: () => void; saveLabel: string; children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <SideSheet onClose={onClose} widthClass="max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)] shrink-0">
        <h2 className="text-lg font-medium text-[var(--text-primary)]">{title}</h2>
        <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors p-1 cursor-pointer"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto flex-1 content-start">{children}</div>
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-subtle)] shrink-0">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">{t('Cancel')}</button>
        <button onClick={onSave} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer">{saveLabel}</button>
      </div>
    </SideSheet>
  );
}

export function RoomEditor({ initial, roomTypes, onClose, onSave }: { initial: Room; roomTypes: RoomType[]; onClose: () => void; onSave: (r: Room) => void }) {
  const { t } = useTranslation();
  const fromType = (name: string) => {
    const rt = roomTypes.find((r) => r.name === name);
    return rt ? { amenities: rt.amenities, beds: totalBeds(rt), occupancy: rt.occupancy, price: rt.regularPrice } : {};
  };
  const fmt = (n: number) => `MMK ${n.toLocaleString('en-US')}`;
  const [d, setD] = useState<Room>(() => ({ ...initial, ...fromType(initial.typeName) }));
  const [priceTab, setPriceTab] = useState<'regular' | 'session' | 'weekend'>('regular');
  const set = (p: Partial<Room>) => setD((s) => ({ ...s, ...p }));
  const onTypeChange = (name: string) => { set({ typeName: name, ...fromType(name) }); setPriceTab('regular'); };
  return (
    <ModalShell title={initial.id ? t('Edit Room') : t('Add Room')} onClose={onClose} onSave={() => d.number.trim() && onSave({ ...d, number: d.number.trim() })} saveLabel={initial.id ? t('Save changes') : t('Add Room')}>
      <F label={t('Floor')}><input type="number" className={fieldInput} value={d.floor} onChange={(e) => set({ floor: Number(e.target.value) })} /></F>
      <F label={t('Number')}><input className={fieldInput} value={d.number} onChange={(e) => set({ number: e.target.value })} placeholder="e.g. 201" /></F>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[var(--text-secondary)]">{t('Type')}</span>
        <BrandSelect value={d.typeName} onValueChange={onTypeChange} options={roomTypes.map((rt) => ({ value: rt.name, label: rt.name }))} />
        <span className="flex items-start gap-1.5 pl-1 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
          <Info className="w-3.5 h-3.5 mt-px shrink-0" />
          <span>{t('Sets pricing, beds, occupancy and amenities for this room.')}</span>
        </span>
      </label>
      <F label={t('Status')}><BrandSelect value={d.status} onValueChange={(v) => set({ status: v as RoomStatus })} options={[{ value: 'Active', label: t('Active') }, { value: 'Inactive', label: t('Inactive') }]} /></F>

      {/* ── Room-type inherited details ── */}
      {(() => {
        const rt = roomTypes.find((r) => r.name === d.typeName);
        if (!rt) return null;
        const tabs = [
          { key: 'regular' as const, label: t('Regular'), badge: t('Night'), enabled: true },
          { key: 'session' as const, label: t('Session'), badge: t('Day'), enabled: rt.sessionEnabled },
          { key: 'weekend' as const, label: t('Weekend'), badge: t('Uplift'), enabled: rt.weekendEnabled },
        ];
        return (
          <div className="sm:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-[var(--border-default)]" />
              <span className="text-[11px] text-[var(--text-tertiary)] shrink-0">{rt.name} {t('details')}</span>
              <div className="flex-1 h-px bg-[var(--border-default)]" />
            </div>

            {/* Pricing card */}
            <div className="bg-[var(--surface-subtle)] rounded-lg p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{t('Pricing')}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{t('Regular nightly rate, optional hourly sessions, and weekend rate.')}</p>
              </div>
              <div className="flex w-full p-1 bg-white border border-[var(--border-default)] rounded-lg">
                {tabs.map(({ key, label, badge, enabled }) => {
                  const on = priceTab === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!enabled}
                      onClick={() => enabled && setPriceTab(key)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-colors disabled:cursor-not-allowed
                        ${on ? 'bg-[var(--text-primary)] text-white cursor-pointer' : enabled ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer' : 'text-[var(--text-muted)] opacity-60'}`}
                    >
                      <span className="text-sm font-medium">{label}</span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${on ? 'bg-white/20 text-white' : enabled ? 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>{enabled ? badge : t('Off')}</span>
                    </button>
                  );
                })}
              </div>
              <div className="text-sm font-medium text-[var(--text-primary)] tabular-nums">
                {priceTab === 'regular' && <div className="flex justify-between"><span className="text-xs text-[var(--text-secondary)]">{t('Base price (per night)')}</span><span>{fmt(rt.regularPrice)}</span></div>}
                {priceTab === 'session' && rt.sessionEnabled && (
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-xs text-[var(--text-secondary)]">{t('Base price (per session)')}</span><span>{fmt(rt.sessionPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-[var(--text-secondary)]">{t('Session length')}</span><span className="text-sm">{rt.sessionHours} {t('hrs')}</span></div>
                  </div>
                )}
                {priceTab === 'weekend' && rt.weekendEnabled && (
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-xs text-[var(--text-secondary)]">{t('Weekend rate (per night)')}</span><span>{fmt(rt.weekendPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-xs text-[var(--text-secondary)]">{t('Days')}</span><span className="text-sm">{rt.weekendDays.join(', ')}</span></div>
                  </div>
                )}
              </div>
            </div>

            {/* Layout card */}
            <div className="bg-[var(--surface-subtle)] rounded-lg p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{t('Layout & Occupancy')}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{t('Bed configuration and capacity for this room type.')}</p>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
                  <CloudMoon className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="font-medium tabular-nums">{d.beds}</span>
                  <span className="text-[var(--text-secondary)]">{d.beds === 1 ? t('bed') : t('beds')}</span>
                </div>
                <span className="text-[var(--text-muted)]">·</span>
                <div className="flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
                  <Users className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-secondary)]">{t('Sleeps')}</span>
                  <span className="font-medium tabular-nums">{d.occupancy}</span>
                </div>
              </div>
              {rt.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {rt.amenities.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-white text-[var(--text-secondary)] border border-[var(--border-default)]">
                      <AmenityIcon name={a} className="w-3.5 h-3.5" />{a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </ModalShell>
  );
}
