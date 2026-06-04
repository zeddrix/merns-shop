import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { getStaggerTransition } from '../../utils/motion';

interface StaggerGridProps {
  children: ReactNode;
  listKey: string;
  className?: string;
  'data-testid'?: string;
}

export const staggerItemVariants = (reducedMotion: boolean) => ({
  hidden: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: reducedMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] as const }
  }
});

const StaggerGrid = ({ children, listKey, className, 'data-testid': testId }: StaggerGridProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const stagger = getStaggerTransition(reducedMotion);

  return (
    <motion.div
      key={listKey}
      className={className}
      data-testid={testId}
      initial={reducedMotion ? false : 'hidden'}
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: stagger
        }
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerGridItem = motion.div;

export default StaggerGrid;
