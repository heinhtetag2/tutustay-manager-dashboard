import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  X,
  Calendar as CalendarIcon,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Portal } from '@/shared/ui/portal';
import { SideSheet } from '@/shared/ui/side-sheet';
import { BrandSelect } from '@/shared/ui/brand-select';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import { ImageCropper } from './ImageCropper';
import type { Employee, EmployeeRole, EmployeeStatus, Gender, EmploymentType } from './agents-data';
import { EMPLOYEE_ROLES, GENDERS, EMPLOYMENT_TYPES } from './agents-data';

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

/** Parse a 'yyyy-MM-dd' string to a local Date (avoids UTC off-by-one). */
function parseLocalDate(s?: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

const inputCls =
  'w-full px-3 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]';

interface EmployeeEditorProps {
  mode: 'new' | 'edit';
  initial: Employee;
  onClose: () => void;
  onSave: (employee: Employee) => void;
}

export function EmployeeEditor({ mode, initial, onClose, onSave }: EmployeeEditorProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Employee>(initial);
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState(initial.password ?? '');
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const update = (patch: Partial<Employee>) => setDraft((d) => ({ ...d, ...patch }));

  const nameValid = draft.fullName.trim().length > 0;
  const password = draft.password ?? '';
  const passwordMismatch = password !== confirmPassword;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB cap
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') setCropSrc(reader.result); };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!nameValid || passwordMismatch) return;
    const id = draft.id || `emp-${Date.now()}`;
    onSave({ ...draft, id, fullName: draft.fullName.trim(), employeeId: draft.employeeId.trim() || id });
  };

  return (
    <>
      <SideSheet onClose={onClose} widthClass="max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)] shrink-0">
              <div>
                <h2 className="text-lg font-medium text-[var(--text-primary)]">
                  {mode === 'new' ? t('Add employee') : t('Edit employee')}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {step === 1 ? t('Step 1 of 2 · Profile details') : t('Step 2 of 2 · Account credentials')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step progress */}
            <div className="flex gap-1.5 px-6 pt-4 shrink-0">
              <span className="h-1 flex-1 rounded-full bg-[var(--brand-primary)]" />
              <span className={`h-1 flex-1 rounded-full transition-colors ${step === 2 ? 'bg-[var(--brand-primary)]' : 'bg-[var(--surface-subtle)]'}`} />
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {step === 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo */}
                  <div className="sm:col-span-2 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-xl font-medium overflow-hidden shrink-0">
                      {draft.avatarUrl ? (
                        <img src={draft.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        initialOf(draft.fullName)
                      )}
                    </div>
                    <div className="flex flex-col gap-2 min-w-0">
                      <p className="text-xs text-[var(--text-secondary)]">{t('Upload a JPG or PNG image up to 5MB.')}</p>
                      <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onFile} />
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          {t('Upload image')}
                        </button>
                        {draft.avatarUrl && (
                          <button
                            type="button"
                            onClick={() => update({ avatarUrl: undefined })}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--danger)] hover:underline cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            {t('Remove image')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Field label={t('Full Name')} className="sm:col-span-2">
                    <input type="text" value={draft.fullName} onChange={(e) => update({ fullName: e.target.value })} placeholder={t('e.g. James Carter')} className={inputCls} />
                  </Field>

                  <Field label={t('Employee ID')}>
                    <input type="text" value={draft.employeeId} onChange={(e) => update({ employeeId: e.target.value })} placeholder={t('Auto if empty')} className={inputCls} />
                  </Field>
                  <Field label={t('Phone number')}>
                    <input type="tel" value={draft.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="09xxxxxxxx" className={inputCls} />
                  </Field>

                  <Field label={t('Email')} className="sm:col-span-2">
                    <input type="email" value={draft.email} onChange={(e) => update({ email: e.target.value })} placeholder="name@gmail.com" className={inputCls} />
                  </Field>

                  <Field label={t('Gender')}>
                    <BrandSelect value={draft.gender ?? ''} onValueChange={(v) => update({ gender: v as Gender })} placeholder={t('Select gender')} options={GENDERS.map((g) => ({ value: g, label: t(g) }))} />
                  </Field>
                  <DateField label={t('Date of birth')} value={draft.dateOfBirth ?? ''} onChange={(v) => update({ dateOfBirth: v })} />

                  <Field label={t('Resident ID number')}>
                    <input type="text" value={draft.residentId ?? ''} onChange={(e) => update({ residentId: e.target.value })} placeholder={t('e.g. 12/AB(N)123456')} className={inputCls} />
                  </Field>
                  <Field label={t('Employee type')}>
                    <BrandSelect value={draft.employmentType ?? ''} onValueChange={(v) => update({ employmentType: v as EmploymentType })} placeholder={t('Select type')} options={EMPLOYMENT_TYPES.map((e) => ({ value: e, label: t(e) }))} />
                  </Field>

                  <Field label={t('Role')}>
                    <BrandSelect value={draft.role} onValueChange={(v) => update({ role: v as EmployeeRole })} options={EMPLOYEE_ROLES.map((r) => ({ value: r, label: t(r) }))} />
                  </Field>
                  <Field label={t('Status')}>
                    <BrandSelect
                      value={draft.status}
                      onValueChange={(v) => update({ status: v as EmployeeStatus })}
                      options={[
                        { value: 'Active', label: t('Active') },
                        { value: 'Inactive', label: t('Inactive') },
                      ]}
                    />
                  </Field>

                  <DateField label={t('Hire Date')} value={draft.hireDate} onChange={(v) => update({ hireDate: v })} className="sm:col-span-2" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Summary */}
                  <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-[var(--surface-subtle)] rounded-md">
                    <div className="w-10 h-10 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium overflow-hidden shrink-0">
                      {draft.avatarUrl ? <img src={draft.avatarUrl} alt="" className="w-full h-full object-cover" /> : initialOf(draft.fullName)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">{draft.fullName || t('New employee')}</div>
                      <div className="text-xs text-[var(--text-secondary)] truncate">{t(draft.role)}{draft.email ? ` · ${draft.email}` : ''}</div>
                    </div>
                  </div>

                  <Field label={t('Login ID')} className="sm:col-span-2">
                    <input type="text" value={draft.loginId ?? ''} onChange={(e) => update({ loginId: e.target.value })} placeholder={t('e.g. james.carter')} className={inputCls} autoComplete="off" />
                  </Field>

                  <Field label={t('Password')}>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={draft.password ?? ''}
                        onChange={(e) => update({ password: e.target.value })}
                        placeholder="••••••••"
                        className={`${inputCls} pr-10`}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-colors cursor-pointer" aria-label={showPassword ? t('Hide password') : t('Show password')}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>

                  <Field label={t('Confirm password')}>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`${inputCls} pr-10 ${confirmPassword && passwordMismatch ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]' : ''}`}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded transition-colors cursor-pointer" aria-label={showConfirm ? t('Hide password') : t('Show password')}>
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </Field>

                  {confirmPassword && passwordMismatch && (
                    <p className="sm:col-span-2 -mt-1 text-xs font-medium text-[var(--danger)] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {t("Passwords don't match")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[var(--surface-subtle)] shrink-0">
              {step === 1 ? (
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
                  {t('Cancel')}
                </button>
              ) : (
                <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                  {t('Back')}
                </button>
              )}

              {step === 1 ? (
                <button
                  onClick={() => setStep(2)}
                  disabled={!nameValid}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('Continue')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={save}
                  disabled={!nameValid || passwordMismatch}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mode === 'new' ? t('Add employee') : t('Save changes')}
                </button>
              )}
            </div>
      </SideSheet>

      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onCancel={() => setCropSrc(null)}
          onSave={(url) => { update({ avatarUrl: url }); setCropSrc(null); }}
        />
      )}
    </>
  );
}

function DateField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = parseLocalDate(value);
  const POPOVER_H = 360;
  const POPOVER_W = 300;

  const openPicker = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const openUp = r.bottom + 4 + POPOVER_H > window.innerHeight && r.top - POPOVER_H > 0;
    const left = Math.min(r.left, window.innerWidth - POPOVER_W - 8);
    setPos({ top: openUp ? r.top - POPOVER_H - 4 : r.bottom + 4, left: Math.max(8, left) });
    setOpen(true);
  };

  return (
    <Field label={label} className={className}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={`w-full flex items-center justify-between px-3 py-2 bg-white border rounded-md text-sm transition-colors cursor-pointer ${
          open ? 'border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]' : 'border-[var(--border-default)] hover:bg-[var(--surface-subtle)]'
        }`}
      >
        <span className={value ? 'text-[var(--text-primary)] tabular-nums' : 'text-[var(--text-secondary)]'}>
          {value && selected ? format(selected, 'MMM d, yyyy') : t('Select date')}
        </span>
        <CalendarIcon className="w-4 h-4 text-[var(--text-secondary)]" />
      </button>
      {open && pos && (
        <Portal>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[61] bg-white border border-[var(--border-default)] rounded-md p-2 shadow-[0_8px_28px_rgba(44,38,39,0.16)]"
            style={{ top: pos.top, left: pos.left, '--primary': 'var(--brand-primary)', '--primary-foreground': '#FFFFFF' } as React.CSSProperties}
            onClick={(e) => e.stopPropagation()}
          >
            <CalendarUI
              mode="single"
              defaultMonth={selected}
              selected={selected}
              onSelect={(d) => { onChange(d ? format(d, 'yyyy-MM-dd') : ''); setOpen(false); }}
              className="p-0"
            />
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-[var(--surface-subtle)]">
              <button type="button" onClick={() => { onChange(''); setOpen(false); }} className="px-2.5 py-1 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer">
                {t('Clear')}
              </button>
              <button type="button" onClick={() => { onChange(format(new Date(), 'yyyy-MM-dd')); setOpen(false); }} className="px-2.5 py-1 text-xs font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-tint)] rounded-md transition-colors cursor-pointer">
                {t('Today')}
              </button>
            </div>
          </div>
        </Portal>
      )}
    </Field>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      {children}
    </label>
  );
}
