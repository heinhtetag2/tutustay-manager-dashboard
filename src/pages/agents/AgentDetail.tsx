import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  Trash2,
  AlertCircle,
  Mail,
  Phone,
  Hash,
  ShieldCheck,
  BadgeCheck,
  User,
  Cake,
  CreditCard,
  Briefcase,
  KeyRound,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  UserPlus,
  Send,
  X,
} from 'lucide-react';

import { Portal } from '@/shared/ui/portal';
import { STAT_TONE } from '@/shared/ui/stat-tone';
import type { Employee, EmployeeStatus } from './agents-data';
import { useEmployees } from './use-employees';
import { EmployeeEditor } from './EmployeeEditor';

function getStatusBadge(status: EmployeeStatus) {
  return status === 'Active'
    ? { cls: 'bg-[var(--success-tint)] text-[var(--success)]', Icon: CheckCircle2 }
    : { cls: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]', Icon: XCircle };
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export default function AgentDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const employee = useEmployees((s) => s.employees.find((e) => e.id === id));
  const updateEmployee = useEmployees((s) => s.updateEmployee);
  const removeEmployee = useEmployees((s) => s.removeEmployee);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notes, setNotes] = useState<{ id: number; text: string; date: string }[]>([]);
  const [noteDraft, setNoteDraft] = useState('');

  if (!employee) {
    return (
      <div className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full">
        <div className="bg-white border border-[var(--border-default)] rounded-md p-12 text-center">
          <p className="text-[var(--text-secondary)]">{t('Employee not found.')}</p>
          <button
            onClick={() => navigate('/agents')}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] rounded-md text-sm font-medium text-white hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Employees')}
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusBadge(employee.status);
  const hired = employee.hireDate ? new Date(employee.hireDate) : null;

  const stats = [
    { title: 'Role', Icon: ShieldCheck, value: t(employee.role), subtitle: t('Position'), tone: 'brand' as const },
    {
      title: 'Status',
      Icon: BadgeCheck,
      value: t(employee.status),
      subtitle: employee.status === 'Active' ? t('Currently employed') : t('Deactivated account'),
      tone: employee.status === 'Active' ? ('success' as const) : ('danger' as const),
    },
    {
      title: 'Tenure',
      Icon: Clock,
      value: hired ? formatDistanceToNow(hired) : '—',
      subtitle: hired ? t('Since hire date') : t('Hire date not set'),
      tone: 'info' as const,
    },
    {
      title: 'Hire date',
      Icon: CalendarIcon,
      value: hired ? format(hired, 'MMM yyyy') : '—',
      subtitle: hired ? formatDistanceToNow(hired, { addSuffix: true }) : t('Not set'),
      tone: 'purple' as const,
    },
  ];

  const events = [
    hired && { Icon: UserPlus, tone: 'bg-[var(--brand-tint)] text-[var(--brand-primary)]', label: t('Joined the team'), detail: `${employee.employeeId} · ${t(employee.role)}`, date: employee.hireDate },
    { Icon: ShieldCheck, tone: 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)]', label: t('Role assigned'), detail: t(employee.role), date: employee.hireDate || '' },
    employee.status === 'Inactive'
      ? { Icon: XCircle, tone: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]', label: t('Account deactivated'), detail: t('No longer active on the platform'), date: employee.hireDate }
      : { Icon: CheckCircle2, tone: 'bg-[var(--success-tint)] text-[var(--success)]', label: t('Active employee'), detail: t('Account in good standing'), date: employee.hireDate },
  ].filter(Boolean) as { Icon: React.ElementType; tone: string; label: string; detail: string; date: string }[];

  const addNote = () => {
    const text = noteDraft.trim();
    if (!text) return;
    setNotes((prev) => [{ id: Date.now(), text, date: new Date().toISOString() }, ...prev]);
    setNoteDraft('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)] min-h-full"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] mb-4">
        <button
          onClick={() => navigate('/agents')}
          className="text-[13px] leading-none font-normal hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          {t('Employees')}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
        <span className="text-[13px] leading-none text-[var(--text-primary)] font-medium truncate">{employee.fullName}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-14 h-14 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-xl font-medium shrink-0 overflow-hidden">
            {employee.avatarUrl ? (
              <img src={employee.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              initialOf(employee.fullName)
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-serif text-[var(--text-primary)] leading-tight mb-1.5">{employee.fullName}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${status.cls}`}>
                <status.Icon className="w-3 h-3" />
                {t(employee.status)}
              </span>
              <span className="text-sm text-[var(--text-tertiary)]">{employee.employeeId}</span>
              <span className="text-sm text-[var(--text-secondary)]">·</span>
              <span className="text-sm text-[var(--text-tertiary)]">{employee.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            {t('Edit')}
          </button>
          <button
            onClick={() => setIsDeleting(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            {t('Delete')}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
        {stats.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="bg-white border border-[var(--border-default)] rounded-md p-3 sm:p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group"
          >
            <div className="flex justify-between items-start mb-1.5 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className={`p-2 rounded-md transition-colors ${STAT_TONE[card.tone]}`}>
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-medium text-[var(--text-primary)]">{card.value}</div>
            <div className="text-[11px] sm:text-xs text-[var(--text-tertiary)] mt-1 sm:mt-2 truncate">{card.subtitle}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile + notes */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Profile')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Employee account details')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 px-6 py-5">
              <InfoRow Icon={Mail} label={t('Email')}>
                <a href={`mailto:${employee.email}`} className="text-sm text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-colors break-all">
                  {employee.email}
                </a>
              </InfoRow>
              <InfoRow Icon={Phone} label={t('Phone number')}>
                <span className="text-sm text-[var(--text-primary)] tabular-nums">{employee.phone || '—'}</span>
              </InfoRow>
              <InfoRow Icon={Hash} label={t('Employee ID')}>
                <span className="text-sm text-[var(--text-primary)]">{employee.employeeId}</span>
              </InfoRow>
              <InfoRow Icon={ShieldCheck} label={t('Role')}>
                <span className="text-sm text-[var(--text-primary)]">{t(employee.role)}</span>
              </InfoRow>
              <InfoRow Icon={CalendarIcon} label={t('Hire Date')}>
                <span className="text-sm text-[var(--text-primary)] tabular-nums">{employee.hireDate || '—'}</span>
              </InfoRow>
              <InfoRow Icon={User} label={t('Gender')}>
                <span className="text-sm text-[var(--text-primary)]">{employee.gender ? t(employee.gender) : '—'}</span>
              </InfoRow>
              <InfoRow Icon={Cake} label={t('Date of birth')}>
                <span className="text-sm text-[var(--text-primary)] tabular-nums">{employee.dateOfBirth || '—'}</span>
              </InfoRow>
              <InfoRow Icon={CreditCard} label={t('Resident ID number')}>
                <span className="text-sm text-[var(--text-primary)] tabular-nums">{employee.residentId || '—'}</span>
              </InfoRow>
              <InfoRow Icon={Briefcase} label={t('Employee type')}>
                <span className="text-sm text-[var(--text-primary)]">{employee.employmentType ? t(employee.employmentType) : '—'}</span>
              </InfoRow>
              <InfoRow Icon={KeyRound} label={t('Login ID')}>
                <span className="text-sm text-[var(--text-primary)]">{employee.loginId || '—'}</span>
              </InfoRow>
            </div>
          </section>

          {/* Admin notes */}
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
                        <span className="text-xs text-[var(--text-secondary)] mt-1 block tabular-nums">{format(new Date(n.date), 'MMM d, yyyy · h:mm a')}</span>
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

        {/* Right column */}
        <div className="space-y-4">
          <section className="bg-white border border-[var(--border-default)] rounded-md shadow-none overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--surface-subtle)]">
              <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Activity')}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Recent account events')}</p>
            </div>
            <ol className="px-6 py-5 space-y-5">
              {events.map((event, i) => (
                <li key={`${event.label}-${i}`} className="flex gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${event.tone}`}>
                    <event.Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{event.label}</div>
                    {event.detail && <div className="text-xs text-[var(--text-secondary)] mt-0.5">{event.detail}</div>}
                    {event.date && (
                      <div className="text-xs text-[var(--text-secondary)] mt-1 tabular-nums">{format(new Date(event.date), 'MMM d, yyyy')}</div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {isEditing && (
        <EmployeeEditor
          mode="edit"
          initial={employee as Employee}
          onClose={() => setIsEditing(false)}
          onSave={(emp) => { updateEmployee(emp); setIsEditing(false); }}
        />
      )}

      {/* Delete confirmation */}
      <Portal>
        <AnimatePresence>
          {isDeleting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[var(--text-primary)]/30 flex items-center justify-center z-50 p-4"
              onClick={() => setIsDeleting(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="bg-white rounded-md w-full max-w-sm shadow-none border border-[var(--surface-subtle)] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-subtle)]">
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">{t('Delete employee?')}</h2>
                  <button
                    onClick={() => setIsDeleting(false)}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">
                    {t('This permanently removes the employee record. This action cannot be undone.')}
                  </p>
                  <div className="mt-3 p-3 bg-white border border-[var(--border-default)] rounded-md flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0">
                      {initialOf(employee.fullName)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--text-primary)] text-sm truncate">{employee.fullName}</div>
                      <div className="text-[var(--text-secondary)] text-xs truncate">{employee.employeeId} · {t(employee.role)}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-[var(--danger)] text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t('This action cannot be undone.')}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-subtle)]">
                  <button
                    onClick={() => setIsDeleting(false)}
                    className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    onClick={() => { removeEmployee(employee.id); navigate('/agents'); }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md bg-[var(--danger-strong)] hover:bg-[var(--danger)] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('Delete')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
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
