import { describe, expect, it } from 'vitest';
import {
  login,
  logout,
  userLoginReducer,
  userUpdateProfileReducer,
  updateUserProfile,
  loadUserFromSession
} from '../../../frontend/src/features/userSlice';
import type { UserInfo } from '../../../frontend/src/types';

describe('userSlice action types', () => {
  it('login async thunk has expected type prefix', () => {
    expect(login.pending.type).toBe('userLogin/login/pending');
    expect(login.fulfilled.type).toBe('userLogin/login/fulfilled');
  });

  it('logout async thunk has expected type prefix', () => {
    expect(logout.pending.type).toBe('user/logout/pending');
  });
});

describe('userSlice reducers', () => {
  it('userLoginReducer stores userInfo on login fulfilled', () => {
    const userInfo = {
      _id: 'u1',
      name: 'John',
      email: 'john@gmail.com',
      isAdmin: false
    } as UserInfo;

    const state = userLoginReducer(undefined, {
      type: login.fulfilled.type,
      payload: userInfo
    });

    expect(state.userInfo).toEqual(userInfo);
    expect(state.loading).toBe(false);
    expect(state.sessionResolved).toBe(true);
  });

  it('userLoginReducer stores error on login rejected', () => {
    const state = userLoginReducer(undefined, {
      type: login.rejected.type,
      payload: 'Invalid email or password',
      error: { message: 'Rejected' }
    });

    expect(state.error).toBe('Invalid email or password');
    expect(state.loading).toBe(false);
  });

  it('userLoginReducer clears userInfo on logout pending', () => {
    const initial = userLoginReducer(undefined, {
      type: login.fulfilled.type,
      payload: { _id: 'u1', name: 'John', email: 'john@gmail.com', isAdmin: false }
    });

    const state = userLoginReducer(initial, { type: logout.pending.type });

    expect(state.userInfo).toBeUndefined();
    expect(state.sessionResolved).toBe(true);
  });

  it('userLoginReducer resolves session without user on loadUserFromSession rejected', () => {
    const state = userLoginReducer(undefined, {
      type: loadUserFromSession.rejected.type,
      payload: 'No active session',
      error: { message: 'Rejected' }
    });

    expect(state.userInfo).toBeUndefined();
    expect(state.sessionResolved).toBe(true);
  });

  it('userLoginReducer preserves userInfo when session refresh hits API unreachable', () => {
    const loggedIn = userLoginReducer(undefined, {
      type: login.fulfilled.type,
      payload: { _id: 'u1', name: 'John', email: 'john@gmail.com', isAdmin: false }
    });

    const state = userLoginReducer(loggedIn, {
      type: loadUserFromSession.rejected.type,
      payload: 'API unreachable',
      error: { message: 'Rejected' }
    });

    expect(state.userInfo?.email).toBe('john@gmail.com');
    expect(state.sessionResolved).toBe(true);
  });

  it('userUpdateProfileReducer marks success on fulfilled', () => {
    const userInfo = {
      _id: 'u1',
      name: 'Updated John',
      email: 'john@gmail.com',
      isAdmin: false
    } as UserInfo;

    const state = userUpdateProfileReducer(undefined, {
      type: updateUserProfile.fulfilled.type,
      payload: userInfo
    });

    expect(state.success).toBe(true);
    expect(state.userInfo).toEqual(userInfo);
    expect(state.loading).toBe(false);
  });
});
