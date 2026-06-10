import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import SearchOverlay from '../../../frontend/src/components/SearchOverlay';

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    button: ({
      children,
      onClick,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) => (
      <button type="button" onClick={onClick} {...props}>
        {children}
      </button>
    ),
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    )
  }
}));

vi.mock('../../../frontend/src/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => false
}));

describe('SearchOverlay', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  const renderOverlay = async (open: boolean, onClose = vi.fn()) => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <SearchOverlay open={open} onClose={onClose} />
        </MemoryRouter>
      );
    });
    return onClose;
  };

  it('renders_overlay_panel_when_open', async () => {
    await renderOverlay(true);
    expect(container.querySelector('[data-testid="search-overlay"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="search-overlay-panel"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="search-input"]')).not.toBeNull();
  });

  it('renders_nothing_when_closed', async () => {
    await renderOverlay(false);
    expect(container.querySelector('[data-testid="search-overlay"]')).toBeNull();
  });

  it('calls_onClose_when_backdrop_clicked', async () => {
    const onClose = await renderOverlay(true);
    const backdrop = container.querySelector(
      '[data-testid="search-overlay-backdrop"]'
    ) as HTMLButtonElement;
    backdrop.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls_onClose_when_close_button_clicked', async () => {
    const onClose = await renderOverlay(true);
    const closeButton = container.querySelector(
      '[data-testid="search-overlay-close"]'
    ) as HTMLButtonElement;
    closeButton.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls_onClose_on_escape_key', async () => {
    const onClose = await renderOverlay(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
