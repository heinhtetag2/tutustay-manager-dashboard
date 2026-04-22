import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Bell } from 'lucide-react';
import { Sidebar } from '@/widgets/sidebar';

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileNotifOpen, setIsMobileNotifOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar + notifications when the route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
    setIsMobileNotifOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen || isMobileNotifOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen, isMobileNotifOpen]);

  return (
    <div className="flex h-screen w-full bg-white text-[#1A1A1A] font-sans overflow-hidden selection:bg-[#F3F3F3]">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        isMobileNotifOpen={isMobileNotifOpen}
        onMobileNotifChange={setIsMobileNotifOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden h-14 flex items-center justify-between px-4 border-b border-[#EBEBEB] bg-white shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} />
          </button>
          <div
            aria-label="Logo placeholder"
            className="h-8 w-24 border border-dashed border-[#D4D4D4] bg-[#F3F3F3] rounded-md flex items-center justify-center text-[10px] font-medium tracking-wide text-[#616161] select-none"
          >
            LOGO
          </div>
          <button
            type="button"
            onClick={() => setIsMobileNotifOpen(true)}
            className="relative p-1.5 text-[#1A1A1A] hover:bg-[#F3F3F3] rounded-md transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" strokeWidth={1.75} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FF3C21] rounded-full" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 h-full flex flex-col overflow-y-auto bg-[#FAFAFA]"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
