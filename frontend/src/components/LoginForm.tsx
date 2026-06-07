import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Button } from 'react-bootstrap';
import { loginUserSchema, type LoginUserInput } from '@shared/validators/auth';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login } from '../features/userSlice';
import Message from './Message';
import Loader from './Loader';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  showCheckoutHint: boolean;
}

const LoginForm = ({ onSwitchToRegister, showCheckoutHint }: LoginFormProps) => {
  const dispatch = useAppDispatch();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const { loading, error } = useAppSelector((state) => state.userLogin);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginUserInput>({
    resolver: zodResolver(loginUserSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const onSubmit = (data: LoginUserInput) => {
    dispatch(login(data));
  };

  return (
    <>
      <h1 id="auth-modal-title" className="auth-modal-title" data-testid="login-heading">
        Sign In
      </h1>
      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader />}
      <Form
        onSubmit={handleSubmit(onSubmit)}
        data-testid="login-form"
        className="auth-modal-form"
        noValidate
      >
        <Form.Group controlId="login-email" className="auth-modal-field">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            data-testid="login-email"
            isInvalid={Boolean(errors.email)}
            {...register('email')}
            ref={(element) => {
              register('email').ref(element);
              emailRef.current = element;
            }}
          />
          {errors.email && (
            <Form.Control.Feedback type="invalid" data-testid="login-email-error">
              {errors.email.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group controlId="login-password" className="auth-modal-field">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            data-testid="login-password"
            isInvalid={Boolean(errors.password)}
            {...register('password')}
          />
          {errors.password && (
            <Form.Control.Feedback type="invalid" data-testid="login-password-error">
              {errors.password.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          className="auth-modal-submit touch-target"
          data-testid="login-submit"
          disabled={loading}
        >
          Sign In
        </Button>
      </Form>

      <p className="auth-modal-footer-text">
        New Customer?{' '}
        <button
          type="button"
          className="auth-modal-link"
          data-testid="login-register-link"
          onClick={onSwitchToRegister}
        >
          Sign Up
        </button>
      </p>
      {showCheckoutHint && (
        <p className="auth-modal-footer-text" data-testid="login-checkout-sign-up-hint">
          Continue checkout after you sign in or{' '}
          <button
            type="button"
            className="auth-modal-link"
            data-testid="login-checkout-sign-up-link"
            onClick={onSwitchToRegister}
          >
            sign up
          </button>
          .
        </p>
      )}
    </>
  );
};

export default LoginForm;
