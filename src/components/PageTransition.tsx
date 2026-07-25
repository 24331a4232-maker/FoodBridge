import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { pageTransition } from '@/lib/animations';

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
