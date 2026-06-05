import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  closeAuthModal,
  setAuthModalFromUrl,
  switchAuthMode
} from '../features/authModalSlice';
import AuthModal from './AuthModal';
import { parseAuthModalSearch, stripAuthSearch, type AuthModalMode } from '../utils/authModalUrl';

const PROTECTED_PATH_PREFIXES = ['/profile', '/shipping', '/payment', '/placeorder', '/order'];

const isProtectedPath = (pathname: string): boolean => {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

const AuthModalHost = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, mode, redirectPath } = useAppSelector((state) => state.authModal);
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);
  const registerUserInfo = useAppSelector((state) => state.userRegister.userInfo);

  const wasAuthenticatedRef = useRef(Boolean(userInfo));
  const wasAuthenticatedBeforeRender = wasAuthenticatedRef.current;
  wasAuthenticatedRef.current = Boolean(userInfo);

  const prevPathnameRef = useRef(location.pathname);

  useEffect(() => {
    const next = parseAuthModalSearch(location.search);
    if (!next.mode) {
      return;
    }

    if (userInfo && wasAuthenticatedBeforeRender) {
      dispatch(closeAuthModal());
      navigate(
        {
          pathname: location.pathname,
          search: stripAuthSearch(location.search)
        },
        { replace: true }
      );
      return;
    }

    dispatch(setAuthModalFromUrl({ mode: next.mode, redirect: next.redirect }));
  }, [
    dispatch,
    location.pathname,
    location.search,
    navigate,
    userInfo,
    wasAuthenticatedBeforeRender
  ]);

  useEffect(() => {
    if (prevPathnameRef.current === location.pathname) {
      return;
    }
    prevPathnameRef.current = location.pathname;
    if (isOpen) {
      dispatch(closeAuthModal());
    }
  }, [dispatch, isOpen, location.pathname]);

  const handleClose = useCallback(() => {
    dispatch(closeAuthModal());
    const hasAuthInUrl = parseAuthModalSearch(location.search).mode !== null;
    const cleanSearch = stripAuthSearch(location.search);

    if (!userInfo && isProtectedPath(location.pathname)) {
      navigate(
        {
          pathname: '/',
          search: cleanSearch
        },
        { replace: true }
      );
      return;
    }

    if (hasAuthInUrl) {
      navigate(
        {
          pathname: location.pathname,
          search: cleanSearch
        },
        { replace: true }
      );
    }
  }, [dispatch, location.pathname, location.search, navigate, userInfo]);

  const handleSwitchMode = useCallback(
    (nextMode: AuthModalMode) => {
      dispatch(switchAuthMode(nextMode));
    },
    [dispatch]
  );

  const handleAuthSuccess = useCallback(
    (welcomeName?: string) => {
      const target = redirectPath !== '/' ? redirectPath : '/';
      const cleanSearch = stripAuthSearch(location.search);
      dispatch(closeAuthModal());

      if (target === '/' && welcomeName) {
        navigate('/', { replace: true, state: { registerWelcome: welcomeName } });
        return;
      }

      navigate(
        {
          pathname: target,
          search: cleanSearch
        },
        { replace: true }
      );
    },
    [dispatch, location.search, navigate, redirectPath]
  );

  useEffect(() => {
    if (!userInfo || !isOpen || mode !== 'login') {
      return;
    }
    handleAuthSuccess();
  }, [handleAuthSuccess, isOpen, mode, userInfo]);

  useEffect(() => {
    if (!registerUserInfo || !isOpen || mode !== 'register') {
      return;
    }
    handleAuthSuccess(registerUserInfo.name);
  }, [handleAuthSuccess, isOpen, mode, registerUserInfo]);

  return (
    <AuthModal
      open={isOpen}
      mode={mode}
      redirectPath={redirectPath}
      onClose={handleClose}
      onSwitchMode={handleSwitchMode}
    />
  );
};

export default AuthModalHost;
