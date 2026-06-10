import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useSlowServerNotice } from '../../../frontend/src/hooks/useSlowServerNotice';
import { SLOW_SERVER_SESSION_WARMED_KEY } from '../../../frontend/src/constants/slowServerNotice';
import {
  apiLoadingReducer,
  apiRequestFinished,
  apiRequestStarted
} from '../../../frontend/src/features/apiLoadingSlice';

function HookProbe({ onReady }: { onReady?: (showNotice: boolean) => void }) {
  const showNotice = useSlowServerNotice();
  onReady?.(showNotice);
  return <div data-testid="hook-probe" data-show-notice={String(showNotice)} />;
}

const createTestStore = (inFlight: boolean) =>
  configureStore({
    reducer: {
      apiLoading: apiLoadingReducer
    },
    preloadedState: {
      apiLoading: { inFlightCount: inFlight ? 1 : 0 }
    }
  });

describe('useSlowServerNotice', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
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

  const renderWithStore = async (inFlight: boolean) => {
    const store = createTestStore(inFlight);
    await act(async () => {
      root.render(
        <Provider store={store}>
          <HookProbe />
        </Provider>
      );
    });
    return { probe: container.querySelector('[data-testid="hook-probe"]') as HTMLElement, store };
  };

  it('shows_notice_after_delay_when_api_loading', async () => {
    const { probe } = await renderWithStore(true);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(probe.getAttribute('data-show-notice')).toBe('true');
  });

  it('suppresses_notice_when_session_already_warmed', async () => {
    sessionStorage.setItem(SLOW_SERVER_SESSION_WARMED_KEY, '1');
    const { probe } = await renderWithStore(true);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(probe.getAttribute('data-show-notice')).toBe('false');
  });

  it('marks_session_warmed_after_slow_load_completes', async () => {
    const store = createTestStore(true);
    await act(async () => {
      root.render(
        <Provider store={store}>
          <HookProbe />
        </Provider>
      );
    });

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    await act(async () => {
      store.dispatch(apiRequestFinished());
    });

    expect(sessionStorage.getItem(SLOW_SERVER_SESSION_WARMED_KEY)).toBe('1');
  });

  it('tracks_started_requests_via_api_loading_slice', async () => {
    const store = createTestStore(false);
    await act(async () => {
      root.render(
        <Provider store={store}>
          <HookProbe />
        </Provider>
      );
    });

    await act(async () => {
      store.dispatch(apiRequestStarted());
    });

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    const probe = container.querySelector('[data-testid="hook-probe"]') as HTMLElement;
    expect(probe.getAttribute('data-show-notice')).toBe('true');
  });
});
