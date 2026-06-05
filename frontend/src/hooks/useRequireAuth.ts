import { useEffect } from 'react';
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

  useEffect(() => {
    if (!userInfo) {
      const parsed = parseAuthModalSearch(location.search);
      if (parsed.mode) {
        return;
      }
      const cleanSearch = stripAuthSearch(location.search);
      const redirectPath = `${location.pathname}${cleanSearch}`;
      navigate({
        pathname: location.pathname,
        search: buildAuthSearch('login', redirectPath, cleanSearch)
      });
    }
  }, [location.pathname, location.search, navigate, userInfo]);

  return Boolean(userInfo);
};
