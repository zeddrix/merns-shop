import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { buildAuthSearch, parseAuthModalSearch, stripAuthSearch } from '../utils/authModalUrl';

export {
  buildLoginRedirectUrl,
  buildRegisterRedirectUrl,
  getRedirectPath,
  isRegisterWelcomeState,
  normalizeRedirectPath
} from '../utils/authRedirect';

export const useRequireAuth = (): boolean => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);
  const promptedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (userInfo) {
      promptedPathRef.current = null;
      return;
    }

    const parsed = parseAuthModalSearch(location.search);
    if (parsed.mode) {
      return;
    }

    const cleanSearch = stripAuthSearch(location.search);
    const gatePath = `${location.pathname}${cleanSearch}`;
    if (promptedPathRef.current === gatePath) {
      return;
    }

    promptedPathRef.current = gatePath;
    navigate({
      pathname: location.pathname,
      search: buildAuthSearch('login', gatePath, cleanSearch)
    });
  }, [location.pathname, location.search, navigate, userInfo]);

  return Boolean(userInfo);
};
