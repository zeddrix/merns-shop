import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { buildAuthSearch, parseAuthModalSearch, stripAuthSearch } from '../utils/authModalUrl';

/** Redirects guests to login and non-admins to home. Returns true only for admin users. */
export const useRequireAdmin = (): boolean => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);
  const sessionResolved = useAppSelector((state) => state.userLogin.sessionResolved);
  const promptedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionResolved) {
      return;
    }

    if (!userInfo) {
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
      return;
    }

    promptedPathRef.current = null;

    if (!userInfo.isAdmin) {
      navigate('/');
    }
  }, [location.pathname, location.search, navigate, sessionResolved, userInfo]);

  return Boolean(sessionResolved && userInfo?.isAdmin);
};
