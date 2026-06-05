import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { buildAuthSearch, parseAuthModalSearch, stripAuthSearch } from '../utils/authModalUrl';

/** Redirects guests to login and non-admins to home. Returns true only for admin users. */
export const useRequireAdmin = (): boolean => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  useEffect(() => {
    if (!userInfo) {
      const parsed = parseAuthModalSearch(location.search);
      if (!parsed.mode) {
        const cleanSearch = stripAuthSearch(location.search);
        const redirectPath = `${location.pathname}${cleanSearch}`;
        navigate({
          pathname: location.pathname,
          search: buildAuthSearch('login', redirectPath, cleanSearch)
        });
      }
      return;
    }

    if (!userInfo.isAdmin) {
      navigate('/');
    }
  }, [location.pathname, location.search, navigate, userInfo]);

  return Boolean(userInfo?.isAdmin);
};
