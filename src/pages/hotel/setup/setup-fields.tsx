import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Shared input class for the setup wizard — mirrors the `fieldInput` style used
 * across the hotel editors (white, bordered, brand focus ring).
 */
export const setupInput =
  'w-full px-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-muted)] transition-colors';

/**
 * Apollo-style labelled field: label (+ required asterisk), optional helper text
 * above the control, and an optional character counter below.
 */
export function SetupField({
  label,
  hint,
  required,
  counter,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  counter?: { value: number; max: number };
  error?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-[var(--text-primary)]">
        {label}
        {required && <span className="text-[var(--danger)] ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-[var(--text-secondary)] mt-1 mb-2">{hint}</p>}
      <div className={hint ? '' : 'mt-2'}>{children}</div>
      {(error || counter) && (
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs font-medium text-[var(--danger)] flex items-center gap-1">
            {error && (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </>
            )}
          </span>
          {counter && (
            <span className="text-xs text-[var(--text-muted)] tabular-nums">
              {counter.value}/{counter.max}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Grey informational banner (the "we'll pre-fill…" note in the inspiration). */
export function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 px-4 py-3 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-md">
      <Info className="w-4 h-4 text-[var(--text-secondary)] shrink-0 mt-0.5" />
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{children}</p>
    </div>
  );
}

/** "Show / Hide additional inputs" collapsible section. */
export function AdditionalInputs({
  showLabel,
  hideLabel,
  children,
}: {
  showLabel: string;
  hideLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors cursor-pointer"
      >
        {open ? hideLabel : showLabel}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-5 space-y-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Section heading inside a step body. */
export function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="text-lg font-medium text-[var(--text-primary)] tracking-tight">{title}</h3>
      {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">{subtitle}</p>}
    </div>
  );
}
