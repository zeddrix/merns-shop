import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useAppSelector } from '../store/hooks';
import { buildAuthSearch, parseAuthModalSearch, stripAuthSearch } from '../utils/authModalUrl';

export type AuthRequiredGateVariant = 'checkout' | 'profile' | 'order' | 'admin';

const GATE_COPY: Record<AuthRequiredGateVariant, string> = {
  checkout: 'Sign in to continue checkout',
  profile: 'Sign in to view your profile',
  order: 'Sign in to view your order',
  admin: 'Sign in to access admin'
};

interface AuthRequiredGateProps {
  variant: AuthRequiredGateVariant;
}

const AuthRequiredGate = ({ variant }: AuthRequiredGateProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);
  const sessionResolved = useAppSelector((state) => state.userLogin.sessionResolved);
  const authModalOpen = useAppSelector((state) => state.authModal.isOpen);

  if (!sessionResolved || userInfo || authModalOpen) {
    return null;
  }

  const cleanSearch = stripAuthSearch(location.search);
  const currentPath = `${location.pathname}${cleanSearch}`;

  const handleSignIn = () => {
    const parsed = parseAuthModalSearch(location.search);
    if (parsed.mode) {
      return;
    }

    navigate({
      pathname: location.pathname,
      search: buildAuthSearch('login', currentPath, cleanSearch)
    });
  };

  return (
    <div className="auth-gate" data-testid="auth-gate">
      <p className="auth-gate-message">{GATE_COPY[variant]}</p>
      <Button
        type="button"
        variant="primary"
        className="btn-cta"
        data-testid="auth-gate-sign-in"
        onClick={handleSignIn}
      >
        Sign In
      </Button>
    </div>
  );
};

export default AuthRequiredGate;
