import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { format, isAfter, isBefore, subDays, subMonths } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import {
  Search,
  Download,
  Plus,
  Phone,
  Calendar as CalendarIcon,
  Users,
  UserCheck,
  UserCog,
  UserX,
  UserSearch,
  ShieldCheck,
  CheckCircle,
  Check,
  Trash2,
  AlertCircle,
  X,
} from 'lucide-react';

import { Portal } from '@/shared/ui/portal';
import { BrandSelect } from '@/shared/ui/brand-select';
import { Calendar as CalendarUI } from '@/shared/ui/calendar';
import { useResizableColumns, ColResizeHandle, ColLeftDivider, type ColumnDef } from '@/shared/ui/resizable-columns';
import type { Employee, EmployeeRole, EmployeeStatus } from './agents-data';
import { EMPLOYEE_ROLES } from './agents-data';
import { useEmployees } from './use-employees';
import { EmployeeEditor } from './EmployeeEditor';

type RoleFilter = 'All' | EmployeeRole;
type StatusFilter = 'All' | EmployeeStatus;

function getStatusStyles(status: EmployeeStatus) {
  return status === 'Active'
    ? 'bg-[var(--success-tint)] text-[var(--success)]'
    : 'bg-[var(--surface-subtle)] text-[var(--text-secondary)]';
}

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function emptyEmployee(): Employee {
  return { id: '', employeeId: '', fullName: '', email: '', phone: '', role: 'Staff', hireDate: '', status: 'Active' };
}

/** Column layout for the resizable table. `min` caps how small a drag can shrink it. */
const COL_DEFS: ColumnDef[] = [
  { key: 'select', w: 48, min: 48, resizable: false },
  { key: 'no', w: 72, min: 56 },
  { key: 'employeeId', w: 150, min: 110 },
  { key: 'fullName', w: 260, min: 160 },
  { key: 'phone', w: 180, min: 130 },
  { key: 'role', w: 150, min: 100 },
  { key: 'hireDate', w: 170, min: 130 },
  { key: 'status', w: 130, min: 100 },
];

export default function Agents() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { employees, addEmployee, removeEmployee } = useEmployees();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('Custom date range');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const { widths: colWidths, onResizeStart } = useResizableColumns(COL_DEFS);

  const confirmBulkDelete = () => {
    selected.forEach((id) => removeEmployee(id));
    setSelected(new Set());
    setBulkDeleting(false);
  };

  const counts = {
    total: employees.length,
    active: employees.filter((e) => e.status === 'Active').length,
    inactive: employees.filter((e) => e.status === 'Inactive').length,
    managers: employees.filter((e) => e.role === 'Manager' || e.role === 'Sub Manager').length,
  };

  const hasActiveFilters =
    searchQuery !== '' || roleFilter !== 'All' || statusFilter !== 'All' || !!dateRange?.from;
  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setStatusFilter('All');
    setDateRange(undefined);
  };

  const query = searchQuery.trim().toLowerCase();
  const visible = employees.filter((e) => {
    if (roleFilter !== 'All' && e.role !== roleFilter) return false;
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    if (dateRange?.from) {
      if (!e.hireDate) return false;
      const hired = new Date(e.hireDate);
      if (isBefore(hired, dateRange.from)) return false;
      if (dateRange.to && isAfter(hired, dateRange.to)) return false;
    }
    if (query) {
      const haystack = `${e.fullName} ${e.employeeId} ${e.phone} ${e.email}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const visibleIds = visible.map((e) => e.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const stats = [
    { title: 'Total employees', Icon: Users, value: String(counts.total), subtitle: `${counts.active} ${t('active')} · ${counts.inactive} ${t('inactive')}` },
    { title: 'Active', Icon: UserCheck, value: String(counts.active), subtitle: t('Currently employed') },
    { title: 'Managers', Icon: UserCog, value: String(counts.managers), subtitle: t('Manager & sub-manager') },
    { title: 'Inactive', Icon: UserX, value: String(counts.inactive), subtitle: t('Deactivated accounts') },
  ];

  const colLabel: Record<string, string> = {
    select: '',
    no: t('No.'),
    employeeId: t('Employee ID'),
    fullName: t('Full Name'),
    phone: t('Phone number'),
    role: t('Role'),
    hireDate: t('Hire Date'),
    status: t('Status'),
  };

  const dateLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'MMM d, yyyy')} – ${format(dateRange.to, 'MMM d, yyyy')}`
      : format(dateRange.from, 'MMM d, yyyy')
    : t('Hire date');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-6 md:px-8 xl:px-12 py-8 bg-[var(--surface-muted)]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--text-primary)]">{t('Employee Management')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('Manage and maintain the details of all employees')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border-default)] rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors bg-white shadow-none cursor-pointer">
            <Download className="w-4 h-4" />
            {t('Export CSV')}
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] transition-colors shadow-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t('New')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="bg-white border border-[var(--border-default)] rounded-md p-5 flex flex-col justify-center shadow-none hover:border-[var(--brand-border)] transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-medium text-[var(--text-secondary)]">{t(card.title)}</span>
              <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] group-hover:bg-[var(--brand-primary)] group-hover:text-white transition-colors">
                <card.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-medium text-[var(--text-primary)]">{card.value}</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-2">{card.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center flex-wrap">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search by name, ID or phone')}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[var(--border-default)] rounded-md text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)]"
          />
        </div>

        <div className="flex gap-3 w-full sm:w-auto flex-wrap">
          <BrandSelect
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as RoleFilter)}
            leftIcon={<ShieldCheck />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('All Roles') },
              ...EMPLOYEE_ROLES.map((r) => ({ value: r, label: t(r) })),
            ]}
          />

          <BrandSelect
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            leftIcon={<CheckCircle />}
            className="sm:w-auto"
            options={[
              { value: 'All', label: t('All Statuses') },
              { value: 'Active', label: t('Active') },
              { value: 'Inactive', label: t('Inactive') },
            ]}
          />

          {/* Hire-date range filter */}
          <div className="relative">
            <button
              onClick={() => setIsDateOpen((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors shadow-none cursor-pointer ${
                dateRange?.from
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-tint)]'
                  : 'border-[var(--border-default)] text-[var(--text-tertiary)] bg-white hover:bg-[var(--surface-subtle)]'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              {dateLabel}
            </button>

            {isDateOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDateOpen(false)} />
                <div className="absolute top-full right-0 mt-2 bg-white border border-[var(--border-default)] rounded-md z-20 flex shadow-[0_4px_16px_rgba(44,38,39,0.08)]">
                  <div className="w-44 border-r border-[var(--border-default)] p-2 flex flex-col gap-1">
                    {['Last 7 days', 'Last 30 days', 'Last 90 days', 'Last 12 months', 'Custom date range'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setSelectedPreset(preset);
                          if (preset === 'Last 7 days') setDateRange({ from: subDays(new Date(), 7), to: new Date() });
                          else if (preset === 'Last 30 days') setDateRange({ from: subDays(new Date(), 30), to: new Date() });
                          else if (preset === 'Last 90 days') setDateRange({ from: subDays(new Date(), 90), to: new Date() });
                          else if (preset === 'Last 12 months') setDateRange({ from: subMonths(new Date(), 12), to: new Date() });
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors shadow-none cursor-pointer ${
                          selectedPreset === preset
                            ? 'bg-[var(--surface-subtle)] text-[var(--text-primary)] font-medium'
                            : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)]'
                        }`}
                      >
                        {t(preset)}
                        {selectedPreset === preset && <Check className="w-4 h-4 text-[var(--brand-primary)]" />}
                      </button>
                    ))}
                  </div>
                  <div className="p-4" style={{ '--primary': 'var(--brand-primary)', '--primary-foreground': '#FFFFFF' } as React.CSSProperties}>
                    <CalendarUI
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={(range) => { setDateRange(range); setSelectedPreset('Custom date range'); }}
                      numberOfMonths={2}
                      className="border-0 shadow-none p-0"
                    />
                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[var(--surface-subtle)]">
                      <button
                        onClick={() => { setDateRange(undefined); setSelectedPreset('Custom date range'); setIsDateOpen(false); }}
                        className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors shadow-none cursor-pointer"
                      >
                        {t('Clear')}
                      </button>
                      <button
                        onClick={() => setIsDateOpen(false)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors shadow-none cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        {t('Apply')}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center w-9 h-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-full transition-colors border border-transparent hover:border-[var(--border-default)] shadow-none cursor-pointer flex-shrink-0"
              title={t('Clear filters')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk selection bar */}
      <AnimatePresence initial={false}>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 mb-4 px-4 py-2.5 bg-[var(--brand-tint)] border border-[var(--brand-border)] rounded-md">
              <span className="text-sm font-medium text-[var(--brand-primary)] tabular-nums">
                {selected.size} {t('selected')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelected(new Set())}
                  className="px-3 py-1.5 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white rounded-md transition-colors cursor-pointer"
                >
                  {t('Clear')}
                </button>
                <button
                  onClick={() => setBulkDeleting(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--danger)] bg-white border border-[var(--danger-border)] rounded-md hover:bg-[var(--danger-tint)] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('Delete')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-md border border-[var(--border-default)] overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="text-left text-sm whitespace-nowrap table-fixed" style={{ minWidth: '100%' }}>
            <colgroup>
              {COL_DEFS.map((c) => (
                <col key={c.key} style={{ width: colWidths[c.key] }} />
              ))}
            </colgroup>
            <thead>
              <tr className="group/head border-b border-[var(--border-default)] text-[var(--text-tertiary)] font-medium select-none">
                {COL_DEFS.map((c, i) => (
                  <th
                    key={c.key}
                    className={`group/col relative py-4 font-medium text-[11px] tracking-wider uppercase transition-colors hover:bg-[var(--surface-subtle)] ${c.key === 'select' ? 'pl-6 pr-3' : 'px-6'}`}
                  >
                    {i > 0 && <ColLeftDivider />}
                    {c.key === 'select' ? (
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--brand-primary)] cursor-pointer align-middle"
                        aria-label={t('Select all')}
                      />
                    ) : (
                      <span className="block truncate">{colLabel[c.key]}</span>
                    )}
                    {c.resizable !== false && (
                      <ColResizeHandle onPointerDown={(e) => onResizeStart(c.key, e)} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-subtle)]">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="flex items-center justify-center mb-3">
                        <UserSearch className="w-8 h-8 text-[var(--text-secondary)]" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{t('No employees found')}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {hasActiveFilters
                          ? t('No employees match these filters.')
                          : t('Add your first employee to get started.')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visible.map((e, index) => (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    onClick={() => navigate(`/agents/${e.id}`)}
                    className="hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                  >
                    <td className="pl-6 pr-3 py-4" onClick={(ev) => ev.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(e.id)}
                        onChange={() => toggleOne(e.id)}
                        className="w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--brand-primary)] cursor-pointer align-middle"
                        aria-label={t('Select row')}
                      />
                    </td>
                    <td className="px-6 py-4 text-[var(--text-tertiary)] tabular-nums">{visible.length - index}</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{e.employeeId}</td>
                    <td className="px-6 py-4 overflow-hidden">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center text-sm font-medium shrink-0 overflow-hidden">
                          {e.avatarUrl ? (
                            <img src={e.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            initialOf(e.fullName)
                          )}
                        </div>
                        <span className="font-medium text-[var(--text-primary)] truncate">{e.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-tertiary)]">
                      <span className="inline-flex items-center gap-2 tabular-nums">
                        <Phone className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        {e.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-primary)]">{t(e.role)}</td>
                    <td className="px-6 py-4 text-[var(--text-tertiary)]">
                      {e.hireDate ? (
                        <span className="inline-flex items-center gap-2 tabular-nums">
                          <CalendarIcon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          {e.hireDate}
                        </span>
                      ) : (
                        <span className="text-[var(--text-secondary)]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium tracking-wide rounded-full ${getStatusStyles(e.status)}`}>
                        {t(e.status)}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--surface-subtle)] bg-white">
          <span className="text-sm text-[var(--text-secondary)]">
            {t('Showing')} 1 {t('to')} {visible.length} {t('of')} {counts.total} {t('employees')}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled
              className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('Previous')}
            </button>
            <button className="h-8 min-w-8 px-2 inline-flex items-center justify-center text-sm font-medium border border-[var(--brand-primary)] rounded-md bg-[var(--brand-primary)] text-white tabular-nums cursor-default">
              1
            </button>
            <button className="h-8 px-3 inline-flex items-center text-sm font-normal border border-[var(--border-default)] rounded-md bg-white text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
              {t('Next')}
            </button>
          </div>
        </div>
      </div>

      {/* Add modal */}
      {isCreating && (
        <EmployeeEditor
          mode="new"
          initial={emptyEmployee()}
          onClose={() => setIsCreating(false)}
          onSave={(emp) => { addEmployee(emp); setIsCreating(false); }}
        />
      )}

      {/* Bulk delete confirmation */}
      <Portal>
        <AnimatePresence>
          {bulkDeleting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[var(--text-primary)]/30 flex items-center justify-center z-50 p-4"
              onClick={() => setBulkDeleting(false)}
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
                  <h2 className="text-lg font-medium text-[var(--text-primary)]">
                    {t('Delete')} {selected.size} {t('employees')}?
                  </h2>
                  <button
                    onClick={() => setBulkDeleting(false)}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors p-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">
                    {t('This permanently removes the selected employee records. This action cannot be undone.')}
                  </p>
                  <p className="mt-4 text-[var(--danger)] text-xs font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {t('This action cannot be undone.')}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--surface-subtle)]">
                  <button
                    onClick={() => setBulkDeleting(false)}
                    className="px-4 py-2 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    onClick={confirmBulkDelete}
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
