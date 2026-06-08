import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import {
  detectPwaInstalled,
  hasServiceWorkerController,
  isInstallCapableBrowser,
  INSTALL_BANNER_DISMISSED_KEY,
  usePwaInstallPrompt
} from '../../../frontend/src/hooks/usePwaInstallPrompt';
import {
  PwaInstallProvider,
  usePwaInstallContext
} from '../../../frontend/src/context/PwaInstallContext';

function HookProbe({
  onReady
}: {
  onReady?: (value: ReturnType<typeof usePwaInstallPrompt>) => void;
}) {
  const value = usePwaInstallPrompt();
  onReady?.(value);
  return (
    <div
      data-testid="hook-probe"
      data-has-native-prompt={String(value.hasNativePrompt)}
      data-show-install-button={String(value.showInstallButton)}
      data-show-install-banner={String(value.showInstallBanner)}
      data-is-installed={String(value.isInstalled)}
    />
  );
}

function ContextProbe({ field }: { field: 'showInstallBanner' | 'showInstallButton' }) {
  const context = usePwaInstallContext();
  return <div data-testid={`context-probe-${field}`} data-value={String(context[field])} />;
}

async function waitForProbe(
  container: HTMLElement,
  predicate: (probe: HTMLElement) => boolean
): Promise<HTMLElement> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const probe = container.querySelector('[data-testid="hook-probe"]');
    if (probe && predicate(probe as HTMLElement)) {
      return probe as HTMLElement;
    }
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }
  throw new Error('waitForProbe timed out');
}

async function waitForContextProbe(
  container: HTMLElement,
  field: 'showInstallBanner' | 'showInstallButton',
  expected: boolean
): Promise<HTMLElement> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const probe = container.querySelector(`[data-testid="context-probe-${field}"]`);
    if (probe?.getAttribute('data-value') === String(expected)) {
      return probe as HTMLElement;
    }
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }
  throw new Error(`waitForContextProbe timed out for ${field}=${expected}`);
}

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

let controllerChangeHandlers: Array<() => void> = [];

function mockServiceWorker(controller: object | null) {
  controllerChangeHandlers = [];
  Object.defineProperty(window.navigator, 'serviceWorker', {
    configurable: true,
    value: {
      controller,
      ready: Promise.resolve({} as ServiceWorkerRegistration),
      addEventListener: (event: string, handler: () => void) => {
        if (event === 'controllerchange') {
          controllerChangeHandlers.push(handler);
        }
      },
      removeEventListener: vi.fn()
    },
    writable: true
  });
}

describe('usePwaInstallPrompt', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  const originalMatchMedia = window.matchMedia.bind(window);
  let latestHook: ReturnType<typeof usePwaInstallPrompt> | null = null;

  beforeEach(() => {
    latestHook = null;
    localStorage.clear();
    window.__deferredInstallPrompt = null;
    window.__e2eInstallPrompt = undefined;
    window.__e2ePromptCalled = false;
    document.head.innerHTML = '<link rel="manifest" href="/manifest.webmanifest" />';
    Object.defineProperty(window.navigator, 'standalone', {
      configurable: true,
      value: undefined,
      writable: true
    });
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));
    mockServiceWorker({});
    Object.defineProperty(window.navigator, 'getInstalledRelatedApps', {
      configurable: true,
      value: vi.fn().mockResolvedValue([]),
      writable: true
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
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  const renderHookProbe = async () => {
    await act(async () => {
      root.render(
        <HookProbe
          onReady={(value) => {
            latestHook = value;
          }}
        />
      );
    });
  };

  it('isInstallCapableBrowser_requires_manifest_sw_api_and_controller', () => {
    mockServiceWorker({});
    expect(isInstallCapableBrowser()).toBe(true);
    expect(hasServiceWorkerController()).toBe(true);

    mockServiceWorker(null);
    expect(isInstallCapableBrowser()).toBe(false);

    mockServiceWorker({});
    document.head.innerHTML = '';
    expect(isInstallCapableBrowser()).toBe(false);
  });

  it('hydrates_deferred_prompt_from_window_on_mount', async () => {
    const mockPrompt = {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const })
    } as unknown as BeforeInstallPromptEvent;
    window.__deferredInstallPrompt = mockPrompt;

    await renderHookProbe();

    const probe = await waitForProbe(
      container,
      (element) => element.getAttribute('data-has-native-prompt') === 'true'
    );
    expect(probe.getAttribute('data-has-native-prompt')).toBe('true');
  });

  it('showInstallButton_false_without_native_prompt', async () => {
    await renderHookProbe();

    const probe = await waitForProbe(
      container,
      (element) => element.getAttribute('data-is-installed') === 'false'
    );
    expect(probe.getAttribute('data-show-install-button')).toBe('false');
  });

  it('showInstallButton_true_when_native_prompt_available', async () => {
    const mockPrompt = {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const })
    } as unknown as BeforeInstallPromptEvent;
    window.__deferredInstallPrompt = mockPrompt;

    await renderHookProbe();

    const probe = await waitForProbe(
      container,
      (element) => element.getAttribute('data-show-install-button') === 'true'
    );
    expect(probe.getAttribute('data-has-native-prompt')).toBe('true');
  });

  it('resyncs_prompt_when_service_worker_controller_becomes_ready', async () => {
    mockServiceWorker(null);

    await renderHookProbe();

    await waitForProbe(
      container,
      (element) => element.getAttribute('data-is-installed') === 'false'
    );
    expect(latestHook?.showInstallButton).toBe(false);

    const mockPrompt = {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const })
    } as unknown as BeforeInstallPromptEvent;
    window.__deferredInstallPrompt = mockPrompt;
    Object.defineProperty(navigator.serviceWorker, 'controller', {
      configurable: true,
      value: {}
    });

    await act(async () => {
      for (const handler of controllerChangeHandlers) {
        handler();
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    await waitForProbe(
      container,
      (element) => element.getAttribute('data-show-install-button') === 'true'
    );
  });

  it('returns_installed_when_related_apps_has_entry', async () => {
    Object.defineProperty(window.navigator, 'getInstalledRelatedApps', {
      configurable: true,
      value: vi.fn().mockResolvedValue([{ id: 'merns-shop' }]),
      writable: true
    });

    await renderHookProbe();

    const probe = await waitForProbe(
      container,
      (element) => element.getAttribute('data-is-installed') === 'true'
    );
    expect(probe.getAttribute('data-show-install-button')).toBe('false');
  });

  it('showInstallBanner_false_when_banner_dismissed', async () => {
    localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, 'true');
    const mockPrompt = {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const })
    } as unknown as BeforeInstallPromptEvent;
    window.__deferredInstallPrompt = mockPrompt;

    await renderHookProbe();

    await waitForProbe(
      container,
      (element) => element.getAttribute('data-has-native-prompt') === 'true'
    );
    expect(latestHook?.showInstallBanner).toBe(false);
  });

  it('dismissBanner_persists_to_local_storage', async () => {
    const mockPrompt = {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const })
    } as unknown as BeforeInstallPromptEvent;
    window.__deferredInstallPrompt = mockPrompt;

    await renderHookProbe();

    await waitForProbe(
      container,
      (element) => element.getAttribute('data-show-install-banner') === 'true'
    );

    await act(async () => {
      latestHook?.dismissBanner();
    });

    expect(latestHook?.showInstallBanner).toBe(false);
    expect(localStorage.getItem(INSTALL_BANNER_DISMISSED_KEY)).toBe('true');
  });
});

describe('PwaInstallProvider', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    localStorage.clear();
    document.head.innerHTML = '<link rel="manifest" href="/manifest.webmanifest" />';
    mockServiceWorker({});
    Object.defineProperty(window.navigator, 'getInstalledRelatedApps', {
      configurable: true,
      value: vi.fn().mockResolvedValue([]),
      writable: true
    });
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));
    container = document.createElement('div') as HTMLDivElement;
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

  it('shares_install_state_between_context_consumers', async () => {
    await act(async () => {
      root.render(
        <PwaInstallProvider>
          <ContextProbe field="showInstallButton" />
          <ContextProbe field="showInstallBanner" />
        </PwaInstallProvider>
      );
    });

    const mockPrompt = {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const })
    } as unknown as BeforeInstallPromptEvent;

    await act(async () => {
      window.__e2eInstallPrompt = mockPrompt;
      window.__deferredInstallPrompt = mockPrompt;
      window.dispatchEvent(new Event('test-simulate-installable'));
    });

    await waitForContextProbe(container, 'showInstallButton', true);
    await waitForContextProbe(container, 'showInstallBanner', true);
  });
});
