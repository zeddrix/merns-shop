import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

/** Redirects guests to login and non-admins to home. Returns true only for admin users. */
export const useRequireAdmin = (): boolean => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  useEffect(() => {
    if (!userInfo) {
      const redirectPath = `${location.pathname}${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    if (!userInfo.isAdmin) {
      navigate('/');
    }
  }, [location.pathname, location.search, navigate, userInfo]);

  return Boolean(userInfo?.isAdmin);
};
