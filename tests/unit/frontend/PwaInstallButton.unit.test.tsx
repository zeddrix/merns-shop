import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import PwaInstallButton from '../../../frontend/src/components/PwaInstallButton';

const mockInstall = vi.fn().mockResolvedValue(undefined);

vi.mock('../../../frontend/src/context/PwaInstallContext', () => ({
  usePwaInstallContext: vi.fn(() => ({
    showInstallButton: false,
    install: mockInstall,
    dismissBanner: vi.fn()
  }))
}));

import { usePwaInstallContext } from '../../../frontend/src/context/PwaInstallContext';

const mockedUsePwaInstallContext = vi.mocked(usePwaInstallContext);

describe('PwaInstallButton', () => {
  const renderButton = async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<PwaInstallButton />);
    });

    return { container, root };
  };

  it('calls_install_when_native_prompt_available', async () => {
    mockInstall.mockClear();
    mockedUsePwaInstallContext.mockReturnValue({
      showInstallButton: true,
      install: mockInstall,
      dismissBanner: vi.fn()
    });

    const { container, root } = await renderButton();

    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="pwa-install-header-button"]')
        ?.click();
    });

    expect(mockInstall).toHaveBeenCalledTimes(1);

    root.unmount();
    container.remove();
  });

  it('renders_nothing_when_showInstallButton_false', async () => {
    mockedUsePwaInstallContext.mockReturnValue({
      showInstallButton: false,
      install: mockInstall,
      dismissBanner: vi.fn()
    });

    const { container, root } = await renderButton();

    expect(container.querySelector('[data-testid="pwa-install-header-button"]')).toBeNull();

    root.unmount();
    container.remove();
  });
});
