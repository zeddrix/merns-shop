import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthModalMode } from '../utils/authModalUrl';

export interface AuthModalState {
  isOpen: boolean;
  mode: AuthModalMode;
  redirectPath: string;
}

const initialState: AuthModalState = {
  isOpen: false,
  mode: 'login',
  redirectPath: '/'
};

const authModalSlice = createSlice({
  name: 'authModal',
  initialState,
  reducers: {
    openLogin: (state, action: PayloadAction<string | undefined>) => {
      state.isOpen = true;
      state.mode = 'login';
      state.redirectPath = action.payload ?? '/';
    },
    openRegister: (state, action: PayloadAction<string | undefined>) => {
      state.isOpen = true;
      state.mode = 'register';
      state.redirectPath = action.payload ?? '/';
    },
    closeAuthModal: (state) => {
      state.isOpen = false;
    },
    switchAuthMode: (state, action: PayloadAction<AuthModalMode>) => {
      state.mode = action.payload;
      state.isOpen = true;
    },
    setAuthModalFromUrl: (
      state,
      action: PayloadAction<{ mode: AuthModalMode; redirect: string }>
    ) => {
      state.isOpen = true;
      state.mode = action.payload.mode;
      state.redirectPath = action.payload.redirect;
    }
  }
});

export const { openLogin, openRegister, closeAuthModal, switchAuthMode, setAuthModalFromUrl } =
  authModalSlice.actions;

export const authModalReducer = authModalSlice.reducer;
