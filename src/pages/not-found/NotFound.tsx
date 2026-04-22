import React from 'react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex h-full w-full flex-col items-center justify-center space-y-4"
    >
      <h1 className="text-4xl font-semibold text-slate-900">404</h1>
      <p className="text-slate-500">This page could not be found.</p>
    </motion.div>
  );
}
