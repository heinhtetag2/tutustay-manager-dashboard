import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Copy, Check, Mail, MessageCircle, Share2, Gift } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/shared/ui/drawer';
import { cn } from '@/shared/lib/cn';

const referralStats = {
  invited: 8,
  qualified: 3,
  earnedMnt: 15_000,
};

export function InviteFriendsDrawer({
  open,
  onOpenChange,
  referralCode = 'HEIN-4K7Q',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralCode?: string;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const referralUrl = `https://idap.mn/r/${referralCode}`;

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="!max-w-lg data-[vaul-drawer-direction=right]:sm:!max-w-lg bg-white border-l border-[var(--border-default)]">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-[var(--border-default)] shrink-0">
          <DrawerTitle className="text-base font-medium text-[var(--text-primary)]">
            {t('Invite friends')}
          </DrawerTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors"
            aria-label={t('Close')}
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DrawerDescription className="sr-only">
            {t('Invite friends and earn rewards when they complete paid surveys.')}
          </DrawerDescription>

          {/* Hero */}
          <div className="px-6 pt-6 pb-5">
            <div className="bg-[var(--surface-subtle)] rounded-md p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4 text-[var(--brand-primary)]" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="text-base font-medium text-[var(--text-primary)] mb-1">
                  {t('Earn 5,000 per qualified friend')}
                </div>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  {t("Share your link. When your friend completes their first paid survey, you both get 5,000. There's no limit — invite as many as you want.")}
                </p>
              </div>
            </div>
          </div>

          {/* Referral link */}
          <div className="px-6 pb-6">
            <h3 className="text-[13px] font-medium text-[var(--text-primary)] mb-3">
              {t('Your referral link')}
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 px-3 py-2.5 bg-[var(--surface-subtle)] rounded-md text-sm text-[var(--text-primary)] truncate tabular-nums">
                {referralUrl}
              </div>
              <button
                type="button"
                onClick={() => copy(referralUrl)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors shrink-0',
                  copied
                    ? 'bg-[var(--success-tint)] text-[var(--success)]'
                    : 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white',
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" strokeWidth={2} />
                    {t('Copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" strokeWidth={1.75} />
                    {t('Copy')}
                  </>
                )}
              </button>
            </div>

            {/* Share buttons */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <ShareButton
                Icon={MessageCircle}
                label={t('Messenger')}
                onClick={() => window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(referralUrl)}&app_id=0`, '_blank')}
              />
              <ShareButton
                Icon={Mail}
                label={t('Email')}
                onClick={() => window.open(`mailto:?subject=${encodeURIComponent('Join me on iDap')}&body=${encodeURIComponent(`I use iDap to earn rewards for surveys. Sign up with my link and we both get 5,000 after your first paid survey: ${referralUrl}`)}`)}
              />
              <ShareButton
                Icon={Share2}
                label={t('Share')}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Join me on iDap',
                      text: "I'm earning rewards on iDap. Use my link and we both get 5,000.",
                      url: referralUrl,
                    }).catch(() => {});
                  } else {
                    copy(referralUrl);
                  }
                }}
              />
            </div>
          </div>

          {/* Referrals stats */}
          <div className="px-6 pb-6">
            <h3 className="text-[13px] font-medium text-[var(--text-primary)] mb-3">
              {t('Your referrals')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <StatCard label={t('Invited')} value={String(referralStats.invited)} />
              <StatCard label={t('Qualified')} value={String(referralStats.qualified)} />
              <StatCard
                label={t('Earned')}
                value={`${referralStats.earnedMnt.toLocaleString('en-US')}`}
                accent
              />
            </div>
          </div>

          {/* How it works */}
          <div className="px-6 pb-6">
            <h3 className="text-[13px] font-medium text-[var(--text-primary)] mb-3">
              {t('How it works')}
            </h3>
            <ol className="space-y-3">
              <Step
                n={1}
                title={t('Share your link')}
                description={t('Send your link to friends, or share it on social.')}
              />
              <Step
                n={2}
                title={t('They sign up and verify their phone')}
                description={t('Your friend creates an iDap account with your link.')}
              />
              <Step
                n={3}
                title={t('They complete their first paid survey')}
                description={t('It has to clear quality review — the usual instant or 24h hold.')}
              />
              <Step
                n={4}
                title={t('You both earn 5,000')}
                description={t('Lands in both wallets within 48 hours of their first cleared reward.')}
              />
            </ol>
          </div>

          <div className="px-6 pb-8">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {t('Referrals must be real people with unique phone numbers. Self-referrals, duplicate devices, or fraud-flagged accounts do not qualify. iDap may adjust rewards if we detect abuse.')}
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ShareButton({
  Icon,
  label,
  onClick,
}: {
  Icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-md border border-[var(--border-default)] bg-white hover:border-[var(--brand-border)] transition-colors"
    >
      <Icon className="w-4 h-4 text-[var(--text-tertiary)]" strokeWidth={1.75} />
      <span className="text-xs font-medium text-[var(--text-primary)]">{label}</span>
    </button>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white border border-[var(--border-default)] rounded-md p-3">
      <div className="text-[11px] text-[var(--text-secondary)] mb-1">{label}</div>
      <div
        className={cn(
          'text-lg font-medium tabular-nums',
          accent ? 'text-[var(--brand-primary)]' : 'text-[var(--text-primary)]',
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  description,
}: {
  n: number;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center shrink-0 text-[11px] font-medium text-[var(--text-tertiary)] tabular-nums">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--text-primary)]">{title}</div>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{description}</p>
      </div>
    </li>
  );
}

