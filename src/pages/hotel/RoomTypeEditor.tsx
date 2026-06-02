import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Popover from '@radix-ui/react-popover';
import { X, Plus, Trash2, Clock, Info, ChevronDown, TriangleAlert } from 'lucide-react';
import { SideSheet } from '@/shared/ui/side-sheet';
import { BrandSelect } from '@/shared/ui/brand-select';
import { ImageCropper } from '@/pages/agents/ImageCropper';
import { AmenityToggles, fieldInput } from './room-editors';
import { BED_TYPES, WEEKEND_DAYS, formatPrice, computeWeekendPrice, type RoomType, type BedType, type SizeUnit, type WeekendMode } from './hotel-data';

type PriceTab = 'regular' | 'session' | 'weekend';

export function RoomTypeEditor({ initial, onClose, onSave }: { initial: RoomType; onClose: () => void; onSave: (rt: RoomType) => void }) {
  const { t } = useTranslation();
  const [d, setD] = useState<RoomType>(initial);
  const [priceTab, setPriceTab] = useState<PriceTab>('regular');
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (p: Partial<RoomType>) => setD((s) => ({ ...s, ...p }));
  const isEdit = Boolean(initial.id);

  // Weekend rate is derived from the chosen mode + surcharge; keep weekendPrice in sync.
  const weekendMode: WeekendMode = d.weekendMode ?? 'percent';
  const weekendSurcharge = d.weekendSurcharge ?? 0;
  useEffect(() => {
    const computed = computeWeekendPrice(d.regularPrice, weekendMode, weekendSurcharge);
    if (computed !== d.weekendPrice) set({ weekendPrice: computed });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.regularPrice, weekendMode, weekendSurcharge]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') setCropSrc(reader.result); };
    reader.readAsDataURL(file);
  };

  const updateBed = (i: number, patch: Partial<{ type: BedType; count: number }>) => set({ beds: d.beds.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) });
  const toggleDay = (day: string) => set({ weekendDays: d.weekendDays.includes(day) ? d.weekendDays.filter((x) => x !== day) : [...d.weekendDays, day] });
  // Move a photo to the front so it becomes the cover.
  const setCover = (i: number) => set({ photos: [d.photos[i], ...d.photos.filter((_, idx) => idx !== i)] });

  const save = () => { if (d.name.trim()) onSave({ ...d, name: d.name.trim(), id: d.id || `rt-${Date.now()}` }); };

  return (
    <>
      <SideSheet onClose={onClose} widthClass="max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)] shrink-0">
            <h2 className="text-lg font-medium text-[var(--text-primary)]">{isEdit ? t('Edit Room Type') : t('Add Room Type')}</h2>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors p-1 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Photos (top) */}
            <div>
              <span className="text-xs font-medium text-[var(--text-secondary)] block mb-1">{t('Room Photos')}<span className="text-[var(--danger)] ml-0.5">*</span></span>
              <p className="text-xs text-[var(--text-secondary)] mb-3">{t('Add at least one photo. The first is used as the cover. JPG/PNG up to 5 MB.')}</p>
              <div className="space-y-3">
                <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onFile} />
                {d.photos.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {d.photos.map((p, i) => (
                      <div key={i} className={`relative w-24 h-24 rounded-md overflow-hidden border group ${i === 0 ? 'border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]' : 'border-[var(--border-default)]'}`}>
                        <img src={p} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => set({ photos: d.photos.filter((_, idx) => idx !== i) })} title={t('Remove')} className="absolute top-1 right-1 p-1 rounded-full bg-[var(--text-primary)]/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><X className="w-3 h-3" /></button>
                        {i === 0 ? (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-[var(--brand-primary)] text-white">{t('Cover')}</span>
                        ) : (
                          <button onClick={() => setCover(i)} className="absolute inset-x-1 bottom-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/90 text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white">{t('Set as cover')}</button>
                        )}
                      </div>
                    ))}
                    {/* Add-more tile — matches the photo size and sits after them */}
                    <button onClick={() => fileRef.current?.click()} className="w-24 h-24 rounded-md border-2 border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] flex flex-col items-center justify-center gap-1 text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer shrink-0">
                      <Plus className="w-5 h-5" />
                      <span className="text-[11px] font-medium">{t('Upload')}</span>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()} className="w-full h-32 rounded-md border-2 border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] flex flex-col items-center justify-center gap-1.5 text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer">
                    <Plus className="w-6 h-6" />
                    <span className="text-sm font-medium">{t('Upload')}</span>
                  </button>
                )}
              </div>
            </div>

            <Divider label={t('Room Details')} />
            {/* Room details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t('Room Type Name')} required className="sm:col-span-2"><input className={fieldInput} value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder={t('e.g. Deluxe')} /></Field>
              <Field label={t('Description')} className="sm:col-span-2"><textarea rows={2} className={`${fieldInput} resize-none`} value={d.description} onChange={(e) => set({ description: e.target.value })} placeholder={t('Short description shown to guests')} /></Field>
              <Field label={t('Amenity')} required className="sm:col-span-2"><AmenityToggles value={d.amenities} onChange={(v) => set({ amenities: v })} /></Field>
            </div>

            <div className="bg-[var(--surface-subtle)] rounded-lg p-4 space-y-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{t('Price')}</h3>
                <InfoTip text={t('Regular = standard nightly rate. Session = sell short hourly blocks. Weekend = an uplift applied to both the nightly and session rate on the days you choose.')} />
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{t('Set how this room type is priced — a regular nightly rate, optional hourly sessions, and a weekend uplift that applies to both on selected days.')}</p>
            </div>
            <div className="flex w-full p-1 bg-white border border-[var(--border-default)] rounded-lg">
              {([['regular', t('Regular'), t('Night')], ['session', t('Session'), t('Day')], ['weekend', t('Weekend'), t('Uplift')]] as const).map(([key, label, badge]) => {
                const on = priceTab === key;
                return (
                  <button key={key} type="button" onClick={() => setPriceTab(key)} className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${on ? 'bg-[var(--text-primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                    <span className="text-sm font-medium">{label}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${on ? 'bg-white/20 text-white' : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]'}`}>{badge}</span>
                  </button>
                );
              })}
            </div>
            <div>
              {priceTab === 'regular' && <Field label={t('Base Price (per night)')} required><Money value={d.regularPrice} onChange={(v) => set({ regularPrice: v })} /></Field>}
              {priceTab === 'session' && (
                <div className="space-y-4">
                  <Toggle checked={d.sessionEnabled} onChange={(v) => set({ sessionEnabled: v })} label={t('Enable session use')} hint={t('Sell the room in short blocks of hours')} />
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${d.sessionEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
                    <Field label={t('Base price (per session)')}><Money value={d.sessionPrice} onChange={(v) => set({ sessionPrice: v })} /></Field>
                    <Field label={t('Session length (hours)')}>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
                        <input type="number" min={1} className={`${fieldInput} pl-9`} value={d.sessionHours} onChange={(e) => set({ sessionHours: Number(e.target.value) })} />
                      </div>
                    </Field>
                  </div>
                </div>
              )}
              {priceTab === 'weekend' && (
                <div className="space-y-4">
                  <Toggle checked={d.weekendEnabled} onChange={(v) => set({ weekendEnabled: v })} label={t('Enable weekend pricing')} hint={t('Apply an uplift to the night and session rate on selected days')} />
                  <div className={d.weekendEnabled ? 'space-y-4' : 'opacity-50 pointer-events-none space-y-4'}>
                    <Field label={t('Weekend days')}>
                      <div className="flex flex-wrap gap-2">
                        {WEEKEND_DAYS.map((day) => {
                          const on = d.weekendDays.includes(day);
                          return <button key={day} type="button" onClick={() => toggleDay(day)} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer ${on ? 'bg-[var(--brand-tint)] text-[var(--brand-primary)] border-[var(--brand-border)]' : 'bg-white text-[var(--text-tertiary)] border-[var(--border-default)] hover:bg-[var(--surface-subtle)]'}`}>{t(day)}</button>;
                        })}
                      </div>
                    </Field>
                    <Field label={t('Weekend uplift')}>
                      <div className="space-y-3">
                        {/* How the uplift is set */}
                        <div className="grid grid-cols-2 gap-2">
                          {([['percent', t('% over base')], ['amount', t('+ Amount')]] as const).map(([m, label]) => {
                            const on = weekendMode === m;
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => set({ weekendMode: m })}
                                className={`px-2 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${on ? 'border-[var(--brand-primary)] bg-[var(--brand-tint)] text-[var(--brand-primary)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]'}`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>

                        {/* The uplift value */}
                        {weekendMode === 'percent' ? (
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              className={`${fieldInput} pr-9 tabular-nums`}
                              value={weekendSurcharge}
                              onChange={(e) => set({ weekendSurcharge: Number(e.target.value) })}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)] pointer-events-none">%</span>
                          </div>
                        ) : (
                          <Money value={weekendSurcharge} onChange={(v) => set({ weekendSurcharge: v })} wide />
                        )}

                        {/* Edge case: the uplift builds on the base rates — warn if a base is unset */}
                        {(() => {
                          const needsRegular = d.regularPrice <= 0;
                          const needsSession = d.sessionEnabled && d.sessionPrice <= 0;
                          if (!needsRegular && !needsSession) return null;
                          const msg = needsRegular && needsSession
                            ? t('Set the Regular and Session rates first — the weekend uplift is added on top of them.')
                            : needsRegular
                              ? t('Set the Regular night rate first — the weekend uplift is added on top of it.')
                              : t('Set the Session rate first — the weekend uplift is added on top of it.');
                          return (
                            <div className="flex items-start gap-2 rounded-md bg-[var(--warning-tint)] border border-[var(--warning-tint)] px-3 py-2 text-xs text-[var(--warning-strong)]">
                              <TriangleAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              <span>{msg}</span>
                            </div>
                          );
                        })()}

                        {/* Live preview — the uplift applies to both rates on selected days */}
                        <div className="rounded-md bg-white border border-[var(--border-default)] divide-y divide-[var(--surface-subtle)]">
                          <div className="flex items-center justify-between px-3 py-2">
                            <span className="text-xs text-[var(--text-secondary)]">{t('Weekend night rate')}</span>
                            <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">
                              <span className="text-xs text-[var(--text-muted)] font-normal line-through mr-1.5">{formatPrice(d.regularPrice)}</span>
                              {formatPrice(d.weekendPrice)}
                            </span>
                          </div>
                          {d.sessionEnabled && (
                            <div className="flex items-center justify-between px-3 py-2">
                              <span className="text-xs text-[var(--text-secondary)]">{t('Weekend session rate')}</span>
                              <span className="text-sm font-medium text-[var(--text-primary)] tabular-nums">
                                <span className="text-xs text-[var(--text-muted)] font-normal line-through mr-1.5">{formatPrice(d.sessionPrice)}</span>
                                {formatPrice(computeWeekendPrice(d.sessionPrice, weekendMode, weekendSurcharge))}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)] pl-1">
                          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--text-tertiary)]" />
                          <span>{weekendMode === 'percent' ? `+${weekendSurcharge}%` : `+${formatPrice(weekendSurcharge)}`} {t('added to the night and session rate on selected days.')}</span>
                        </p>
                      </div>
                    </Field>
                  </div>
                </div>
              )}
            </div>

            </div>

            <div className="bg-[var(--surface-subtle)] rounded-lg p-4 space-y-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{t('Layout and Occupancy')}</h3>
                <InfoTip text={t('Add each bed type and how many. Room size is the floor area guests can expect.')} />
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{t('Describe the bed configuration and room size guests can expect.')}</p>
            </div>
            <Field label={t('Beds')} required>
              <div className="space-y-3">
                {d.beds.map((bed, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <BrandSelect value={bed.type} onValueChange={(v) => updateBed(i, { type: v as BedType })} className="flex-1" options={BED_TYPES.map((b) => ({ value: b, label: t(b) }))} />
                    <input type="number" min={1} className={`${fieldInput} w-24`} value={bed.count} onChange={(e) => updateBed(i, { count: Number(e.target.value) })} />
                    <button type="button" onClick={() => set({ beds: d.beds.filter((_, idx) => idx !== i) })} disabled={d.beds.length === 1} className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-tint)] rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => set({ beds: [...d.beds, { type: 'Single', count: 1 }] })} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-tint)] px-2 py-1 -ml-2 rounded-md transition-colors cursor-pointer"><Plus className="w-4 h-4" />{t('Add bed')}</button>
              </div>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t('Max Occupancy')} required>
                <input type="number" min={1} className={fieldInput} value={d.occupancy} onChange={(e) => set({ occupancy: Number(e.target.value) })} />
              </Field>
              <Field label={t('Room size')}>
                <div className="relative flex items-center rounded-md border border-[var(--border-default)] bg-white focus-within:border-[var(--brand-primary)] focus-within:ring-1 focus-within:ring-[var(--brand-primary)]">
                  <input type="number" min={0} value={d.roomSize ?? ''} onChange={(e) => set({ roomSize: e.target.value ? Number(e.target.value) : undefined })} placeholder="0" className="flex-1 w-full pl-3 pr-1 py-2 bg-transparent text-sm text-[var(--text-primary)] focus:outline-none tabular-nums placeholder:text-[var(--text-secondary)]" />
                  <div className="relative shrink-0">
                    <select value={d.sizeUnit} onChange={(e) => set({ sizeUnit: e.target.value as SizeUnit })} className="appearance-none bg-transparent pl-2 pr-7 py-2 text-sm text-[var(--text-secondary)] focus:outline-none cursor-pointer">
                      <option value="m²">m²</option>
                      <option value="ft²">ft²</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)] pointer-events-none" />
                  </div>
                </div>
              </Field>
            </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-subtle)] shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">{t('Cancel')}</button>
            <button onClick={save} disabled={!d.name.trim()} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">{isEdit ? t('Save changes') : t('Add Room Type')}</button>
          </div>
      </SideSheet>

      {cropSrc && <ImageCropper src={cropSrc} onCancel={() => setCropSrc(null)} onSave={(url) => { set({ photos: [...d.photos, url] }); setCropSrc(null); }} />}
    </>
  );
}

function InfoTip({ text }: { text: string }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" aria-label="More info">
          <Info className="w-3.5 h-3.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="top" align="start" sideOffset={6} className="z-[60] max-w-[260px] rounded-md border border-[var(--border-default)] bg-white px-3 py-2 text-xs text-[var(--text-secondary)] leading-relaxed shadow-[0_4px_16px_rgba(44,38,39,0.14)]">
          {text}
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="text-xs font-medium text-[var(--text-secondary)]">{label}{required && <span className="text-[var(--danger)] ml-0.5">*</span>}</span>
      {children}
    </label>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{label}</span>
      <div className="h-px flex-1 bg-[var(--surface-subtle)]" />
    </div>
  );
}

function Money({ value, onChange, wide }: { value: number; onChange: (v: number) => void; wide?: boolean }) {
  return (
    <div className={`relative ${wide ? '' : 'max-w-xs'}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-secondary)] pointer-events-none select-none">MMK</span>
      <input
        type="text"
        inputMode="numeric"
        value={value ? value.toLocaleString('en-US') : ''}
        onChange={(e) => onChange(Number(e.target.value.replace(/[^\d]/g, '')))}
        placeholder="0"
        className="w-full pl-14 pr-3 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-colors tabular-nums placeholder:text-[var(--text-secondary)]"
      />
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between gap-3 w-full text-left px-4 py-3 bg-white border rounded-md transition-colors cursor-pointer ${checked ? 'border-[var(--brand-border)]' : 'border-[var(--border-default)] hover:bg-[var(--surface-subtle)]'}`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[var(--text-primary)]">{label}</span>
        {hint && <span className="block text-xs text-[var(--text-secondary)] mt-0.5">{hint}</span>}
      </span>
      <span className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${checked ? 'bg-[var(--brand-primary)]' : 'bg-[var(--border-strong)]'}`}>
        <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </span>
    </button>
  );
}
