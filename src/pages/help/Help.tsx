import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Book,
  Video,
  MessageCircle,
  MessageSquare,
  Mail,
  X,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/shared/ui/drawer';
import { STAT_TONE } from '@/shared/ui/stat-tone';
import {
  HELP_CATEGORIES,
  HELP_ARTICLES,
  POPULAR_ARTICLE_SLUGS,
  getCategoryBySlug,
  getArticleBySlug,
  getArticlesInCategory,
  type HelpArticleMeta,
} from './help-data';
import { HELP_ICONS } from './icon-map';

type DrawerView =
  | { kind: 'category'; slug: string }
  | { kind: 'article'; slug: string; backToCategory?: string };

// Rotate accent hues so each browse-by-topic category chip reads distinctly.
const CATEGORY_TONES = ['info', 'purple', 'pink', 'amber', 'brand'] as const;

function ArticleBody({ article }: { article: HelpArticleMeta }) {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-[var(--text-primary)]">
      <p>
        {article.description} This guide walks through what you need to know, highlights
        common pitfalls, and links to related topics so you can come back whenever you
        need a refresher.
      </p>

      <h3 className="text-base font-medium text-[var(--text-primary)] pt-2">Before you start</h3>
      <p>
        Keep your <span className="font-medium text-[var(--text-primary)]">rooms</span> and{' '}
        <span className="font-medium text-[var(--text-primary)]">pricing</span> up to date — accurate
        room types, rates, and availability mean cleaner bookings, fewer cancellations, and
        revenue figures you can trust across the dashboard.
      </p>

      <div className="bg-[var(--brand-tint)] border border-[var(--brand-tint-2)] rounded-md p-4 flex gap-3">
        <span className="text-[var(--brand-primary)] font-medium shrink-0">Tip</span>
        <p className="text-[var(--text-tertiary)]">
          Start each day on the Dashboard — review today's arrivals and departures, then clear
          any pending booking requests so dates don't sit unconfirmed.
        </p>
      </div>

      <h3 className="text-base font-medium text-[var(--text-primary)] pt-2">Step-by-step</h3>
      <ol className="list-decimal list-outside pl-5 space-y-2">
        <li>Open <span className="font-medium text-[var(--text-primary)]">Booking Requests</span> from the sidebar to review incoming requests.</li>
        <li>Approve or decline each one — approving creates a confirmed reservation.</li>
        <li>Manage stays under <span className="font-medium text-[var(--text-primary)]">Reservation Management</span>: check guests in and out.</li>
        <li>Track occupancy and revenue on the <span className="font-medium text-[var(--text-primary)]">Sales Calendar</span> and Dashboard.</li>
        <li>Reconcile payouts under <span className="font-medium text-[var(--text-primary)]">Settlement</span> when each period closes.</li>
      </ol>

      <h3 className="text-base font-medium text-[var(--text-primary)] pt-2">What to do next</h3>
      <ul className="list-disc list-outside pl-5 space-y-2">
        <li>Run promotions from <span className="font-medium text-[var(--text-primary)]">Coupon Management</span> — coupons go live once the super-admin approves them.</li>
        <li>Reply to guest feedback under <span className="font-medium text-[var(--text-primary)]">Customer Reviews</span> to keep your rating strong.</li>
        <li>Adjust room types, rates, and amenities anytime under <span className="font-medium text-[var(--text-primary)]">Room Management</span>.</li>
      </ul>

      <div className="bg-[var(--surface-muted)] border border-[var(--border-default)] rounded-md p-4">
        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Good to know</p>
        <p className="text-sm text-[var(--text-tertiary)]">
          Booking revenue is paid out in bi-weekly settlements: gross minus the platform
          commission and any refund adjustments equals your net payout. You can review every
          period and export the records as a CSV from the Settlement page.
        </p>
      </div>
    </div>
  );
}

export default function Help() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<DrawerView | null>(null);

  const openCategory = (slug: string) => setView({ kind: 'category', slug });
  const openArticle = (slug: string, backToCategory?: string) =>
    setView({ kind: 'article', slug, backToCategory });
  const closeDrawer = () => setView(null);

  const popularArticles = POPULAR_ARTICLE_SLUGS.map((s) => getArticleBySlug(s)).filter(
    (a): a is HelpArticleMeta => !!a,
  );

  // Global search across titles + descriptions
  const searchResults = query.trim()
    ? HELP_ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.description.toLowerCase().includes(query.toLowerCase()),
      )
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto w-full px-4 sm:px-6 md:px-8 xl:px-12 py-6 sm:py-8 bg-[var(--surface-muted)]"
    >
      {/* Header */}
      <div className="mb-8 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-serif text-[var(--text-primary)]">{t('Help Center')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {t('Learn how the dashboard works, get tips for running your property, and find quick answers.')}
        </p>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="relative max-w-2xl mb-6"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Search for help, guides, keywords...')}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-[var(--border-default)] rounded-md text-base focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] placeholder:text-[var(--text-secondary)] transition-colors"
        />
      </motion.div>

      {/* Search results (inline) */}
      {searchResults && (
        <div className="mb-10 max-w-2xl bg-white border border-[var(--border-default)] rounded-md overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--surface-subtle)] flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              {searchResults.length} {t('results')}
            </span>
            <button
              onClick={() => setQuery('')}
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {t('Clear')}
            </button>
          </div>
          {searchResults.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[var(--text-secondary)]">
              {t('No articles match your search.')}
            </div>
          ) : (
            <div className="divide-y divide-[var(--surface-subtle)]">
              {searchResults.slice(0, 6).map((a) => (
                <button
                  key={a.slug}
                  onClick={() => openArticle(a.slug, a.categorySlug)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[var(--surface-muted)] transition-colors cursor-pointer group"
                >
                  <div className="p-1.5 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] shrink-0">
                    <Book className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">{a.title}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                      {getCategoryBySlug(a.categorySlug)?.title} · {a.readTime} {t('read')}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-tertiary)] transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      {!searchResults && (
        <>
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="text-base font-medium text-[var(--text-primary)]">{t('Browse by topic')}</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {t('Pick a category to explore articles')}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {HELP_CATEGORIES.map((cat, i) => {
                const Icon = HELP_ICONS[cat.iconKey];
                const count = getArticlesInCategory(cat.slug).length;
                return (
                  <motion.button
                    key={cat.slug}
                    onClick={() => openCategory(cat.slug)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.08 + i * 0.04 }}
                    className="text-left bg-white border border-[var(--border-default)] rounded-md p-5 hover:border-[var(--brand-border)] hover:bg-[var(--surface-muted)] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-md transition-colors ${STAT_TONE[CATEGORY_TONES[i % CATEGORY_TONES.length]]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-[var(--text-primary)]">{t(cat.title)}</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                          {t(cat.description)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--surface-subtle)]">
                      <span className="text-xs font-medium text-[var(--text-secondary)] tabular-nums">
                        {count} {t('articles')}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Popular + Contact */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="lg:col-span-2 bg-white border border-[var(--border-default)] rounded-md overflow-hidden"
            >
              <div className="px-6 pt-5 pb-4">
                <h2 className="text-base font-medium text-[var(--text-primary)]">
                  {t('Popular articles')}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t('Most viewed this week')}</p>
              </div>
              <div className="divide-y divide-[var(--surface-subtle)] border-t border-[var(--surface-subtle)]">
                {popularArticles.map((article) => (
                  <button
                    key={article.slug}
                    onClick={() => openArticle(article.slug, article.categorySlug)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-[var(--surface-muted)] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-1.5 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] shrink-0 mt-0.5">
                        <Book className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--text-primary)] text-sm truncate">
                          {t(article.title)}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {getCategoryBySlug(article.categorySlug)?.title} · {article.readTime}{' '}
                          {t('read')}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-tertiary)] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="bg-white border border-[var(--border-default)] rounded-md p-6 flex flex-col"
            >
              <div className="p-2.5 bg-[var(--brand-tint)] rounded-md text-[var(--brand-primary)] w-fit mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-[var(--text-primary)]">{t('Still need help?')}</h3>
              <p className="text-sm text-[var(--text-tertiary)] mt-1 leading-relaxed">
                {t('Our support team usually responds within a few hours on business days.')}
              </p>
              <div className="mt-5 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--brand-primary)] text-white rounded-md text-sm font-medium hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                  {t('Start a conversation')}
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[var(--text-primary)] border border-[var(--border-default)] rounded-md text-sm font-medium hover:bg-[var(--surface-muted)] transition-colors cursor-pointer">
                  <Mail className="w-4 h-4" />
                  {t('Email support')}
                </button>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--surface-subtle)]">
                <p className="text-xs text-[var(--text-secondary)] mb-1">{t('Response time')}</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{t('Under 4 hours')}</p>
              </div>
            </motion.div>
          </div>

          {/* Resources strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { title: 'Video tutorials', description: 'Short walkthroughs of reservations, rooms, and settlement', Icon: Video },
              { title: 'Policies & payout terms', description: 'Commission, the settlement schedule, and payout terms', Icon: Book },
              { title: 'Contact support', description: 'Chat or email the TutuStay team', Icon: MessageSquare },
            ].map((r) => (
              <button
                key={r.title}
                className="flex items-center gap-3 bg-white border border-[var(--border-default)] rounded-md p-4 text-left hover:border-[var(--brand-border)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer group"
              >
                <div className="p-2 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] group-hover:text-[var(--brand-primary)] transition-colors shrink-0">
                  <r.Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{t(r.title)}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{t(r.description)}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-tertiary)] transition-colors shrink-0" />
              </button>
            ))}
          </motion.div>
        </>
      )}

      {/* Right-sliding drawer for category list / article view */}
      <Drawer direction="right" open={!!view} onOpenChange={(o) => !o && closeDrawer()}>
        <DrawerContent className="!max-w-lg data-[vaul-drawer-direction=right]:sm:!max-w-lg bg-white border-l border-[var(--border-default)]">
          {view?.kind === 'category' && <CategoryPanel slug={view.slug} onOpenArticle={openArticle} onClose={closeDrawer} />}
          {view?.kind === 'article' && (
            <ArticlePanel
              slug={view.slug}
              backToCategory={view.backToCategory}
              onBackToCategory={(cat) => setView({ kind: 'category', slug: cat })}
              onClose={closeDrawer}
            />
          )}
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
}

// --- Category panel (articles list) ---
function CategoryPanel({
  slug,
  onOpenArticle,
  onClose,
}: {
  slug: string;
  onOpenArticle: (articleSlug: string, backToCategory: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const category = getCategoryBySlug(slug);
  if (!category) return null;
  const Icon = HELP_ICONS[category.iconKey];
  const articles = getArticlesInCategory(slug);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[var(--surface-subtle)] flex items-start justify-between gap-4 shrink-0">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex items-center justify-center w-11 h-11 rounded-md bg-[var(--brand-tint)] text-[var(--brand-primary)] shrink-0">
            <Icon className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <DrawerTitle className="text-base font-medium text-[var(--text-primary)]">
              {category.title}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-[var(--text-secondary)] mt-1">
              {category.description}
            </DrawerDescription>
            <p className="text-xs text-[var(--text-secondary)] mt-2 tabular-nums">
              {articles.length} {t('articles')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer shrink-0"
          aria-label={t('Close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Articles list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--surface-subtle)]">
        {articles.map((a) => (
          <button
            key={a.slug}
            onClick={() => onOpenArticle(a.slug, slug)}
            className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-[var(--surface-muted)] transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-1.5 bg-[var(--surface-subtle)] rounded-md text-[var(--text-tertiary)] shrink-0 mt-0.5">
                <Book className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-[var(--text-primary)] text-sm">{a.title}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-1">{a.description}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1 tabular-nums">
                  <Clock className="w-3 h-3" />
                  {a.readTime} {t('read')}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-tertiary)] transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Article panel (reading view) ---
function ArticlePanel({
  slug,
  backToCategory,
  onBackToCategory,
  onClose,
}: {
  slug: string;
  backToCategory?: string;
  onBackToCategory: (cat: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const article = getArticleBySlug(slug);
  if (!article) return null;
  const category = getCategoryBySlug(article.categorySlug);
  const related = HELP_ARTICLES.filter(
    (a) => a.categorySlug === article.categorySlug && a.slug !== article.slug,
  ).slice(0, 3);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-[var(--surface-subtle)] flex items-center justify-between gap-3 shrink-0">
        {backToCategory ? (
          <button
            onClick={() => onBackToCategory(backToCategory)}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {category?.title ?? t('Back')}
          </button>
        ) : (
          <span className="text-sm text-[var(--text-secondary)]">{category?.title}</span>
        )}
        <button
          onClick={onClose}
          className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors cursor-pointer"
          aria-label={t('Close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Article body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          <DrawerTitle className="text-xl font-medium text-[var(--text-primary)] leading-snug">
            {article.title}
          </DrawerTitle>
          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-2 tabular-nums">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime} {t('read')}
            </span>
            <span>·</span>
            <span>
              {t('Updated')} {article.updatedAt}
            </span>
          </div>

          <div className="mt-6">
            <ArticleBody article={article} />
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="px-6 pb-6">
            <div className="pt-6 border-t border-[var(--surface-subtle)]">
              <h4 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                {t('Related articles')}
              </h4>
              <div className="space-y-1">
                {related.map((r) => (
                  <button
                    key={r.slug}
                    onClick={() => onBackToCategory(r.categorySlug)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 -mx-3 text-left hover:bg-[var(--surface-muted)] rounded-md transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Book className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                      <span className="text-sm text-[var(--text-primary)] truncate">{r.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-tertiary)] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer — still need help */}
      <div className="px-6 py-4 border-t border-[var(--surface-subtle)] bg-[var(--surface-muted)] shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{t('Was this helpful?')}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {t('Contact support if you need more guidance.')}
            </p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-[var(--brand-primary)] text-white rounded-md text-sm font-medium hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer shrink-0">
            <MessageCircle className="w-4 h-4" />
            {t('Contact')}
          </button>
        </div>
      </div>
    </div>
  );
}
