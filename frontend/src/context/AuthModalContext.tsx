import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { isRegisterWelcomeState } from '../utils/authRedirect';
import AuthModal from '../components/AuthModal';
import {
  buildAuthSearch,
  getAuthRedirectTarget,
  parseAuthModalSearch,
  stripAuthSearch,
  type AuthModalMode
} from '../utils/authModalUrl';

interface AuthModalContextValue {
  isOpen: boolean;
  mode: AuthModalMode;
  redirectPath: string;
  openLogin: (redirectPath?: string) => void;
  openRegister: (redirectPath?: string) => void;
  close: () => void;
  switchMode: (mode: AuthModalMode) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

const PROTECTED_PATH_PREFIXES = ['/profile', '/shipping', '/payment', '/placeorder', '/order'];

const isProtectedPath = (pathname: string): boolean => {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

export const useAuthModal = (): AuthModalContextValue => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
};

interface AuthModalProviderProps {
  children: ReactNode;
}

export const AuthModalProvider = ({ children }: AuthModalProviderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);
  const registerUserInfo = useAppSelector((state) => state.userRegister.userInfo);

  const wasAuthenticatedRef = useRef(Boolean(userInfo));
  const wasAuthenticatedBeforeRender = wasAuthenticatedRef.current;
  wasAuthenticatedRef.current = Boolean(userInfo);

  const [isOpen, setIsOpen] = useState(parseAuthModalSearch(location.search).mode !== null);
  const [mode, setMode] = useState<AuthModalMode>(
    parseAuthModalSearch(location.search).mode ?? 'login'
  );
  const [redirectPath, setRedirectPath] = useState(parseAuthModalSearch(location.search).redirect);

  useEffect(() => {
    const next = parseAuthModalSearch(location.search);
    if (!next.mode) {
      setIsOpen(false);
      return;
    }

    if (userInfo && wasAuthenticatedBeforeRender) {
      navigate(
        {
          pathname: location.pathname,
          search: stripAuthSearch(location.search)
        },
        { replace: true }
      );
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setMode(next.mode);
    setRedirectPath(next.redirect);
  }, [location.pathname, location.search, navigate, userInfo, wasAuthenticatedBeforeRender]);

  const openAuth = useCallback(
    (nextMode: AuthModalMode, nextRedirect?: string) => {
      const cleanSearch = stripAuthSearch(location.search);
      const targetRedirect =
        nextRedirect ?? getAuthRedirectTarget(location.pathname, location.search);
      setMode(nextMode);
      setRedirectPath(targetRedirect);
      setIsOpen(true);
      navigate({
        pathname: location.pathname,
        search: buildAuthSearch(nextMode, targetRedirect, cleanSearch)
      });
    },
    [location.pathname, location.search, navigate]
  );

  const close = useCallback(() => {
    setIsOpen(false);
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
    navigate(
      {
        pathname: location.pathname,
        search: cleanSearch
      },
      { replace: true }
    );
  }, [location.pathname, location.search, navigate, userInfo]);

  const switchMode = useCallback(
    (nextMode: AuthModalMode) => {
      openAuth(nextMode, redirectPath);
    },
    [openAuth, redirectPath]
  );

  const handleAuthSuccess = useCallback(
    (welcomeName?: string) => {
      const target = redirectPath !== '/' ? redirectPath : '/';
      const cleanSearch = stripAuthSearch(location.search);
      setIsOpen(false);

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
    [location.search, navigate, redirectPath]
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

  const value = useMemo(
    () => ({
      isOpen,
      mode,
      redirectPath,
      openLogin: (nextRedirect?: string) => openAuth('login', nextRedirect),
      openRegister: (nextRedirect?: string) => openAuth('register', nextRedirect),
      close,
      switchMode
    }),
    [close, isOpen, mode, openAuth, redirectPath, switchMode]
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        open={isOpen}
        mode={mode}
        redirectPath={redirectPath}
        onClose={close}
        onSwitchMode={switchMode}
      />
    </AuthModalContext.Provider>
  );
};

export { isRegisterWelcomeState };
