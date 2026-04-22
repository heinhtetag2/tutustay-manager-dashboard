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

function ArticleBody({ article }: { article: HelpArticleMeta }) {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-[#303030]">
      <p>
        {article.description} This guide walks through what you need to know, highlights
        common pitfalls, and links to related topics so you can come back whenever you
        need a refresher.
      </p>

      <h3 className="text-base font-medium text-[#1A1A1A] pt-2">Before you start</h3>
      <p>
        Make sure your profile is up to date — iDap uses your{' '}
        <span className="font-medium text-[#1A1A1A]">demographics</span> and{' '}
        <span className="font-medium text-[#1A1A1A]">trust level</span> to match you to
        surveys. A complete profile means more surveys in your feed and higher-paying
        matches.
      </p>

      <div className="bg-[#FFF1EE] border border-[#FFDED5] rounded-md p-4 flex gap-3">
        <span className="text-[#FF3C21] font-medium shrink-0">Tip</span>
        <p className="text-[#4A4A4A]">
          Check your Survey Feed in the morning — that's when most new surveys drop and
          spots fill fastest. First-come-first-served on paid spots.
        </p>
      </div>

      <h3 className="text-base font-medium text-[#1A1A1A] pt-2">Step-by-step</h3>
      <ol className="list-decimal list-outside pl-5 space-y-2">
        <li>Open <span className="font-medium text-[#1A1A1A]">Survey Feed</span> from the left sidebar to see surveys matched to you.</li>
        <li>Pick a card that fits your available time — reward and duration are shown up front.</li>
        <li>Answer the screener questions honestly. They confirm you match the target audience.</li>
        <li>Complete the survey. Rewards land in your wallet after a 24-hour quality hold.</li>
        <li>Withdraw via QPay, Bonum, Social Pay, or bank transfer from the Wallet page.</li>
      </ol>

      <h3 className="text-base font-medium text-[#1A1A1A] pt-2">What to do next</h3>
      <ul className="list-disc list-outside pl-5 space-y-2">
        <li>Track earnings, trust level, and your streak on the <span className="font-medium text-[#1A1A1A]">Dashboard</span>.</li>
        <li>Level up your trust to unlock higher-paying gated surveys in the feed.</li>
        <li>Invite friends from Settings — you both earn ₮5,000 when they complete a paid survey.</li>
      </ul>

      <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-md p-4">
        <p className="text-xs font-medium text-[#616161] uppercase tracking-wider mb-1">Good to know</p>
        <p className="text-sm text-[#4A4A4A]">
          Rewards sit in a 24-hour hold so companies can flag low-quality responses. If a
          response passes the hold, it pays out automatically — no action needed from you.
          Rejected responses are reviewable from your My Surveys history.
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
      className="flex-1 overflow-y-auto w-full px-4 sm:px-6 md:px-8 xl:px-12 py-6 sm:py-8 bg-[#FAFAFA]"
    >
      {/* Header */}
      <div className="mb-8 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-serif text-[#1A1A1A]">{t('Help Center')}</h1>
        <p className="text-sm text-[#616161] mt-1">
          {t('How iDap works, tips for earning more, and answers to common questions.')}
        </p>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="relative max-w-2xl mb-6"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#616161]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Search for help, guides, keywords...')}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#EBEBEB] rounded-md text-base focus:outline-none focus:border-[#FF3C21] focus:ring-1 focus:ring-[#FF3C21] placeholder:text-[#616161] transition-colors"
        />
      </motion.div>

      {/* Search results (inline) */}
      {searchResults && (
        <div className="mb-10 max-w-2xl bg-white border border-[#EBEBEB] rounded-md overflow-hidden">
          <div className="px-5 py-3 border-b border-[#F3F3F3] flex items-center justify-between">
            <span className="text-xs font-medium text-[#616161] uppercase tracking-wider">
              {searchResults.length} {t('results')}
            </span>
            <button
              onClick={() => setQuery('')}
              className="text-xs font-medium text-[#616161] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            >
              {t('Clear')}
            </button>
          </div>
          {searchResults.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#616161]">
              {t('No articles match your search.')}
            </div>
          ) : (
            <div className="divide-y divide-[#F3F3F3]">
              {searchResults.slice(0, 6).map((a) => (
                <button
                  key={a.slug}
                  onClick={() => openArticle(a.slug, a.categorySlug)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
                >
                  <div className="p-1.5 bg-[#F3F3F3] rounded-md text-[#4A4A4A] shrink-0">
                    <Book className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#1A1A1A] truncate">{a.title}</div>
                    <div className="text-xs text-[#616161] mt-0.5 truncate">
                      {getCategoryBySlug(a.categorySlug)?.title} · {a.readTime} {t('read')}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#4A4A4A] transition-colors" />
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
                <h2 className="text-base font-medium text-[#1A1A1A]">{t('Browse by topic')}</h2>
                <p className="text-xs text-[#616161] mt-0.5">
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
                    className="text-left bg-white border border-[#EBEBEB] rounded-md p-5 hover:border-[#FFC1B5] hover:bg-[#FAFAFA] transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-[#F3F3F3] rounded-md text-[#4A4A4A] group-hover:bg-[#FF3C21] group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-[#1A1A1A]">{t(cat.title)}</h3>
                        <p className="text-xs text-[#616161] mt-1 leading-relaxed">
                          {t(cat.description)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#F3F3F3]">
                      <span className="text-xs font-medium text-[#616161] tabular-nums">
                        {count} {t('articles')}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#FF3C21] transition-colors" />
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
              className="lg:col-span-2 bg-white border border-[#EBEBEB] rounded-md overflow-hidden"
            >
              <div className="px-6 pt-5 pb-4">
                <h2 className="text-base font-medium text-[#1A1A1A]">
                  {t('Popular articles')}
                </h2>
                <p className="text-xs text-[#616161] mt-0.5">{t('Most viewed this week')}</p>
              </div>
              <div className="divide-y divide-[#F3F3F3] border-t border-[#F3F3F3]">
                {popularArticles.map((article) => (
                  <button
                    key={article.slug}
                    onClick={() => openArticle(article.slug, article.categorySlug)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-1.5 bg-[#F3F3F3] rounded-md text-[#4A4A4A] shrink-0 mt-0.5">
                        <Book className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[#1A1A1A] text-sm truncate">
                          {t(article.title)}
                        </div>
                        <div className="text-xs text-[#616161] mt-0.5">
                          {getCategoryBySlug(article.categorySlug)?.title} · {article.readTime}{' '}
                          {t('read')}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#4A4A4A] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="bg-white border border-[#EBEBEB] rounded-md p-6 flex flex-col"
            >
              <div className="p-2.5 bg-[#FFF1EE] rounded-md text-[#FF3C21] w-fit mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-medium text-[#1A1A1A]">{t('Still need help?')}</h3>
              <p className="text-sm text-[#4A4A4A] mt-1 leading-relaxed">
                {t('Our support team usually responds within a few hours on business days.')}
              </p>
              <div className="mt-5 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF3C21] text-white rounded-md text-sm font-medium hover:bg-[#E63419] transition-colors cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                  {t('Start a conversation')}
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#1A1A1A] border border-[#EBEBEB] rounded-md text-sm font-medium hover:bg-[#FAFAFA] transition-colors cursor-pointer">
                  <Mail className="w-4 h-4" />
                  {t('Email support')}
                </button>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F3F3F3]">
                <p className="text-xs text-[#616161] mb-1">{t('Response time')}</p>
                <p className="text-sm font-medium text-[#1A1A1A]">{t('Under 4 hours')}</p>
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
              { title: 'Video tutorials', description: 'Short walkthroughs of the feed, wallet, and trust levels', Icon: Video },
              { title: 'iDap rules & payment policy', description: 'Quality rules, the 24-hour hold, and payout terms', Icon: Book },
              { title: 'Contact support', description: 'Chat or email the iDap team', Icon: MessageSquare },
            ].map((r) => (
              <button
                key={r.title}
                className="flex items-center gap-3 bg-white border border-[#EBEBEB] rounded-md p-4 text-left hover:border-[#FFC1B5] hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
              >
                <div className="p-2 bg-[#F3F3F3] rounded-md text-[#4A4A4A] group-hover:text-[#FF3C21] transition-colors shrink-0">
                  <r.Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#1A1A1A]">{t(r.title)}</div>
                  <div className="text-xs text-[#616161] mt-0.5">{t(r.description)}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#4A4A4A] transition-colors shrink-0" />
              </button>
            ))}
          </motion.div>
        </>
      )}

      {/* Right-sliding drawer for category list / article view */}
      <Drawer direction="right" open={!!view} onOpenChange={(o) => !o && closeDrawer()}>
        <DrawerContent className="!max-w-lg data-[vaul-drawer-direction=right]:sm:!max-w-lg bg-white border-l border-[#EBEBEB]">
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
      <div className="px-6 py-5 border-b border-[#F3F3F3] flex items-start justify-between gap-4 shrink-0">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex items-center justify-center w-11 h-11 rounded-md bg-[#FFF1EE] text-[#FF3C21] shrink-0">
            <Icon className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <DrawerTitle className="text-base font-medium text-[#1A1A1A]">
              {category.title}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-[#616161] mt-1">
              {category.description}
            </DrawerDescription>
            <p className="text-xs text-[#616161] mt-2 tabular-nums">
              {articles.length} {t('articles')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#616161] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors cursor-pointer shrink-0"
          aria-label={t('Close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Articles list */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#F3F3F3]">
        {articles.map((a) => (
          <button
            key={a.slug}
            onClick={() => onOpenArticle(a.slug, slug)}
            className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-1.5 bg-[#F3F3F3] rounded-md text-[#4A4A4A] shrink-0 mt-0.5">
                <Book className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-[#1A1A1A] text-sm">{a.title}</div>
                <div className="text-xs text-[#616161] mt-0.5 line-clamp-1">{a.description}</div>
                <div className="text-[11px] text-[#8A8A8A] mt-1 flex items-center gap-1 tabular-nums">
                  <Clock className="w-3 h-3" />
                  {a.readTime} {t('read')}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#4A4A4A] transition-colors shrink-0" />
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
      <div className="px-6 py-4 border-b border-[#F3F3F3] flex items-center justify-between gap-3 shrink-0">
        {backToCategory ? (
          <button
            onClick={() => onBackToCategory(backToCategory)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {category?.title ?? t('Back')}
          </button>
        ) : (
          <span className="text-sm text-[#616161]">{category?.title}</span>
        )}
        <button
          onClick={onClose}
          className="p-1 text-[#616161] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors cursor-pointer"
          aria-label={t('Close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Article body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          <DrawerTitle className="text-xl font-medium text-[#1A1A1A] leading-snug">
            {article.title}
          </DrawerTitle>
          <div className="flex items-center gap-3 text-xs text-[#616161] mt-2 tabular-nums">
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
            <div className="pt-6 border-t border-[#F3F3F3]">
              <h4 className="text-xs font-medium text-[#616161] uppercase tracking-wider mb-3">
                {t('Related articles')}
              </h4>
              <div className="space-y-1">
                {related.map((r) => (
                  <button
                    key={r.slug}
                    onClick={() => onBackToCategory(r.categorySlug)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 -mx-3 text-left hover:bg-[#FAFAFA] rounded-md transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Book className="w-3.5 h-3.5 text-[#616161] shrink-0" />
                      <span className="text-sm text-[#1A1A1A] truncate">{r.title}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#4A4A4A] transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer — still need help */}
      <div className="px-6 py-4 border-t border-[#F3F3F3] bg-[#FAFAFA] shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">{t('Was this helpful?')}</p>
            <p className="text-xs text-[#616161] mt-0.5">
              {t('Contact support if you need more guidance.')}
            </p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-[#FF3C21] text-white rounded-md text-sm font-medium hover:bg-[#E63419] transition-colors cursor-pointer shrink-0">
            <MessageCircle className="w-4 h-4" />
            {t('Contact')}
          </button>
        </div>
      </div>
    </div>
  );
}
