import { motion } from 'motion/react';
import { Portal } from '@/shared/ui/portal';

/**
 * Right-anchored slide-in panel for create/edit forms.
 * Render conditionally inside an <AnimatePresence> so the exit animation runs.
 * Children should be: header (shrink-0), body (flex-1 overflow-y-auto), footer (shrink-0).
 */
export function SideSheet({
  onClose,
  children,
  widthClass = 'max-w-lg',
}: {
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
}) {
  return (
    <Portal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-[var(--text-primary)]/30 z-50"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 right-0 h-full w-full ${widthClass} bg-white border-l border-[var(--border-default)] flex flex-col z-50 shadow-[-8px_0_28px_rgba(44,38,39,0.1)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.aside>
    </Portal>
  );
}
