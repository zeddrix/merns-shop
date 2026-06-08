import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { detectPwaInstalled } from '../../../frontend/src/hooks/usePwaInstallPrompt';

describe('detectPwaInstalled', () => {
  const originalMatchMedia = window.matchMedia.bind(window);

  beforeEach(() => {
    Object.defineProperty(window.navigator, 'standalone', {
      configurable: true,
      value: undefined,
      writable: true
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it('returns_true_when_display_mode_is_standalone', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));

    expect(detectPwaInstalled()).toBe(true);
  });

  it('returns_true_when_ios_navigator_standalone', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));
    Object.defineProperty(window.navigator, 'standalone', {
      configurable: true,
      value: true
    });

    expect(detectPwaInstalled()).toBe(true);
  });

  it('returns_false_in_regular_browser', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));

    expect(detectPwaInstalled()).toBe(false);
  });
});
