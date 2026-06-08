import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import PwaInstallBanner from '../../../frontend/src/components/PwaInstallBanner';

const mockInstall = vi.fn().mockResolvedValue(undefined);
const mockDismiss = vi.fn();

vi.mock('../../../frontend/src/context/PwaInstallContext', () => ({
  usePwaInstallContext: () => ({
    hasNativePrompt: true,
    showInstallButton: true,
    showInstallBanner: true,
    install: mockInstall,
    dismissBanner: mockDismiss,
    isInstalled: false
  })
}));

describe('PwaInstallBanner', () => {
  const renderBanner = async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<PwaInstallBanner />);
    });

    return { container, root };
  };

  it('renders_install_actions_when_showInstallBanner_true', async () => {
    const { container, root } = await renderBanner();

    expect(container.querySelector('[data-testid="pwa-install-banner"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="pwa-install-button"]')?.textContent).toBe(
      'Install'
    );
    expect(container.querySelector('[data-testid="pwa-install-dismiss"]')?.textContent).toBe(
      'Not now'
    );

    root.unmount();
    container.remove();
  });

  it('calls_install_and_dismiss_handlers', async () => {
    mockInstall.mockClear();
    mockDismiss.mockClear();
    const { container, root } = await renderBanner();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="pwa-install-button"]')?.click();
    });
    expect(mockInstall).toHaveBeenCalledTimes(1);

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="pwa-install-dismiss"]')?.click();
    });
    expect(mockDismiss).toHaveBeenCalledTimes(1);

    root.unmount();
    container.remove();
  });
});
