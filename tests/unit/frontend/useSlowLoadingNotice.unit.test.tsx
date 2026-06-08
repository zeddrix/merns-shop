import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { useSlowLoadingNotice } from '../../../frontend/src/hooks/useSlowLoadingNotice';

function HookProbe({
  isLoading,
  delayMs,
  onReady
}: {
  isLoading: boolean;
  delayMs?: number;
  onReady?: (showNotice: boolean) => void;
}) {
  const showNotice = useSlowLoadingNotice(isLoading, delayMs);
  onReady?.(showNotice);
  return <div data-testid="hook-probe" data-show-notice={String(showNotice)} />;
}

describe('useSlowLoadingNotice', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  const renderProbe = async (isLoading: boolean, delayMs = 3000) => {
    await act(async () => {
      root.render(<HookProbe isLoading={isLoading} delayMs={delayMs} />);
    });
    return container.querySelector('[data-testid="hook-probe"]') as HTMLElement;
  };

  it('does_not_show_notice_before_delay_elapses', async () => {
    const probe = await renderProbe(true, 3000);

    await act(async () => {
      vi.advanceTimersByTime(2999);
    });

    expect(probe.getAttribute('data-show-notice')).toBe('false');
  });

  it('shows_notice_after_delay_elapses', async () => {
    const probe = await renderProbe(true, 3000);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(probe.getAttribute('data-show-notice')).toBe('true');
  });

  it('clears_notice_when_loading_resolves', async () => {
    await act(async () => {
      root.render(<HookProbe isLoading={true} delayMs={3000} />);
    });

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(
      container.querySelector('[data-testid="hook-probe"]')?.getAttribute('data-show-notice')
    ).toBe('true');

    await act(async () => {
      root.render(<HookProbe isLoading={false} delayMs={3000} />);
    });

    expect(
      container.querySelector('[data-testid="hook-probe"]')?.getAttribute('data-show-notice')
    ).toBe('false');
  });
});
