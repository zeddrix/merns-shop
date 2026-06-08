import { useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import type { AuthModalMode } from '../utils/authModalUrl';
import AppIcon from './icons/AppIcon';
import { faTimes } from './icons';

interface AuthModalProps {
  open: boolean;
  mode: AuthModalMode;
  redirectPath: string;
  onClose: () => void;
  onSwitchMode: (mode: AuthModalMode) => void;
}

const AuthModal = ({ open, mode, redirectPath, onClose, onSwitchMode }: AuthModalProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const showCheckoutHint = redirectPath !== '/';

  return (
    <div
      className="auth-modal"
      data-testid="auth-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <button
        type="button"
        className="auth-modal-backdrop"
        aria-label="Close sign in"
        data-testid="auth-modal-backdrop"
        onClick={onClose}
      />
      <div className="auth-modal-panel">
        <div className="auth-modal-header">
          <button
            type="button"
            className="auth-modal-close"
            data-testid="auth-modal-close"
            onClick={onClose}
            aria-label="Close sign in"
          >
            <AppIcon icon={faTimes} />
          </button>
        </div>
        <div className="auth-modal-body">
          {mode === 'login' ? (
            <LoginForm
              onSwitchToRegister={() => onSwitchMode('register')}
              showCheckoutHint={showCheckoutHint}
            />
          ) : (
            <RegisterForm onSwitchToLogin={() => onSwitchMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
