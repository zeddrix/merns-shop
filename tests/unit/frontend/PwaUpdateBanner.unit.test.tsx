import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import PwaUpdateBanner from '../../../frontend/src/components/PwaUpdateBanner';

describe('PwaUpdateBanner', () => {
  const renderBanner = async () => {
    const onReload = vi.fn();
    const onDismiss = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<PwaUpdateBanner onReload={onReload} onDismiss={onDismiss} />);
    });

    return { container, root, onReload, onDismiss };
  };

  it('renders_update_message_and_action_buttons', async () => {
    const { container, root } = await renderBanner();

    expect(container.querySelector('[data-testid="pwa-update-banner"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="pwa-update-message"]')?.textContent).toBe(
      "A new version of MERN's Shop is ready."
    );
    expect(container.querySelector('[data-testid="pwa-update-actions"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="pwa-update-reload"]')?.textContent).toBe(
      'Reload'
    );
    expect(container.querySelector('[data-testid="pwa-update-dismiss"]')?.textContent).toBe(
      'Update Later'
    );

    root.unmount();
    container.remove();
  });

  it('calls_onReload_when_reload_button_clicked', async () => {
    const { container, root, onReload } = await renderBanner();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="pwa-update-reload"]')?.click();
    });

    expect(onReload).toHaveBeenCalledTimes(1);

    root.unmount();
    container.remove();
  });

  it('calls_onDismiss_when_update_later_clicked', async () => {
    const { container, root, onDismiss } = await renderBanner();

    await act(async () => {
      container.querySelector<HTMLButtonElement>('[data-testid="pwa-update-dismiss"]')?.click();
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);

    root.unmount();
    container.remove();
  });
});
