import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, Slash, RotateCcw, ShieldOff } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';
import { cn } from '@/shared/lib/cn';
import { getCompanyByName, type Company } from '@/shared/data/companies';

type BlockedEntry = {
  companyName: string;
  blockedAt: string; // ISO date
  reason?: string;
};

const DEMO_BLOCKED: BlockedEntry[] = [
  { companyName: 'Erdenet Mining', blockedAt: '2026-04-10', reason: 'Surveys too long for the reward offered' },
  { companyName: 'Nomin Holding', blockedAt: '2026-03-22' },
  { companyName: 'Tavan Bogd Group', blockedAt: '2026-02-18', reason: 'Privacy concerns' },
];

export function BlockedCompaniesDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [blocked, setBlocked] = useState<BlockedEntry[]>(DEMO_BLOCKED);
  const [recentlyUnblocked, setRecentlyUnblocked] = useState<BlockedEntry | null>(null);

  const resolved = useMemo(
    () =>
      blocked
        .map((b) => ({ entry: b, company: getCompanyByName(b.companyName) }))
        .filter((x): x is { entry: BlockedEntry; company: Company } => !!x.company),
    [blocked],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resolved;
    return resolved.filter(
      ({ company }) =>
        company.name.toLowerCase().includes(q) ||
        company.industry.toLowerCase().includes(q),
    );
  }, [resolved, query]);

  const unblock = (entry: BlockedEntry) => {
    setBlocked((list) => list.filter((b) => b.companyName !== entry.companyName));
    setRecentlyUnblocked(entry);
  };

  const undoUnblock = () => {
    if (!recentlyUnblocked) return;
    setBlocked((list) => [recentlyUnblocked, ...list]);
    setRecentlyUnblocked(null);
  };

  const resetAndClose = () => {
    setQuery('');
    setRecentlyUnblocked(null);
    onOpenChange(false);
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={(o) => (o ? onOpenChange(o) : resetAndClose())}>
      <DrawerContent className="!max-w-md data-[vaul-drawer-direction=right]:sm:!max-w-md bg-white border-l border-[var(--border-default)]">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-[var(--border-default)] shrink-0">
          <DrawerTitle className="text-base font-medium text-[var(--text-primary)]">
            {t('Blocked companies')}
            {resolved.length > 0 && (
              <span className="ml-2 text-xs font-normal text-[var(--text-secondary)] tabular-nums">
                {resolved.length}
              </span>
            )}
          </DrawerTitle>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors"
            aria-label={t('Close')}
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DrawerDescription className="sr-only">
            {t('Companies whose surveys are hidden from your feed.')}
          </DrawerDescription>

          {/* Intro + search */}
          <div className="px-6 pt-5 pb-3">
            <p className="text-sm text-[var(--text-tertiary)] leading-relaxed mb-4">
              {t("You won't see surveys from these companies in your feed. Unblocking brings them back right away.")}
            </p>

            {resolved.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder={t('Search blocked companies')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                />
              </div>
            )}
          </div>

          {/* List or empty */}
          <div className="px-6 pb-6">
            {resolved.length === 0 ? (
              <EmptyState />
            ) : filtered.length === 0 ? (
              <NoResults query={query} onClear={() => setQuery('')} />
            ) : (
              <div className="space-y-2">
                {filtered.map(({ entry, company }) => (
                  <BlockedRow
                    key={entry.companyName}
                    company={company}
                    entry={entry}
                    onUnblock={() => unblock(entry)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Fineprint */}
          {resolved.length > 0 && (
            <div className="px-6 pb-8">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t('Blocking is private. The company never learns you blocked them, and your past responses to their surveys are not affected.')}
              </p>
            </div>
          )}
        </div>

        {/* Undo toast */}
        {recentlyUnblocked && (
          <div className="border-t border-[var(--border-default)] px-5 py-3 flex items-center justify-between gap-3 bg-white shrink-0">
            <span className="text-sm text-[var(--text-tertiary)] min-w-0 truncate">
              {t('Unblocked')}{' '}
              <span className="font-medium text-[var(--text-primary)]">
                {recentlyUnblocked.companyName}
              </span>
            </span>
            <button
              type="button"
              onClick={undoUnblock}
              className="text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors shrink-0"
            >
              {t('Undo')}
            </button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function BlockedRow({
  company,
  entry,
  onUnblock,
}: {
  company: Company;
  entry: BlockedEntry;
  onUnblock: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3 p-3 border border-[var(--border-default)] rounded-md bg-white">
      <div className="w-10 h-10 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-tertiary)] text-xs font-medium shrink-0">
        {company.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--text-primary)] truncate">{company.name}</div>
        <div className="text-xs text-[var(--text-secondary)] truncate">
          {company.industry} · {t('Blocked')} {formatBlockedDate(entry.blockedAt)}
        </div>
        {entry.reason && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] bg-[var(--surface-subtle)] px-2 py-0.5 rounded-md">
            <Slash className="w-3 h-3" strokeWidth={2} />
            {entry.reason}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onUnblock}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-default)] rounded-md text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors shrink-0"
      >
        <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
        {t('Unblock')}
      </button>
    </div>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center text-center py-10">
      <div className="w-14 h-14 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center mb-4">
        <ShieldOff className="w-6 h-6 text-[var(--text-tertiary)]" strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
        {t("You haven't blocked anyone")}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">
        {t("If a company's surveys feel spammy or off, you can block them from the company details page and they'll stop showing up here.")}
      </p>
    </div>
  );
}

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center text-center py-10">
      <p className="text-sm text-[var(--text-secondary)] mb-3">
        {t('No blocked companies match')}{' '}
        <span className="font-medium text-[var(--text-primary)]">"{query}"</span>
      </p>
      <button
        type="button"
        onClick={onClear}
        className="text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors"
      >
        {t('Clear search')}
      </button>
    </div>
  );
}

function formatBlockedDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'today';
  if (diffDays < 2) return 'yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 60) return 'last month';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
