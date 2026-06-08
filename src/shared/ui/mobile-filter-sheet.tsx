import { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Portal } from './portal';

/**
 * Mobile-only trigger that opens the filter sheet. Shows an active-count badge.
 * Render this inside a `sm:hidden` row alongside the search field.
 */
export function MobileFilterButton({
  count,
  onClick,
  label = 'Filters',
  className = '',
}: {
  count: number;
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors shadow-none cursor-pointer ${
        count > 0
          ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--brand-tint)]'
          : 'border-[var(--border-default)] text-[var(--text-tertiary)] bg-white hover:bg-[var(--surface-subtle)]'
      } ${className}`}
    >
      <SlidersHorizontal className="w-4 h-4" />
      {label}
      {count > 0 && (
        <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-semibold rounded-full bg-[var(--brand-primary)] text-white tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}

/** A labelled field wrapper for controls placed inside the sheet. */
export function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-[var(--text-secondary)] mb-1.5">{label}</div>
      {children}
    </div>
  );
}

/**
 * A bottom sheet (mobile only) that slides up from the bottom with the page's
 * secondary filters inside, plus a Clear / Apply footer. Desktop is untouched —
 * keep the inline `hidden sm:flex` filter row for `sm+`.
 */
export function MobileFilterSheet({
  open,
  onClose,
  onClear,
  onApply,
  title = 'Filters',
  clearLabel = 'Clear all',
  applyLabel = 'Show results',
  children,
}: {
  open: boolean;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
  title?: string;
  clearLabel?: string;
  applyLabel?: string;
  children: ReactNode;
}) {
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="sm:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[var(--text-primary)]/30 z-50"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl border-t border-[var(--border-default)] flex flex-col max-h-[85vh] shadow-[0_-4px_24px_rgba(44,38,39,0.12)]"
            >
              {/* Grabber */}
              <div className="pt-3 flex justify-center shrink-0">
                <span className="w-9 h-1 rounded-full bg-[var(--border-strong)]" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--surface-subtle)] shrink-0">
                <h2 className="text-base font-medium text-[var(--text-primary)]">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 -mr-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-5 py-4 overflow-y-auto flex flex-col gap-4">{children}</div>
              <div className="flex items-center gap-3 px-5 py-4 border-t border-[var(--surface-subtle)] shrink-0">
                <button
                  type="button"
                  onClick={onClear}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-tertiary)] bg-white border border-[var(--border-default)] rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                >
                  {clearLabel}
                </button>
                <button
                  type="button"
                  onClick={onApply}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[var(--brand-primary)] rounded-md hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
                >
                  {applyLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
