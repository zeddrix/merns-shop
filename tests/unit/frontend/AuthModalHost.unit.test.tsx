import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes, Link, useLocation } from 'react-router-dom';
import AuthModalHost from '../../../frontend/src/components/AuthModalHost';
import { authModalReducer } from '../../../frontend/src/features/authModalSlice';
import { userLoginReducer } from '../../../frontend/src/features/userSlice';
import { userRegisterReducer } from '../../../frontend/src/features/userSlice';

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location-probe">
      {location.pathname}
      {location.search}
    </div>
  );
}

function TestApp() {
  const store = configureStore({
    reducer: {
      authModal: authModalReducer,
      userLogin: userLoginReducer,
      userRegister: userRegisterReducer
    }
  });

  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/?auth=login&redirect=%2F']}>
        <LocationProbe />
        <Link to="/cart" data-testid="go-cart">
          Cart
        </Link>
        <Routes>
          <Route path="*" element={<AuthModalHost />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('AuthModalHost', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('strips_auth_search_when_pathname_changes_while_modal_open', async () => {
    await act(async () => {
      root.render(<TestApp />);
    });

    expect(container.querySelector('[data-testid="auth-modal"]')).not.toBeNull();

    const link = container.querySelector('[data-testid="go-cart"]') as HTMLAnchorElement;
    await act(async () => {
      link.click();
    });

    const probe = container.querySelector('[data-testid="location-probe"]');
    expect(probe?.textContent).toBe('/cart');
    expect(container.querySelector('[data-testid="auth-modal"]')).toBeNull();
  });
});
