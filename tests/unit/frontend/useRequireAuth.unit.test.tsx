import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../../../frontend/src/hooks/useRequireAuth';
import { authModalReducer } from '../../../frontend/src/features/authModalSlice';
import { userLoginReducer, userRegisterReducer } from '../../../frontend/src/features/userSlice';

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location-probe">
      {location.pathname}
      {location.search}
    </div>
  );
}

function GuardedShippingPage() {
  const isAuthenticated = useRequireAuth();
  return <div data-testid="shipping-guard">{isAuthenticated ? 'authenticated' : 'guest'}</div>;
}

function DismissAuthButton() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <button
      type="button"
      data-testid="dismiss-auth"
      onClick={() => navigate({ pathname: location.pathname, search: '' }, { replace: true })}
    >
      Dismiss
    </button>
  );
}

function TestApp({ sessionResolved = true }: { sessionResolved?: boolean }) {
  const store = configureStore({
    reducer: {
      authModal: authModalReducer,
      userLogin: userLoginReducer,
      userRegister: userRegisterReducer
    },
    preloadedState: {
      userLogin: { sessionResolved }
    }
  });

  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/shipping']}>
        <LocationProbe />
        <DismissAuthButton />
        <Routes>
          <Route path="/shipping" element={<GuardedShippingPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('useRequireAuth', () => {
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

  it('does_not_prompt_login_before_session_is_resolved', async () => {
    await act(async () => {
      root.render(<TestApp sessionResolved={false} />);
    });

    const probe = () => container.querySelector('[data-testid="location-probe"]');
    expect(probe()?.textContent).toBe('/shipping');
  });

  it('does_not_reopen_auth_query_after_user_dismisses_modal', async () => {
    await act(async () => {
      root.render(<TestApp />);
    });

    const probe = () => container.querySelector('[data-testid="location-probe"]');
    expect(probe()?.textContent).toContain('auth=login');

    const dismiss = container.querySelector('[data-testid="dismiss-auth"]') as HTMLButtonElement;
    await act(async () => {
      dismiss.click();
    });

    expect(probe()?.textContent).toBe('/shipping');
    expect(probe()?.textContent).not.toContain('auth=login');
  });
});
