import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  HelpCircle,
  Code2,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  LayoutDashboard,
  Rocket,
  Clock,
  Check,
  CheckCircle2,
  UserCog,
  Users,
  Star,
  KeyRound,
  CalendarPlus,
  CalendarCheck,
  CalendarDays,
  TicketPercent,
  Landmark,
  X,
} from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Portal } from '@/shared/ui/portal';
import { useHotel } from '@/pages/hotel/use-hotel';
import { setupProgress } from '@/pages/setup-hub/setup-progress';

/** Hover tooltip for collapsed nav items — rendered in a Portal with fixed
 *  positioning so it isn't clipped by the sidebar's overflow-hidden. */
function useNavTooltip(label: string, enabled: boolean) {
  const ref = React.useRef<any>(null);
  const [tip, setTip] = React.useState<{ top: number; left: number } | null>(null);
  const onMouseEnter = () => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTip({ top: r.top + r.height / 2, left: r.right + 10 });
  };
  const onMouseLeave = () => setTip(null);
  const node = tip ? (
    <Portal>
      <div
        style={{ position: 'fixed', top: tip.top, left: tip.left, transform: 'translateY(-50%)' }}
        className="z-[100] pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="relative whitespace-nowrap rounded-md bg-[var(--text-primary)] text-white text-xs font-medium px-2.5 py-1.5 shadow-[0_4px_16px_rgba(44,38,39,0.18)]"
        >
          {/* caret pointing back at the icon */}
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 rounded-[1px] bg-[var(--text-primary)]" />
          {label}
        </motion.div>
      </div>
    </Portal>
  ) : null;
  return { ref, onMouseEnter, onMouseLeave, node };
}

/** User profile chip + dropdown. The menu is rendered in a Portal (fixed
 *  position) so it isn't clipped by the sidebar's overflow-hidden; a short
 *  close delay lets the pointer travel from the chip into the menu. */
function ProfileMenu({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();
  const ref = React.useRef<HTMLDivElement>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ left: 0, bottom: 0 });

  // Profile menu now owns Settings + Support (moved out of the sidebar rail).
  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ left: r.right + 8, bottom: window.innerHeight - r.bottom });
    }
    setOpen(true);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 140);
  };

  return (
    <div ref={ref} onMouseEnter={show} onMouseLeave={hide}>
      <div className={cn(
        "mt-4 flex items-center hover:bg-[var(--surface-subtle)] rounded-md cursor-pointer transition-colors w-full",
        collapsed ? "justify-center px-0 py-2" : "gap-3 px-2 py-2"
      )}>
        <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-xs font-medium shrink-0">H</div>
        {!collapsed && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-[var(--text-primary)] truncate text-left">Hein Htet</span>
            <span className="text-xs text-[var(--text-secondary)] truncate text-left">heincise@gmail.com</span>
          </div>
        )}
      </div>

      {open && (
        <Portal>
          <div
            onMouseEnter={show}
            onMouseLeave={hide}
            style={{ position: 'fixed', left: pos.left, bottom: pos.bottom }}
            className="z-[100] w-56 bg-white border border-[var(--border-default)] rounded-md p-1.5 flex flex-col gap-0.5 shadow-[0_8px_28px_rgba(44,38,39,0.16)]"
          >
            <div className="px-2.5 py-2 mb-1">
              <span className="block text-sm font-medium text-[var(--text-primary)] truncate">Hein Htet</span>
              <span className="block text-xs text-[var(--text-secondary)] truncate">heincise@gmail.com</span>
            </div>
            <div className="h-px bg-[var(--border-default)] mx-1 mb-1" />
            <button onClick={() => go('/settings')} className="w-full text-left px-2.5 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-sm transition-colors flex items-center gap-2.5 cursor-pointer">
              <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
              Account Settings
            </button>
            <button onClick={() => go('/help')} className="w-full text-left px-2.5 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-sm transition-colors flex items-center gap-2.5 cursor-pointer">
              <HelpCircle className="w-4 h-4 text-[var(--text-secondary)]" />
              Support
            </button>
            <div className="h-px bg-[var(--border-default)] mx-1 my-1" />
            <button className="w-full text-left px-2.5 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-sm transition-colors flex items-center gap-2.5 cursor-pointer">
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </Portal>
      )}
    </div>
  );
}

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

  // Live onboarding progress for the Setup hub nav badge.
  const property = useHotel((s) => s.property);
  const setup = setupProgress(property);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(min-width: 768px)');
    const handler = () => setIsDesktop(mql.matches);
    handler();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Resizable expanded width (desktop). Drag the right edge; persisted across sessions.
  const SIDEBAR_MIN = 208;
  const SIDEBAR_MAX = 360;
  const SIDEBAR_DEFAULT = 240;
  const [expandedWidth, setExpandedWidth] = React.useState(() => {
    if (typeof window === 'undefined') return SIDEBAR_DEFAULT;
    const saved = Number(window.localStorage.getItem('sidebarWidth'));
    return saved >= SIDEBAR_MIN && saved <= SIDEBAR_MAX ? saved : SIDEBAR_DEFAULT;
  });
  const [isResizing, setIsResizing] = React.useState(false);

  React.useEffect(() => {
    if (!isResizing) return;
    // The aside's left edge sits at viewport x=0, so width tracks the cursor's clientX.
    const onMove = (e: PointerEvent) => setExpandedWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, e.clientX)));
    const stop = () => setIsResizing(false);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', stop);
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', stop);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [isResizing]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem('sidebarWidth', String(expandedWidth));
  }, [expandedWidth]);

  // Desktop notif panel state vs mobile (mobile is controlled by parent via props)
  const notifOpen = isMobileNotifOpen || isNotificationsOpen;
  const closeNotif = () => {
    setIsNotificationsOpen(false);
    onMobileNotifChange?.(false);
  };

  // On mobile, sidebar is a fixed 280px overlay and ignores the collapse toggle.
  // On desktop, width is 68 (collapsed) or the user-resizable expanded width.
  const asideWidth = isDesktop ? (isCollapsed ? 68 : expandedWidth) : 280;
  // On mobile, "collapsed" visual state makes no sense (it's an overlay), so we
  // always render the full labels when not on desktop.
  const effectiveCollapsed = isDesktop ? isCollapsed : false;

  // Notif panel content stagger. Items fade/slide in *with* the panel opening
  // (no delayChildren) so you never see a blank panel expand on its own — the
  // content rides the open motion as one cohesive gesture. A light stagger adds
  // life without reading as a slow cascade. On *close* the items do NOT animate
  // out — the content stays put and the panel collapses around it as one rigid
  // clipped block, so the close reads as a single smooth slide (like the toast).
  const notifContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
    exit: {},
  };
  const notifItemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 1, y: 0, transition: { duration: 0 } },
  };

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
        transition={isResizing ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'h-full bg-white border-r border-[var(--border-default)] flex flex-col flex-shrink-0 overflow-hidden',
          // Desktop: inline in the flex row
          'md:relative md:z-20 md:translate-x-0',
          // Mobile: fixed overlay, slide in from left
          'fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
      {/* Drag-to-resize handle (desktop, expanded). Double-click resets to default. */}
      {isDesktop && !isCollapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={t('Resize sidebar')}
          title={t('Drag to resize · double-click to reset')}
          onPointerDown={(e) => { e.preventDefault(); setIsResizing(true); }}
          onDoubleClick={() => setExpandedWidth(SIDEBAR_DEFAULT)}
          className="group/resize hidden md:block absolute top-0 right-0 z-30 h-full w-1.5 cursor-col-resize"
        >
          <span
            className={cn(
              'absolute right-0 top-0 h-full w-0.5 transition-colors',
              isResizing ? 'bg-[var(--brand-primary)]' : 'bg-transparent group-hover/resize:bg-[var(--border-strong)]',
            )}
          />
        </div>
      )}
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
            className="h-9 w-full border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] rounded-md flex items-center justify-center text-[10px] font-medium tracking-wide text-[var(--text-secondary)] select-none"
          >
            LOGO
          </div>
        </motion.div>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="md:hidden p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-all ml-auto"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
        {/* Desktop collapse toggle */}
        <button
          onClick={onToggle}
          className={cn(
            "hidden md:inline-flex p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-all",
            effectiveCollapsed ? "mx-auto" : "ml-auto",
          )}
        >
          {effectiveCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div data-tour="sidebar-nav" className={cn("flex-1 overflow-y-auto px-3 overflow-x-hidden", effectiveCollapsed ? "py-1.5 space-y-1.5" : "py-4 space-y-6")}>

        {/* Overview */}
        <div>
          <div className={cn(
            "mb-2 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            effectiveCollapsed ? "opacity-0 h-0 overflow-hidden text-center" : "px-3 opacity-100 h-auto"
          )}>
            {t("OVERVIEW")}
          </div>
          <div className="space-y-0.5">
            <NavItem icon={LayoutDashboard} label={t("Dashboard")} path="/" isCollapsed={effectiveCollapsed} />
            <NavItem icon={CalendarDays} label={t("Sales Calendar")} path="/sales-calendar" isCollapsed={effectiveCollapsed} />
          </div>
        </div>

        {effectiveCollapsed && <div className="border-t border-[var(--border-default)] mx-2" />}

        {/* Team */}
        <div>
          <div className={cn(
            "mb-2 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            effectiveCollapsed ? "opacity-0 h-0 overflow-hidden text-center" : "px-3 opacity-100 h-auto"
          )}>
            {t("TEAM")}
          </div>
          <div className="space-y-0.5">
            <NavItem icon={UserCog} label={t("Employee Management")} path="/agents" isCollapsed={effectiveCollapsed} />
            <NavItem icon={Users} label={t("Customer Management")} path="/customers" isCollapsed={effectiveCollapsed} />
            <NavItem icon={Star} label={t("Customer Reviews")} path="/reviews" isCollapsed={effectiveCollapsed} />
          </div>
        </div>

        {effectiveCollapsed && <div className="border-t border-[var(--border-default)] mx-2" />}

        {/* Hotel */}
        <div>
          <div className={cn(
            "mb-2 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            effectiveCollapsed ? "opacity-0 h-0 overflow-hidden text-center" : "px-3 opacity-100 h-auto"
          )}>
            {t("HOTEL")}
          </div>
          <div className="space-y-0.5">
            <NavItem icon={KeyRound} label={t("Room Management")} path="/hotel/rooms" isCollapsed={effectiveCollapsed} />
            <NavItem icon={CalendarCheck} label={t("Reservation Management")} path="/reservations" isCollapsed={effectiveCollapsed} />
            <NavItem icon={CalendarPlus} label={t("Booking Requests")} path="/booking-requests" isCollapsed={effectiveCollapsed} />
          </div>
        </div>

        {effectiveCollapsed && <div className="border-t border-[var(--border-default)] mx-2" />}

        {/* Marketing */}
        <div>
          <div className={cn(
            "mb-2 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            effectiveCollapsed ? "opacity-0 h-0 overflow-hidden text-center" : "px-3 opacity-100 h-auto"
          )}>
            {t("MARKETING")}
          </div>
          <div className="space-y-0.5">
            <NavItem icon={TicketPercent} label={t("Coupon Management")} path="/coupons" isCollapsed={effectiveCollapsed} />
          </div>
        </div>

        {effectiveCollapsed && <div className="border-t border-[var(--border-default)] mx-2" />}

        {/* Finance */}
        <div>
          <div className={cn(
            "mb-2 text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            effectiveCollapsed ? "opacity-0 h-0 overflow-hidden text-center" : "px-3 opacity-100 h-auto"
          )}>
            {t("FINANCE")}
          </div>
          <div className="space-y-0.5">
            <NavItem icon={Landmark} label={t("Settlement")} path="/settlements" isCollapsed={effectiveCollapsed} />
          </div>
        </div>

      </div>

      {/* Bottom Actions */}
      <div className={cn("border-t border-[var(--border-default)] shrink-0", effectiveCollapsed ? "p-2 space-y-1" : "p-3 space-y-0.5")}>
        <div data-tour="setup-ring">
          <SetupNavItem pct={setup.pct} completed={setup.completed} total={setup.total} allDone={setup.allDone} isCollapsed={effectiveCollapsed} label={t("Property setup")} />
        </div>
        <NavItem icon={Code2} label={t("Dev Handoff")} path="/design-system" isCollapsed={effectiveCollapsed} />
        <NavButton
          icon={({ className }) => (
            <div className="relative inline-flex">
              <Bell className={className} />
              {hasUnread && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--brand-primary)] rounded-full border border-white"></span>
              )}
            </div>
          )}
          label={t("Notifications")}
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          isCollapsed={effectiveCollapsed}
        />

        {/* User Profile */}
        <ProfileMenu collapsed={effectiveCollapsed} />
      </div>
    </motion.aside>

      {/* Notifications Sliding Panel */}
      <AnimatePresence>
      {notifOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }}
            onClick={closeNotif}
            className="md:hidden fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={isDesktop ? { width: 0, opacity: 0 } : { x: '100%' }}
            animate={isDesktop ? { width: 320, opacity: 1 } : { x: 0 }}
            // Close collapses the width back (no opacity fade competing) so the
            // content re-expands as one motion. Same spring for open + close.
            exit={isDesktop ? { width: 0 } : { x: '100%' }}
            // One spring drives both directions; bounce: 0 keeps the width from
            // overshooting (which would reflow-jump the content it pushes).
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            className={cn(
              'bg-white overflow-hidden flex flex-col',
              // Mobile: full-screen overlay
              'fixed inset-0 z-50',
              // Desktop: inline next to the sidebar — pushes the page content,
              // width is animated (not set via class).
              'md:relative md:inset-auto md:h-full md:border-r md:border-[var(--border-default)] md:flex-shrink-0 md:z-10',
              // Keep inner content at full 320px width during the width animation.
              'md:min-w-[320px]',
            )}
          >
            {/* Header */}
          <motion.div
            variants={notifItemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-default)] shrink-0"
          >
            <h2 className="text-base font-medium text-[var(--text-primary)] tracking-tight">{t("Notifications")}</h2>
            <button
              onClick={closeNotif}
              className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Content area - Notifications List */}
          <motion.div
            variants={notifContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex-1 overflow-y-auto bg-white"
          >
            {/* Unread Section */}
            {hasUnread && (
              <motion.div variants={notifItemVariants} className="px-5 py-3">
                <h3 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                  {t("New")}
                </h3>
                <div className="space-y-2">
                  {/* New booking request */}
                  <NavLink to="/booking-requests" className="group block text-left p-3 rounded-md bg-white border border-[var(--border-default)] hover:bg-[var(--surface-muted)] transition-colors relative cursor-pointer">
                    <div className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--brand-tint)] flex items-center justify-center shrink-0 mt-0.5">
                        <CalendarPlus className="w-4 h-4 text-[var(--brand-primary)]" />
                      </div>
                      <div className="flex-1 pr-4">
                        <p className="text-sm text-[var(--text-primary)] leading-snug">
                          {t("New booking request from ")}<span className="font-medium">{t("Grace Park")}</span>{t(" — Superior, 3 nights.")} <span className="font-medium">{t("270,000.")}</span>
                        </p>
                        <span className="text-xs text-[var(--text-secondary)] mt-1.5 block">
                          {t("10 mins ago")}
                        </span>
                      </div>
                    </div>
                  </NavLink>

                  {/* New guest review */}
                  <NavLink to="/reviews" className="group block text-left p-3 rounded-md bg-white border border-[var(--border-default)] hover:bg-[var(--surface-muted)] transition-colors relative cursor-pointer">
                    <div className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--success-tint)] flex items-center justify-center shrink-0 mt-0.5">
                        <Star className="w-4 h-4 text-[var(--success)]" />
                      </div>
                      <div className="flex-1 pr-4">
                        <p className="text-sm text-[var(--text-primary)] leading-snug">
                          <span className="font-medium">{t("Daniel Foster")}</span>{t(" left a ")}<span className="font-medium">{t("5-star review")}</span>{t(" for his Deluxe stay.")}
                        </p>
                        <span className="text-xs text-[var(--text-secondary)] mt-1.5 block">
                          {t("1 hour ago")}
                        </span>
                      </div>
                    </div>
                  </NavLink>
                </div>
              </motion.div>
            )}

            {/* Earlier Section */}
            <motion.div variants={notifItemVariants} className={cn("px-5 py-3", hasUnread ? "border-t border-[var(--border-default)]" : "")}>
              <h3 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                {hasUnread ? t("Earlier") : t("Recent")}
              </h3>
              <div className="space-y-2">
                {!hasUnread && (
                  <>
                    <NavLink to="/booking-requests" className="group block text-left p-3 rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                          <CalendarPlus className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[var(--text-tertiary)] leading-snug">
                            {t("New booking request from ")}<span className="font-medium text-[var(--text-primary)]">{t("Grace Park")}</span>{t(" — Superior, 3 nights.")} <span className="font-medium text-[var(--text-primary)]">{t("270,000.")}</span>
                          </p>
                          <span className="text-xs text-[var(--text-secondary)] mt-1.5 block">
                            {t("10 mins ago")}
                          </span>
                        </div>
                      </div>
                    </NavLink>

                    <NavLink to="/reviews" className="group block text-left p-3 rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                          <Star className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[var(--text-tertiary)] leading-snug">
                            <span className="font-medium text-[var(--text-primary)]">{t("Daniel Foster")}</span>{t(" left a ")}<span className="font-medium text-[var(--text-primary)]">{t("5-star review")}</span>{t(" for his Deluxe stay.")}
                          </p>
                          <span className="text-xs text-[var(--text-secondary)] mt-1.5 block">
                            {t("1 hour ago")}
                          </span>
                        </div>
                      </div>
                    </NavLink>
                  </>
                )}

                {/* Booking confirmed */}
                <NavLink to="/reservations" className="group block text-left p-3 rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--text-tertiary)] leading-snug">
                        {t("Reservation ")}
                        <span className="font-medium text-[var(--text-primary)]">{t("RSV-1053")}</span>
                        {t(" for Sofia Marin is confirmed — Deluxe, 4 nights.")}
                      </p>
                      <span className="text-xs text-[var(--text-secondary)] mt-1.5 block">
                        {t("Yesterday")}
                      </span>
                    </div>
                  </div>
                </NavLink>

                {/* Check-in reminder */}
                <NavLink to="/reservations" className="group block text-left p-3 rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                      <CalendarCheck className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--text-tertiary)] leading-snug">
                        <span className="font-medium text-[var(--text-primary)]">{t("Daniel Foster")}</span>
                        {t(" is due to check in today — Room 305.")}
                      </p>
                      <span className="text-xs text-[var(--text-secondary)] mt-1.5 block">
                        {t("Yesterday")}
                      </span>
                    </div>
                  </div>
                </NavLink>

                {/* Booking request declined */}
                <NavLink to="/booking-requests" className="group block text-left p-3 rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--text-tertiary)] leading-snug">
                        {t("Request from ")}
                        <span className="font-medium text-[var(--text-primary)]">{t("Marcus Lee")}</span>
                        {t(" was declined — no availability for those dates.")}
                      </p>
                      <span className="text-xs text-[var(--text-secondary)] mt-1.5 block">
                        {t("May 31")}
                      </span>
                    </div>
                  </div>
                </NavLink>

                {/* New customer registered */}
                <NavLink to="/customers" className="group block text-left p-3 rounded-md hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--text-tertiary)] leading-snug">
                        <span className="font-medium text-[var(--text-primary)]">{t("Elena Rossi")}</span>
                        {t(" registered as a new customer.")}
                      </p>
                      <span className="text-xs text-[var(--text-secondary)] mt-1.5 block">
                        {t("May 28")}
                      </span>
                    </div>
                  </div>
                </NavLink>
              </div>
            </motion.div>
          </motion.div>

          {/* Footer Actions */}
          {hasUnread && (
            <motion.div
              variants={notifItemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-4 border-t border-[var(--border-default)] bg-white mt-auto shrink-0"
            >
              <button
                onClick={() => setHasUnread(false)}
                className="w-full py-2 px-4 bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] text-sm font-medium rounded-md hover:bg-[var(--surface-subtle)] transition-colors"
              >
                {t("Mark all as read")}
              </button>
            </motion.div>
          )}
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ icon: Icon, label, path, isCollapsed, badge, dot }: { icon: React.ElementType, label: string, path: string, isCollapsed?: boolean, badge?: string, dot?: boolean }) {
  const tip = useNavTooltip(label, !!isCollapsed);
  return (
    <>
      <NavLink
        ref={tip.ref}
        to={path}
        onMouseEnter={tip.onMouseEnter}
        onMouseLeave={tip.onMouseLeave}
        className={({ isActive }) => cn(
          "flex items-center rounded-md text-sm font-medium transition-colors group",
          isCollapsed ? "justify-center h-9 w-9 mx-auto" : "gap-3 px-3 py-2 w-full",
          isActive
            ? "bg-[var(--brand-tint)] text-[var(--brand-primary)]"
            : "text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
        )}
      >
        {({ isActive }) => (
          <>
            <span className="relative shrink-0">
              <Icon strokeWidth={1.75} className={cn("w-[17px] h-[17px] transition-colors", isActive ? "text-[var(--brand-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-tertiary)]")} />
              {isCollapsed && dot && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--brand-primary)] border border-white" />}
            </span>
            {!isCollapsed && <span title={label} className="min-w-0 flex-1 truncate text-left">{label}</span>}
            {!isCollapsed && badge && (
              <span className="shrink-0 text-[11px] font-medium tabular-nums px-1.5 py-0.5 rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)]">{badge}</span>
            )}
          </>
        )}
      </NavLink>
      {tip.node}
    </>
  );
}

/** Setup hub nav item — its icon is a live progress ring; shows the step count when expanded. */
function SetupNavItem({ pct, completed, total, allDone, isCollapsed, label }: { pct: number, completed: number, total: number, allDone: boolean, isCollapsed?: boolean, label: string }) {
  const tip = useNavTooltip(`${label} · ${pct}%`, !!isCollapsed);
  const size = 26, stroke = 3;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arc = allDone ? 'var(--success)' : 'var(--brand-primary)';
  const ring = (
    <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-subtle)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={arc} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} />
      </svg>
      {allDone
        ? <Check className="absolute w-3 h-3 text-[var(--success)]" strokeWidth={3} />
        : <Rocket className="absolute w-3 h-3 text-[var(--brand-primary)]" strokeWidth={2} />}
    </span>
  );
  return (
    <>
      <NavLink
        ref={tip.ref}
        to="/setup"
        onMouseEnter={tip.onMouseEnter}
        onMouseLeave={tip.onMouseLeave}
        className={({ isActive }) => cn(
          "flex items-center rounded-md text-sm font-medium transition-colors group",
          isCollapsed ? "justify-center h-9 w-9 mx-auto" : "gap-3 px-3 py-2 w-full",
          isActive ? "bg-[var(--brand-tint)] text-[var(--brand-primary)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
        )}
      >
        {ring}
        {!isCollapsed && <span title={label} className="min-w-0 flex-1 truncate text-left">{label}</span>}
        {!isCollapsed && (
          <span className="shrink-0 text-[11px] font-medium tabular-nums text-[var(--brand-primary)]">{completed}/{total}</span>
        )}
      </NavLink>
      {tip.node}
    </>
  );
}

function NavButton({ icon: Icon, label, isActive, onClick, isCollapsed }: { icon: React.ElementType, label: string, isActive?: boolean, onClick: () => void, isCollapsed?: boolean }) {
  const tip = useNavTooltip(label, !!isCollapsed);
  return (
    <>
      <button
        ref={tip.ref}
        onClick={() => { tip.onMouseLeave(); onClick(); }}
        onMouseEnter={tip.onMouseEnter}
        onMouseLeave={tip.onMouseLeave}
        className={cn(
          "flex items-center rounded-md text-sm font-medium transition-colors group",
          isCollapsed ? "justify-center h-9 w-9 mx-auto" : "gap-3 px-3 py-2 w-full",
          isActive
            ? "bg-[var(--surface-subtle)] text-[var(--text-primary)]"
            : "text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
        )}
      >
        <Icon strokeWidth={1.75} className={cn("w-[17px] h-[17px] shrink-0 transition-colors", isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-tertiary)]")} />
        {!isCollapsed && <span title={label} className="min-w-0 flex-1 truncate text-left">{label}</span>}
      </button>
      {tip.node}
    </>
  );
}
