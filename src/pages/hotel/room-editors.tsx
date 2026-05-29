import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Wifi, Utensils, Car, Waves, Dumbbell, Flower2, Banknote, Plane, Coffee, Tag } from 'lucide-react';
import { SideSheet } from '@/shared/ui/side-sheet';
import { BrandSelect } from '@/shared/ui/brand-select';
import { AMENITIES, type Room, type RoomStatus } from './hotel-data';

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

export function RoomEditor({ initial, types, onClose, onSave }: { initial: Room; types: string[]; onClose: () => void; onSave: (r: Room) => void }) {
  const { t } = useTranslation();
  const [d, setD] = useState<Room>(initial);
  const set = (p: Partial<Room>) => setD((s) => ({ ...s, ...p }));
  return (
    <ModalShell title={initial.id ? t('Edit Room') : t('Add Room')} onClose={onClose} onSave={() => d.number.trim() && onSave({ ...d, number: d.number.trim() })} saveLabel={initial.id ? t('Save changes') : t('Add Room')}>
      <F label={t('Floor')}><input type="number" className={fieldInput} value={d.floor} onChange={(e) => set({ floor: Number(e.target.value) })} /></F>
      <F label={t('Number')}><input className={fieldInput} value={d.number} onChange={(e) => set({ number: e.target.value })} placeholder="e.g. 201" /></F>
      <F label={t('Type')}><BrandSelect value={d.typeName} onValueChange={(v) => set({ typeName: v })} options={types.map((tn) => ({ value: tn, label: tn }))} /></F>
      <F label={t('Status')}><BrandSelect value={d.status} onValueChange={(v) => set({ status: v as RoomStatus })} options={[{ value: 'Active', label: t('Active') }, { value: 'Inactive', label: t('Inactive') }]} /></F>
      <F label={t('Beds')}><input type="number" className={fieldInput} value={d.beds} onChange={(e) => set({ beds: Number(e.target.value) })} /></F>
      <F label={t('Occupancy')}><input type="number" className={fieldInput} value={d.occupancy} onChange={(e) => set({ occupancy: Number(e.target.value) })} /></F>
      <F label={t('Price')} className="sm:col-span-2"><input type="number" className={fieldInput} value={d.price} onChange={(e) => set({ price: Number(e.target.value) })} /></F>
      <F label={t('Amenities')} className="sm:col-span-2"><AmenityToggles value={d.amenities} onChange={(v) => set({ amenities: v })} /></F>
    </ModalShell>
  );
}
