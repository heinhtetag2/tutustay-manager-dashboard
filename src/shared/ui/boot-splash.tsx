import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandDots } from './brand-dots';

/**
 * Full-screen branded loading splash shown once while the app shell first
 * mounts, then fades away. The wordmark + bouncing dots stand in for the boot
 * sequence; swap the timeout for a real readiness signal when one exists.
 */
export function BootSplash({ minDuration = 1000 }: { minDuration?: number }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setShow(false), minDuration);
    return () => clearTimeout(id);
  }, [minDuration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-serif tracking-tight text-[var(--text-primary)]"
          >
            TutuStay
          </motion.div>
          <BrandDots />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
