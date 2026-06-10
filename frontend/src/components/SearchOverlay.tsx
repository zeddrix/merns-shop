import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SearchBox from './SearchBox';
import AppIcon from './icons/AppIcon';
import { faTimes } from './icons';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { getSearchOverlayTransition } from '../utils/motion';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SEARCH_OVERLAY_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const SearchOverlay = ({ open, onClose }: SearchOverlayProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const { duration, y } = getSearchOverlayTransition(reducedMotion);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="search-overlay"
          className="search-overlay"
          data-testid="search-overlay"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          <motion.button
            type="button"
            className="search-overlay-backdrop"
            aria-label="Close search"
            data-testid="search-overlay-backdrop"
            onClick={onClose}
            initial={{ opacity: reducedMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reducedMotion ? 1 : 0 }}
            transition={{ duration, ease: SEARCH_OVERLAY_EASE }}
          />
          <motion.div
            className="search-overlay-panel search-overlay-panel--dark"
            data-testid="search-overlay-panel"
            initial={{ y, opacity: reducedMotion ? 1 : 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y, opacity: reducedMotion ? 1 : 0 }}
            transition={{ duration, ease: SEARCH_OVERLAY_EASE }}
          >
            <div className="search-overlay-header">
              <button
                type="button"
                className="search-overlay-close"
                data-testid="search-overlay-close"
                onClick={onClose}
                aria-label="Close search"
              >
                <AppIcon icon={faTimes} />
              </button>
            </div>
            <SearchBox onSubmit={onClose} autoFocus />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default SearchOverlay;
