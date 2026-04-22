import React from 'react';
import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  HelpCircle,
  Bell,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  LayoutDashboard,
  Gift,
  Clock,
  Trophy,
  CheckCircle2,
  Wallet,
  Newspaper,
  ClipboardCheck,
  X,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export function Sidebar({
  isCollapsed,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
  isMobileNotifOpen = false,
  onMobileNotifChange,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isMobileNotifOpen?: boolean;
  onMobileNotifChange?: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [hasUnread, setHasUnread] = React.useState(true);
  const [isDesktop, setIsDesktop] = React.useState(true);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(min-width: 768px)');
    const handler = () => setIsDesktop(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Desktop notif panel state vs mobile (mobile is controlled by parent via props)
  const notifOpen = isMobileNotifOpen || isNotificationsOpen;
  const closeNotif = () => {
    setIsNotificationsOpen(false);
    onMobileNotifChange?.(false);
  };

  // On mobile, sidebar is a fixed 280px overlay and ignores the collapse toggle.
  // On desktop, width animates between 68 (collapsed) and 240 (expanded).
  const asideWidth = isDesktop ? (isCollapsed ? 68 : 240) : 280;
  // On mobile, "collapsed" visual state makes no sense (it's an overlay), so we
  // always render the full labels when not on desktop.
  const effectiveCollapsed = isDesktop ? isCollapsed : false;

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onMobileClose}
            className="md:hidden fixed inset-0 bg-black/40 z-30"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: asideWidth }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'h-full bg-white border-r border-[#EBEBEB] flex flex-col flex-shrink-0 overflow-hidden',
          // Desktop: inline in the flex row
          'md:relative md:z-20 md:translate-x-0',
          // Mobile: fixed overlay, slide in from left
          'fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 shrink-0">
        <motion.div
          initial={false}
          animate={{ opacity: effectiveCollapsed ? 0 : 1, width: effectiveCollapsed ? 0 : 'auto' }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={cn("flex items-center overflow-hidden", effectiveCollapsed ? "" : "flex-1 mr-2")}
        >
          <div
            aria-label="Logo placeholder"
            className="h-9 w-full border border-dashed border-[#D4D4D4] bg-[#F3F3F3] rounded-md flex items-center justify-center text-[10px] font-medium tracking-wide text-[#616161] select-none"
          >
            LOGO
          </div>
        </motion.div>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="md:hidden p-1.5 text-[#616161] hover:bg-[#F3F3F3] rounded-md transition-all ml-auto"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Desktop collapse toggle */}
        <button
          onClick={onToggle}
          className={cn(
            "hidden md:inline-flex p-1.5 text-[#616161] hover:bg-[#F3F3F3] rounded-md transition-all",
            effectiveCollapsed ? "mx-auto" : "ml-auto",
          )}
        >
          {effectiveCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className={cn("flex-1 overflow-y-auto px-3 py-4 overflow-x-hidden", effectiveCollapsed ? "space-y-3" : "space-y-6")}>

        {/* Overview */}
        <div>
          <div className={cn(
            "mb-2 text-[11px] font-medium text-[#616161] uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            effectiveCollapsed ? "opacity-0 h-0 overflow-hidden text-center" : "px-3 opacity-100 h-auto"
          )}>
            {t("OVERVIEW")}
          </div>
          <div className="space-y-0.5">
            <NavItem icon={LayoutDashboard} label={t("Dashboard")} path="/" isCollapsed={effectiveCollapsed} />
          </div>
        </div>

        {effectiveCollapsed && <div className="border-t border-[#EBEBEB] mx-2" />}

        {/* Surveys */}
        <div>
          <div className={cn(
            "mb-2 text-[11px] font-medium text-[#616161] uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            effectiveCollapsed ? "opacity-0 h-0 overflow-hidden text-center" : "px-3 opacity-100 h-auto"
          )}>
            {t("SURVEYS")}
          </div>
          <div className="space-y-0.5">
            <NavItem icon={Newspaper} label={t("Survey Feed")} path="/survey-feed" isCollapsed={effectiveCollapsed} />
            <NavItem icon={ClipboardCheck} label={t("My Surveys")} path="/my-surveys" isCollapsed={effectiveCollapsed} />
          </div>
        </div>

        {effectiveCollapsed && <div className="border-t border-[#EBEBEB] mx-2" />}

        {/* Payments */}
        <div>
          <div className={cn(
            "mb-2 text-[11px] font-medium text-[#616161] uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            effectiveCollapsed ? "opacity-0 h-0 overflow-hidden text-center" : "px-3 opacity-100 h-auto"
          )}>
            {t("PAYMENTS")}
          </div>
          <div className="space-y-0.5">
            <NavItem icon={Wallet} label={t("Wallet")} path="/wallet" isCollapsed={effectiveCollapsed} />
          </div>
        </div>

        {effectiveCollapsed && <div className="border-t border-[#EBEBEB] mx-2" />}

        {/* Account */}
        <div>
          <div className={cn(
            "mb-2 text-[11px] font-medium text-[#616161] uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            effectiveCollapsed ? "opacity-0 h-0 overflow-hidden text-center" : "px-3 opacity-100 h-auto"
          )}>
            {t("ACCOUNT")}
          </div>
          <div className="space-y-0.5">
            <NavItem icon={Settings} label={t("Settings")} path="/settings" isCollapsed={effectiveCollapsed} />
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[#EBEBEB] space-y-0.5 shrink-0">
        <NavItem icon={HelpCircle} label={t("Help")} path="/help" isCollapsed={effectiveCollapsed} />
        <NavButton
          icon={({ className }) => (
            <div className="relative inline-flex">
              <Bell className={className} />
              {hasUnread && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#FF3C21] rounded-full border border-white"></span>
              )}
            </div>
          )}
          label={t("Notifications")}
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          isCollapsed={effectiveCollapsed}
        />

        {/* User Profile */}
        <div className="relative group">
          <div className={cn(
            "mt-4 flex items-center hover:bg-[#F3F3F3] rounded-md cursor-pointer transition-colors w-full",
            effectiveCollapsed ? "justify-center px-0 py-2" : "gap-3 px-2 py-2"
          )}>
            <div className="w-8 h-8 rounded-full bg-[#FF3C21] text-white flex items-center justify-center text-xs font-medium shrink-0">
              H
            </div>
            {!effectiveCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-[#1A1A1A] truncate text-left">Hein Htet</span>
                <span className="text-xs text-[#616161] truncate text-left">heincise@gmail.com</span>
              </div>
            )}
          </div>
          
          {/* Profile Menu Dropdown */}
          <div className="absolute left-full bottom-0 ml-2 w-56 bg-white border border-[#EBEBEB] rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-1.5 flex flex-col gap-0.5">
            <div className="px-2.5 py-2 mb-1">
              <span className="block text-sm font-medium text-[#1A1A1A] truncate">Hein Htet</span>
              <span className="block text-xs text-[#616161] truncate">heincise@gmail.com</span>
            </div>
            
            <div className="h-px bg-[#EBEBEB] mx-1 mb-1"></div>
            
            <button className="w-full text-left px-2.5 py-1.5 text-sm font-medium text-[#303030] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-sm transition-colors flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-[#616161]" />
              Account Settings
            </button>
            <button className="w-full text-left px-2.5 py-1.5 text-sm font-medium text-[#303030] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-sm transition-colors flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#616161]" />
              Support
            </button>
            
            <div className="h-px bg-[#EBEBEB] mx-1 my-1"></div>
            
            <button className="w-full text-left px-2.5 py-1.5 text-sm font-medium text-[#616161] hover:text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-sm transition-colors flex items-center gap-2.5">
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </motion.aside>

      {/* Notifications Sliding Panel */}
      <AnimatePresence>
      {notifOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeNotif}
            className="md:hidden fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
              'bg-white overflow-hidden flex flex-col',
              // Mobile: full-screen overlay
              'fixed inset-0 z-50',
              // Desktop: inline next to sidebar, 320px wide
              'md:relative md:inset-auto md:h-full md:w-[320px] md:border-r md:border-[#EBEBEB] md:flex-shrink-0 md:z-10',
            )}
          >
            {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#EBEBEB] shrink-0">
            <h2 className="text-base font-medium text-[#1A1A1A] tracking-tight">{t("Notifications")}</h2>
            <button
              onClick={closeNotif}
              className="p-1.5 text-[#616161] hover:bg-[#F3F3F3] rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Content area - Notifications List */}
          <div className="flex-1 overflow-y-auto bg-white">
            {/* Unread Section */}
            {hasUnread && (
              <div className="px-5 py-3">
                <h3 className="text-xs font-medium text-[#616161] uppercase tracking-wider mb-3">
                  {t("New")}
                </h3>
                <div className="space-y-2">
                  {/* New matching survey */}
                  <NavLink to="/survey-feed" className="group block text-left p-3 rounded-md bg-white border border-[#EBEBEB] hover:bg-[#FAFAFA] transition-colors relative cursor-pointer">
                    <div className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-[#FF3C21]" />
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-[#047857]" />
                      </div>
                      <div className="flex-1 pr-4">
                        <p className="text-sm text-[#1A1A1A] leading-snug">
                          <span className="font-medium">{t("Khan Bank")}</span> — {t("Brand Awareness Survey is a 95% match.")} <span className="font-medium">{t("₮15,000 reward.")}</span>
                        </p>
                        <span className="text-xs text-[#616161] mt-1.5 block">
                          {t("10 mins ago")}
                        </span>
                      </div>
                    </div>
                  </NavLink>

                  {/* Reward cleared the 24h hold */}
                  <NavLink to="/wallet" className="group block text-left p-3 rounded-md bg-white border border-[#EBEBEB] hover:bg-[#FAFAFA] transition-colors relative cursor-pointer">
                    <div className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-[#FF3C21]" />
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFF1EE] flex items-center justify-center shrink-0 mt-0.5">
                        <Wallet className="w-4 h-4 text-[#FF3C21]" />
                      </div>
                      <div className="flex-1 pr-4">
                        <p className="text-sm text-[#1A1A1A] leading-snug">
                          {t("Your ")}
                          <span className="font-medium">{t("₮15,000")}</span>
                          {t(" reward for Service Quality Assessment cleared the 24-hour hold.")}
                        </p>
                        <span className="text-xs text-[#616161] mt-1.5 block">
                          {t("1 hour ago")}
                        </span>
                      </div>
                    </div>
                  </NavLink>
                </div>
              </div>
            )}

            {/* Earlier Section */}
            <div className={cn("px-5 py-3", hasUnread ? "border-t border-[#EBEBEB]" : "")}>
              <h3 className="text-xs font-medium text-[#616161] uppercase tracking-wider mb-3">
                {hasUnread ? t("Earlier") : t("Recent")}
              </h3>
              <div className="space-y-2">
                {!hasUnread && (
                  <>
                    <NavLink to="/survey-feed" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-[#4A4A4A]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#4A4A4A] leading-snug">
                            <span className="font-medium text-[#1A1A1A]">{t("Khan Bank")}</span> — {t("Brand Awareness Survey is a 95% match.")} <span className="font-medium text-[#1A1A1A]">{t("₮15,000 reward.")}</span>
                          </p>
                          <span className="text-xs text-[#616161] mt-1.5 block">
                            {t("10 mins ago")}
                          </span>
                        </div>
                      </div>
                    </NavLink>

                    <NavLink to="/wallet" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                          <Wallet className="w-4 h-4 text-[#4A4A4A]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[#4A4A4A] leading-snug">
                            {t("Your ")}
                            <span className="font-medium text-[#1A1A1A]">{t("₮15,000")}</span>
                            {t(" reward for Service Quality Assessment cleared the 24-hour hold.")}
                          </p>
                          <span className="text-xs text-[#616161] mt-1.5 block">
                            {t("1 hour ago")}
                          </span>
                        </div>
                      </div>
                    </NavLink>
                  </>
                )}

                {/* Withdrawal successful */}
                <NavLink to="/wallet" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                      <Wallet className="w-4 h-4 text-[#4A4A4A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#4A4A4A] leading-snug">
                        {t("Withdrawal of ")}
                        <span className="font-medium text-[#1A1A1A]">{t("₮50,000")}</span>
                        {t(" to QPay ••12 was successful.")}
                      </p>
                      <span className="text-xs text-[#616161] mt-1.5 block">
                        {t("Yesterday")}
                      </span>
                    </div>
                  </div>
                </NavLink>

                {/* Trust level up */}
                <NavLink to="/survey-feed" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                      <Trophy className="w-4 h-4 text-[#4A4A4A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#4A4A4A] leading-snug">
                        {t("You unlocked ")}
                        <span className="font-medium text-[#1A1A1A]">{t("Trust Level 2")}</span>
                        {t(" — higher-paying surveys are now in your feed.")}
                      </p>
                      <span className="text-xs text-[#616161] mt-1.5 block">
                        {t("Apr 18")}
                      </span>
                    </div>
                  </div>
                </NavLink>

                {/* Streak bonus */}
                <NavLink to="/wallet" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-[#4A4A4A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#4A4A4A] leading-snug">
                        <span className="font-medium text-[#1A1A1A]">{t("7-day streak")}</span>
                        {t(" bonus of ₮1,000 applied to your wallet.")}
                      </p>
                      <span className="text-xs text-[#616161] mt-1.5 block">
                        {t("Apr 14")}
                      </span>
                    </div>
                  </div>
                </NavLink>

                {/* Response held for review */}
                <NavLink to="/my-surveys" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-[#4A4A4A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#4A4A4A] leading-snug">
                        {t("Your response to ")}
                        <span className="font-medium text-[#1A1A1A]">{t("5G Rollout Feedback")}</span>
                        {t(" is held for quality review.")}
                      </p>
                      <span className="text-xs text-[#616161] mt-1.5 block">
                        {t("Apr 12")}
                      </span>
                    </div>
                  </div>
                </NavLink>

                {/* Referral completed */}
                <NavLink to="/settings" className="group block text-left p-3 rounded-md hover:bg-[#F3F3F3] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center shrink-0 mt-0.5">
                      <Gift className="w-4 h-4 text-[#4A4A4A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#4A4A4A] leading-snug">
                        <span className="font-medium text-[#1A1A1A]">{t("Bataa")}</span>
                        {t(" completed their first paid survey. You both earned ₮5,000.")}
                      </p>
                      <span className="text-xs text-[#616161] mt-1.5 block">
                        {t("Apr 10")}
                      </span>
                    </div>
                  </div>
                </NavLink>
              </div>
            </div>
          </div>
          
          {/* Footer Actions */}
          {hasUnread && (
            <div className="p-4 border-t border-[#EBEBEB] bg-white mt-auto shrink-0">
              <button
                onClick={() => setHasUnread(false)}
                className="w-full py-2 px-4 bg-transparent border border-[#EBEBEB] text-[#1A1A1A] text-sm font-medium rounded-md hover:bg-[#F3F3F3] transition-colors"
              >
                {t("Mark all as read")}
              </button>
            </div>
          )}
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ icon: Icon, label, path, isCollapsed }: { icon: React.ElementType, label: string, path: string, isCollapsed?: boolean }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) => cn(
        "flex items-center rounded-md text-sm font-medium transition-colors group",
        isCollapsed ? "justify-center p-2 h-10 w-10 mx-auto" : "gap-3 px-3 py-2 w-full",
        isActive
          ? "bg-[#FFF1EE] text-[#FF3C21]"
          : "text-[#4A4A4A] hover:bg-[#F3F3F3] hover:text-[#1A1A1A]"
      )}
      title={isCollapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          <Icon strokeWidth={1.75} className={cn("w-[17px] h-[17px] shrink-0 transition-colors", isActive ? "text-[#FF3C21]" : "text-[#616161] group-hover:text-[#4A4A4A]")} />
          {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
        </>
      )}
    </NavLink>
  );
}

function NavButton({ icon: Icon, label, isActive, onClick, isCollapsed }: { icon: React.ElementType, label: string, isActive?: boolean, onClick: () => void, isCollapsed?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center rounded-md text-sm font-medium transition-colors group",
        isCollapsed ? "justify-center p-2 h-10 w-10 mx-auto" : "gap-3 px-3 py-2 w-full",
        isActive 
          ? "bg-[#F3F3F3] text-[#1A1A1A]"
          : "text-[#4A4A4A] hover:bg-[#F3F3F3] hover:text-[#1A1A1A]"
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon strokeWidth={1.75} className={cn("w-[17px] h-[17px] shrink-0 transition-colors", isActive ? "text-[#1A1A1A]" : "text-[#616161] group-hover:text-[#4A4A4A]")} />
      {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}
