import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Check, X, Layers, KeyRound, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useOnboarding } from './use-onboarding';

/**
 * Guided "set up your rooms" card for the Rooms page. Teaches the Room Type →
 * Room model and launches the real create flows. Re-shows each refresh; retires
 * once at least one room exists. Rendered inside Rooms.tsx so it can drive the
 * page's own editors.
 */
export function RoomsGuide({
  roomTypeCount,
  roomCount,
  onCreateType,
  onAddRoom,
}: {
  roomTypeCount: number;
  roomCount: number;
  onCreateType: () => void;
  onAddRoom: () => void;
}) {
  const { t } = useTranslation();
  const dismissed = useOnboarding((s) => s.roomsGuideDismissed);
  const dismiss = useOnboarding((s) => s.dismissRoomsGuide);
  const startTour = useOnboarding((s) => s.startTour);

  const hasType = roomTypeCount > 0;
  const hasRoom = roomCount > 0;

  // Demo: the guide stays visible (steps show as done) until dismissed, so the
  // onboarding is discoverable even though sample rooms already exist.
  if (dismissed) return null;

  return (
    <motion.div
      data-tour="rooms-guide"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 bg-white border border-[var(--border-default)] rounded-md overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-5 py-4 border-b border-[var(--surface-subtle)]">
        <div className="w-9 h-9 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-[var(--text-primary)]">{t('Set up your rooms in 2 steps')}</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-0.5 leading-relaxed">
            {t('A')} <span className="font-medium text-[var(--text-secondary)]">{t('Room Type')}</span>{' '}
            {t('is a reusable price-and-features template. A')}{' '}
            <span className="font-medium text-[var(--text-secondary)]">{t('Room')}</span>{' '}
            {t('is a physical room of that type that guests book.')}
          </div>
        </div>
        <button
          type="button"
          onClick={() => startTour('rooms')}
          className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-xs font-medium text-[var(--brand-primary)] hover:underline px-1"
        >
          <BookOpen className="w-3.5 h-3.5" />
          {t('Take a quick tour')}
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('Dismiss')}
          className="p-1 -mr-1 rounded-md text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)] transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Steps */}
      <div className="p-4 grid gap-3 sm:grid-cols-2">
        <Step
          n={1}
          done={hasType}
          Icon={Layers}
          title={t('Create a room type')}
          desc={t('Set the price — nightly, hourly session, and weekend — plus beds and amenities.')}
          cta={hasType ? t('Add another') : t('Create room type')}
          onClick={onCreateType}
        />
        <Step
          n={2}
          done={hasRoom}
          Icon={KeyRound}
          title={t('Add rooms of that type')}
          desc={t('Each room (e.g. Room 201) inherits its type’s price and amenities, then becomes bookable.')}
          cta={t('Add room')}
          onClick={onAddRoom}
          disabled={!hasType}
          disabledHint={t('Create a room type first')}
        />
      </div>
    </motion.div>
  );
}

function Step({
  n,
  done,
  Icon,
  title,
  desc,
  cta,
  onClick,
  disabled,
  disabledHint,
}: {
  n: number;
  done: boolean;
  Icon: typeof Layers;
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'rounded-md border p-3.5 flex flex-col',
        done ? 'border-[var(--surface-subtle)] bg-[var(--surface-muted)]' : 'border-[var(--border-default)]',
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0',
            done ? 'bg-[var(--success)] text-white' : 'bg-[var(--brand-tint)] text-[var(--brand-primary)]',
          )}
        >
          {done ? <Check className="w-3 h-3" strokeWidth={3} /> : n}
        </span>
        <span className="text-sm font-medium text-[var(--text-primary)]">{title}</span>
        <Icon className="w-3.5 h-3.5 text-[var(--text-tertiary)] ml-auto" />
      </div>
      <p className="text-xs text-[var(--text-tertiary)] leading-relaxed flex-1">{desc}</p>
      <div className="mt-3">
        {disabled ? (
          <span className="text-xs text-[var(--text-tertiary)] italic">{disabledHint}</span>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className={cn(
              'inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium transition-colors',
              done
                ? 'text-[var(--text-secondary)] hover:bg-white border border-[var(--border-default)]'
                : 'bg-[var(--brand-primary)] text-white hover:opacity-90',
            )}
          >
            {cta}
            {!done && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
