import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useSlowServerNotice } from '../../../frontend/src/hooks/useSlowServerNotice';
import { SLOW_SERVER_SESSION_WARMED_KEY } from '../../../frontend/src/constants/slowServerNotice';
import catalogMetaReducer from '../../../frontend/src/features/catalogMetaSlice';
import cartReducer from '../../../frontend/src/features/cartSlice';
import {
  listProducts,
  productListReducer,
  productDetailsReducer,
  productTopRatedReducer
} from '../../../frontend/src/features/productSlice';

function HookProbe({ onReady }: { onReady?: (showNotice: boolean) => void }) {
  const showNotice = useSlowServerNotice();
  onReady?.(showNotice);
  return <div data-testid="hook-probe" data-show-notice={String(showNotice)} />;
}

const createTestStore = (loading: boolean) =>
  configureStore({
    reducer: {
      productList: productListReducer,
      productTopRated: productTopRatedReducer,
      productDetails: productDetailsReducer,
      catalogMeta: catalogMetaReducer,
      cart: cartReducer
    },
    preloadedState: {
      productList: { products: [], loading },
      productTopRated: { products: [], loading: false },
      productDetails: { loading: false, product: { variants: [] } },
      catalogMeta: { meta: { brands: [], categories: [], subcategories: [] }, loading: false },
      cart: {
        cartItems: [],
        shippingAddress: {},
        staleItemsPruned: false,
        rehydrating: false
      }
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

  const renderWithStore = async (loading: boolean) => {
    const store = createTestStore(loading);
    await act(async () => {
      root.render(
        <Provider store={store}>
          <HookProbe />
        </Provider>
      );
    });
    return container.querySelector('[data-testid="hook-probe"]') as HTMLElement;
  };

  it('shows_notice_after_delay_when_catalog_loading', async () => {
    const probe = await renderWithStore(true);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(probe.getAttribute('data-show-notice')).toBe('true');
  });

  it('suppresses_notice_when_session_already_warmed', async () => {
    sessionStorage.setItem(SLOW_SERVER_SESSION_WARMED_KEY, '1');
    const probe = await renderWithStore(true);

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
      store.dispatch(
        listProducts.fulfilled({ products: [], page: 1, pages: 1 }, '', {
          keyword: '',
          pageNumber: '1'
        })
      );
    });

    expect(sessionStorage.getItem(SLOW_SERVER_SESSION_WARMED_KEY)).toBe('1');
  });
});
