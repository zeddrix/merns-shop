import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { useScrollIntoViewOnKeyChange } from '../../../frontend/src/hooks/useScrollIntoViewOnKeyChange';

function ScrollTestHarness({
  changeKey,
  contentReady
}: {
  changeKey: string;
  contentReady: boolean;
}) {
  useScrollIntoViewOnKeyChange('scroll-target', changeKey, contentReady);
  return <div data-testid="scroll-target">Target</div>;
}

describe('useScrollIntoViewOnKeyChange', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>;
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }))
    });

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it('scrolls_target_into_view_when_key_changes_and_content_ready', async () => {
    await act(async () => {
      root.render(<ScrollTestHarness changeKey="product-1" contentReady={true} />);
    });

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start'
    });
  });

  it('does_not_scroll_when_content_not_ready', async () => {
    await act(async () => {
      root.render(<ScrollTestHarness changeKey="product-1" contentReady={false} />);
    });

    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it('does_not_scroll_again_when_content_ready_toggles_for_same_key', async () => {
    await act(async () => {
      root.render(<ScrollTestHarness changeKey="product-1" contentReady={true} />);
    });
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.render(<ScrollTestHarness changeKey="product-1" contentReady={false} />);
    });
    await act(async () => {
      root.render(<ScrollTestHarness changeKey="product-1" contentReady={true} />);
    });

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
  });
});
