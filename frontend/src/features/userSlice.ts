import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axios } from '../api/http';
import type { User, UserInfo } from '../types';
import { getErrorMessage, isApiUnreachableError } from '../utils/getErrorMessage';
import { hasSession } from '../utils/requireSession';
import { clearCartItems } from './cartSlice';

interface UserSliceRootState {
  userLogin: { userInfo?: UserInfo };
}

export interface AuthState {
  loading?: boolean;
  error?: string;
  success?: boolean;
  userInfo?: UserInfo;
  /** False until loadUserFromSession completes on first app load. */
  sessionResolved?: boolean;
}

export interface UserDetailsState {
  user: User;
  loading?: boolean;
  error?: string;
}

export interface UserListState {
  users: User[];
  loading?: boolean;
  error?: string;
}

const emptyUser = (): User => ({
  _id: '',
  name: '',
  email: '',
  isAdmin: false
});

export const loadUserFromSession = createAsyncThunk(
  'userLogin/loadSession',
  async (_void: undefined, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<UserInfo>('/api/users/profile');
      return data;
    } catch (error) {
      if (isApiUnreachableError(error)) {
        return rejectWithValue('API unreachable');
      }
      return rejectWithValue('No active session');
    }
  }
);

export const login = createAsyncThunk(
  'userLogin/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post<UserInfo>('/api/users/login', { email, password });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const register = createAsyncThunk(
  'userRegister/register',
  async (
    { name, email, password }: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.post<UserInfo>('/api/users', { name, email, password });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const logout = createAsyncThunk('user/logout', async (_void: undefined, { dispatch }) => {
  try {
    await axios.post('/api/users/logout');
  } catch {
    // Clear client state even if the network call fails
  }
  localStorage.removeItem('cartItems');
  localStorage.removeItem('shippingAddress');
  localStorage.removeItem('paymentMethod');
  dispatch(clearCartItems());
  window.location.href = '/';
});

export const getUserDetails = createAsyncThunk(
  'userDetails/fetch',
  async (id: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const { userLogin } = getState() as UserSliceRootState;
      if (!hasSession(userLogin.userInfo)) throw new Error('Not authenticated');
      const url = id === 'profile' ? '/api/users/profile' : `/api/users/${id}`;
      const { data } = await axios.get<User>(url);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      if (message === 'Not authorized, token failed') {
        dispatch(logout());
      }
      return rejectWithValue(message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'userUpdateProfile/update',
  async (
    user: { id: string; name: string; email: string; password: string },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const { userLogin } = getState() as UserSliceRootState;
      if (!hasSession(userLogin.userInfo)) throw new Error('Not authenticated');
      const { data } = await axios.put<UserInfo>('/api/users/profile', user);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      if (message === 'Not authorized, token failed') {
        dispatch(logout());
      }
      return rejectWithValue(message);
    }
  }
);

export const listUsers = createAsyncThunk(
  'userList/list',
  async (_void: undefined, { getState, dispatch, rejectWithValue }) => {
    try {
      const { userLogin } = getState() as UserSliceRootState;
      if (!hasSession(userLogin.userInfo)) throw new Error('Not authenticated');
      const { data } = await axios.get<User[]>('/api/users');
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      if (message === 'Not authorized, token failed') {
        dispatch(logout());
      }
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'userDelete/delete',
  async (id: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const { userLogin } = getState() as UserSliceRootState;
      if (!hasSession(userLogin.userInfo)) throw new Error('Not authenticated');
      await axios.delete(`/api/users/${id}`);
      return undefined;
    } catch (error) {
      const message = getErrorMessage(error);
      if (message === 'Not authorized, token failed') {
        dispatch(logout());
      }
      return rejectWithValue(message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'userUpdate/update',
  async (user: User, { getState, dispatch, rejectWithValue }) => {
    try {
      const { userLogin } = getState() as UserSliceRootState;
      if (!hasSession(userLogin.userInfo)) throw new Error('Not authenticated');
      const { data } = await axios.put<User>(`/api/users/${user._id}`, user);
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      if (message === 'Not authorized, token failed') {
        dispatch(logout());
      }
      return rejectWithValue(message);
    }
  }
);

const userLoginSlice = createSlice({
  name: 'userLogin',
  initialState: { sessionResolved: false } as AuthState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.sessionResolved = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadUserFromSession.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.sessionResolved = true;
      })
      .addCase(loadUserFromSession.rejected, (state, action) => {
        state.sessionResolved = true;
        if (action.payload !== 'API unreachable') {
          state.userInfo = undefined;
        }
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.userInfo = action.payload;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.sessionResolved = true;
      })
      .addCase(logout.pending, (state) => {
        state.userInfo = undefined;
        state.loading = false;
        state.error = undefined;
      });
  }
});

const userRegisterSlice = createSlice({
  name: 'userRegister',
  initialState: {} as AuthState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.pending, () => ({}));
  }
});

const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState: { user: emptyUser() } as UserDetailsState,
  reducers: {
    userDetailsReset: () => ({ user: emptyUser() })
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserDetails.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = undefined;
        state.user = action.payload;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.pending, () => ({ user: emptyUser() }));
  }
});

const userUpdateProfileSlice = createSlice({
  name: 'userUpdateProfile',
  initialState: {} as AuthState,
  reducers: {
    userUpdateProfileReset: () => ({})
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.userInfo = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

const userListSlice = createSlice({
  name: 'userList',
  initialState: { users: [] } as UserListState,
  reducers: {
    userListReset: () => ({ users: [] })
  },
  extraReducers: (builder) => {
    builder
      .addCase(listUsers.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(listUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = undefined;
        state.users = action.payload;
      })
      .addCase(listUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated) return;
        const index = state.users.findIndex((u) => u._id === updated._id);
        if (index !== -1) {
          state.users[index] = updated;
        }
      })
      .addCase(logout.pending, () => ({ users: [] }));
  }
});

const userDeleteSlice = createSlice({
  name: 'userDelete',
  initialState: {} as AuthState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

const userUpdateSlice = createSlice({
  name: 'userUpdate',
  initialState: {} as AuthState,
  reducers: {
    userUpdateReset: () => ({})
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { userDetailsReset } = userDetailsSlice.actions;
export const { userUpdateProfileReset } = userUpdateProfileSlice.actions;
export const { userListReset } = userListSlice.actions;
export const { userUpdateReset } = userUpdateSlice.actions;

export const userLoginReducer = userLoginSlice.reducer;
export const userRegisterReducer = userRegisterSlice.reducer;
export const userDetailsReducer = userDetailsSlice.reducer;
export const userUpdateProfileReducer = userUpdateProfileSlice.reducer;
export const userListReducer = userListSlice.reducer;
export const userDeleteReducer = userDeleteSlice.reducer;
export const userUpdateReducer = userUpdateSlice.reducer;
