import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Button } from 'react-bootstrap';
import { registerFormSchema, type RegisterFormInput } from '@shared/validators/auth';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register } from '../features/userSlice';
import Message from './Message';
import Loader from './Loader';
import PasswordStrengthHints from './PasswordStrengthHints';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const requiredMark = (
  <span className="text-danger" aria-hidden="true">
    {' '}
    *
  </span>
);

const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const dispatch = useAppDispatch();
  const nameRef = useRef<HTMLInputElement | null>(null);
  const { loading, error } = useAppSelector((state) => state.userRegister);

  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors, touchedFields, dirtyFields }
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onTouched',
    criteriaMode: 'all',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const passwordValue = watch('password');

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const onSubmit = (data: RegisterFormInput) => {
    dispatch(register({ name: data.name, email: data.email, password: data.password }));
  };

  const passwordWeak =
    errors.password && touchedFields.password && dirtyFields.password ? errors.password : null;
  const passwordMismatch =
    errors.confirmPassword?.message === 'Passwords do not match' ? errors.confirmPassword : null;

  return (
    <>
      <h1 id="auth-modal-title" className="auth-modal-title" data-testid="register-heading">
        Sign Up
      </h1>
      {passwordMismatch && (
        <Message variant="danger" data-testid="register-password-mismatch">
          {passwordMismatch.message}
        </Message>
      )}
      {passwordWeak && (
        <Message variant="danger" data-testid="register-password-weak">
          {passwordWeak.message}
        </Message>
      )}
      {error && (
        <Message variant="danger" data-testid="register-error">
          {error}
        </Message>
      )}
      {loading && <Loader />}
      <Form
        onSubmit={handleSubmit(onSubmit)}
        data-testid="register-form"
        className="auth-modal-form"
        noValidate
      >
        <Form.Group controlId="register-name" className="auth-modal-field">
          <Form.Label>
            Name
            {requiredMark}
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name"
            data-testid="register-name"
            isInvalid={Boolean(errors.name)}
            {...registerField('name')}
            ref={(element) => {
              registerField('name').ref(element);
              nameRef.current = element;
            }}
          />
          {errors.name && (
            <Form.Control.Feedback type="invalid" data-testid="register-name-error">
              {errors.name.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group controlId="register-email" className="auth-modal-field">
          <Form.Label>
            Email Address
            {requiredMark}
          </Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            data-testid="register-email"
            isInvalid={Boolean(errors.email)}
            {...registerField('email')}
          />
          {errors.email && (
            <Form.Control.Feedback type="invalid" data-testid="register-email-error">
              {errors.email.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group controlId="register-password" className="auth-modal-field">
          <Form.Label>
            Password
            {requiredMark}
          </Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            data-testid="register-password"
            isInvalid={Boolean(errors.password)}
            {...registerField('password')}
          />
          <PasswordStrengthHints password={passwordValue} />
          {errors.password && !passwordWeak && (
            <Form.Control.Feedback type="invalid" data-testid="register-password-error">
              {errors.password.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group controlId="register-confirm-password" className="auth-modal-field">
          <Form.Label>
            Confirm Password
            {requiredMark}
          </Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            data-testid="register-confirm-password"
            isInvalid={Boolean(errors.confirmPassword)}
            {...registerField('confirmPassword')}
          />
          {errors.confirmPassword && !passwordMismatch && (
            <Form.Control.Feedback type="invalid" data-testid="register-confirm-password-error">
              {errors.confirmPassword.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          className="auth-modal-submit touch-target"
          data-testid="register-submit"
          disabled={loading}
        >
          Sign Up
        </Button>
      </Form>

      <p className="auth-modal-footer-text">
        Have an Account?{' '}
        <button
          type="button"
          className="auth-modal-link"
          data-testid="register-login-link"
          onClick={onSwitchToLogin}
        >
          Login
        </button>
      </p>
    </>
  );
};

export default RegisterForm;
