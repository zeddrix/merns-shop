import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loader from './Loader';
import { getRedirectPath } from '../utils/authRedirect';
import { buildAuthUrl } from '../utils/authModalUrl';
import type { AuthModalMode } from '../utils/authModalUrl';

interface AuthLegacyRedirectProps {
  mode: AuthModalMode;
}

const AuthLegacyRedirect = ({ mode }: AuthLegacyRedirectProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = getRedirectPath(location.search);
    navigate(buildAuthUrl('/', mode, redirect === '/' ? undefined : redirect), { replace: true });
  }, [location.search, mode, navigate]);

  return <Loader />;
};

export default AuthLegacyRedirect;
