import { describe, expect, it, afterEach, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import PwaInstallHint from '../../../frontend/src/components/PwaInstallHint';

describe('PwaInstallHint', () => {
  const originalUserAgent = navigator.userAgent;

  afterEach(() => {
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value: originalUserAgent,
      writable: true
    });
    vi.restoreAllMocks();
  });

  const renderHint = async (onClose = vi.fn()) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<PwaInstallHint onClose={onClose} />);
    });

    return { container, root, onClose };
  };

  it('shows_desktop_install_instructions', async () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      writable: true
    });

    const { container, root } = await renderHint();

    expect(container.querySelector('[data-testid="pwa-install-hint"]')).not.toBeNull();
    expect(container.querySelector('.pwa-install-hint-message')?.textContent).toContain(
      'browser menu'
    );

    root.unmount();
    container.remove();
  });

  it('shows_ios_add_to_home_screen_instructions', async () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      writable: true
    });

    const { container, root } = await renderHint();

    expect(container.querySelector('.pwa-install-hint-message')?.textContent).toContain(
      'Add to Home Screen'
    );

    root.unmount();
    container.remove();
  });

  it('calls_onClose_when_got_it_clicked', async () => {
    const onClose = vi.fn();
    const { container, root } = await renderHint(onClose);

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="pwa-install-hint-close"]')?.click();
    });

    expect(onClose).toHaveBeenCalledTimes(1);

    root.unmount();
    container.remove();
  });
});
