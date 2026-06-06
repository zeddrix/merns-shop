import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useRequireAdmin } from '../../../frontend/src/hooks/useRequireAdmin';
import { authModalReducer } from '../../../frontend/src/features/authModalSlice';
import { userLoginReducer, userRegisterReducer } from '../../../frontend/src/features/userSlice';
import type { UserInfo } from '../../../frontend/src/types';

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location-probe">
      {location.pathname}
      {location.search}
    </div>
  );
}

function GuardedAdminPage() {
  const isAdmin = useRequireAdmin();
  return <div data-testid="admin-guard">{isAdmin ? 'admin' : 'guest'}</div>;
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

function TestApp({
  sessionResolved = true,
  userInfo
}: {
  sessionResolved?: boolean;
  userInfo?: UserInfo;
}) {
  const store = configureStore({
    reducer: {
      authModal: authModalReducer,
      userLogin: userLoginReducer,
      userRegister: userRegisterReducer
    },
    preloadedState: {
      userLogin: { sessionResolved, userInfo }
    }
  });

  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin/userlist']}>
        <LocationProbe />
        <DismissAuthButton />
        <Routes>
          <Route path="/admin/userlist" element={<GuardedAdminPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('useRequireAdmin', () => {
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
    expect(probe()?.textContent).toBe('/admin/userlist');
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

    expect(probe()?.textContent).toBe('/admin/userlist');
    expect(probe()?.textContent).not.toContain('auth=login');
  });
});
