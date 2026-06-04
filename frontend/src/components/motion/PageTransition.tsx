import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { getPageTransition } from '../../utils/motion';

interface PageTransitionProps {
  children: ReactNode;
  routeKey: string;
}

const PageTransition = ({ children, routeKey }: PageTransitionProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const { duration, y } = getPageTransition(reducedMotion);

  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
