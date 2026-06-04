import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { buildLoginRedirectUrl } from '../utils/authRedirect';

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
      const redirectPath = `${location.pathname}${location.search}`;
      navigate(buildLoginRedirectUrl(redirectPath));
    }
  }, [location.pathname, location.search, navigate, userInfo]);

  return Boolean(userInfo);
};
