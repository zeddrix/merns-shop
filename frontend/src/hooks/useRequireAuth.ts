import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export const useRequireAuth = (): boolean => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  useEffect(() => {
    if (!userInfo) {
      const redirectPath = `${location.pathname}${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [location.pathname, location.search, navigate, userInfo]);

  return Boolean(userInfo);
};

export const getRedirectPath = (search: string): string => {
  const redirect = new URLSearchParams(search).get('redirect');
  if (!redirect) {
    return '/';
  }

  return redirect.startsWith('/') ? redirect : `/${redirect}`;
};
