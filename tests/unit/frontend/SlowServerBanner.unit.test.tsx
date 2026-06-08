import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import SlowServerBanner from '../../../frontend/src/components/SlowServerBanner';
import { SLOW_SERVER_NOTICE_MESSAGE } from '../../../frontend/src/constants/slowServerNotice';

const mockUseSlowServerNotice = vi.fn();

vi.mock('../../../frontend/src/hooks/useSlowServerNotice', () => ({
  useSlowServerNotice: () => mockUseSlowServerNotice()
}));

describe('SlowServerBanner', () => {
  const renderBanner = async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<SlowServerBanner />);
    });

    return { container, root };
  };

  it('renders_notice_when_showNotice_true', async () => {
    mockUseSlowServerNotice.mockReturnValue(true);

    const { container, root } = await renderBanner();

    const banner = container.querySelector('[data-testid="slow-server-banner"]');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain(SLOW_SERVER_NOTICE_MESSAGE);

    root.unmount();
    container.remove();
  });

  it('renders_nothing_when_showNotice_false', async () => {
    mockUseSlowServerNotice.mockReturnValue(false);

    const { container, root } = await renderBanner();

    expect(container.querySelector('[data-testid="slow-server-banner"]')).toBeNull();

    root.unmount();
    container.remove();
  });
});
