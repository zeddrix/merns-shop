import { useEffect, useRef } from 'react';
import SearchBox from './SearchBox';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SearchOverlay = ({ open, onClose }: SearchOverlayProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="search-overlay" data-testid="search-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="search-overlay-backdrop"
        aria-label="Close search"
        data-testid="search-overlay-backdrop"
        onClick={onClose}
      />
      <div ref={panelRef} className="search-overlay-panel">
        <div className="search-overlay-header">
          <button
            type="button"
            className="search-overlay-close"
            data-testid="search-overlay-close"
            onClick={onClose}
            aria-label="Close search"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>
        <SearchBox onSubmit={onClose} autoFocus />
      </div>
    </div>
  );
};

export default SearchOverlay;
