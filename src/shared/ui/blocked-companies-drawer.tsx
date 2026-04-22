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
      <DrawerContent className="!max-w-lg data-[vaul-drawer-direction=right]:sm:!max-w-lg bg-white border-l border-[#EBEBEB]">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-[#EBEBEB] shrink-0">
          <DrawerTitle className="text-base font-medium text-[#1A1A1A]">
            {t('Blocked companies')}
            {resolved.length > 0 && (
              <span className="ml-2 text-xs font-normal text-[#616161] tabular-nums">
                {resolved.length}
              </span>
            )}
          </DrawerTitle>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-[#616161] hover:bg-[#F3F3F3] rounded-md transition-colors"
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
            <p className="text-sm text-[#4A4A4A] leading-relaxed mb-4">
              {t("You won't see surveys from these companies in your feed. Unblocking brings them back right away.")}
            </p>

            {resolved.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#616161]" strokeWidth={1.75} />
                <input
                  type="text"
                  placeholder={t('Search blocked companies')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#EBEBEB] rounded-md text-sm text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:border-[#FF3C21] transition-colors"
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
              <p className="text-xs text-[#616161] leading-relaxed">
                {t('Blocking is private. The company never learns you blocked them, and your past responses to their surveys are not affected.')}
              </p>
            </div>
          )}
        </div>

        {/* Undo toast */}
        {recentlyUnblocked && (
          <div className="border-t border-[#EBEBEB] px-5 py-3 flex items-center justify-between gap-3 bg-white shrink-0">
            <span className="text-sm text-[#4A4A4A] min-w-0 truncate">
              {t('Unblocked')}{' '}
              <span className="font-medium text-[#1A1A1A]">
                {recentlyUnblocked.companyName}
              </span>
            </span>
            <button
              type="button"
              onClick={undoUnblock}
              className="text-sm font-medium text-[#FF3C21] hover:text-[#E63419] transition-colors shrink-0"
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
    <div className="flex items-start gap-3 p-3 border border-[#EBEBEB] rounded-md bg-white">
      <div className="w-10 h-10 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[#4A4A4A] text-xs font-medium shrink-0">
        {company.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#1A1A1A] truncate">{company.name}</div>
        <div className="text-xs text-[#616161] truncate">
          {company.industry} · {t('Blocked')} {formatBlockedDate(entry.blockedAt)}
        </div>
        {entry.reason && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-[#616161] bg-[#F3F3F3] px-2 py-0.5 rounded-md">
            <Slash className="w-3 h-3" strokeWidth={2} />
            {entry.reason}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onUnblock}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#EBEBEB] rounded-md text-xs font-medium text-[#1A1A1A] hover:bg-[#F3F3F3] transition-colors shrink-0"
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
      <div className="w-14 h-14 rounded-full bg-[#F3F3F3] flex items-center justify-center mb-4">
        <ShieldOff className="w-6 h-6 text-[#4A4A4A]" strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-medium text-[#1A1A1A] mb-1">
        {t("You haven't blocked anyone")}
      </h3>
      <p className="text-sm text-[#616161] max-w-sm leading-relaxed">
        {t("If a company's surveys feel spammy or off, you can block them from the company details page and they'll stop showing up here.")}
      </p>
    </div>
  );
}

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center text-center py-10">
      <p className="text-sm text-[#616161] mb-3">
        {t('No blocked companies match')}{' '}
        <span className="font-medium text-[#1A1A1A]">"{query}"</span>
      </p>
      <button
        type="button"
        onClick={onClear}
        className="text-sm font-medium text-[#FF3C21] hover:text-[#E63419] transition-colors"
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
