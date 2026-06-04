import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import SeoPrivateMeta from '../components/SeoPrivateMeta';
import { register } from '../features/userSlice';
import { buildLoginRedirectUrl, getRedirectPath } from '../utils/authRedirect';

type ClientValidationError = 'mismatch' | 'too-short';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientError, setClientError] = useState<ClientValidationError | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userRegister = useAppSelector((state) => state.userRegister);
  const { loading, error, userInfo } = userRegister;

  const redirect = getRedirectPath(location.search);

  useEffect(() => {
    if (!userInfo) {
      return;
    }

    if (redirect === '/') {
      navigate('/', { replace: true, state: { registerWelcome: userInfo.name } });
      return;
    }

    navigate(redirect, { replace: true });
  }, [navigate, userInfo, redirect]);

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (password.length < 6) {
      setClientError('too-short');
      return;
    }

    if (password !== confirmPassword) {
      setClientError('mismatch');
      return;
    }

    dispatch(register({ name, email, password }));
  };

  return (
    <FormContainer>
      <SeoPrivateMeta canonicalPath="/register" />
      <h1 data-testid="register-heading">Sign Up</h1>
      {clientError === 'mismatch' && (
        <Message variant="danger" data-testid="register-password-mismatch">
          Passwords do not match
        </Message>
      )}
      {clientError === 'too-short' && (
        <Message variant="danger" data-testid="register-password-too-short">
          Password must be at least 6 characters
        </Message>
      )}
      {error && (
        <Message variant="danger" data-testid="register-error">
          {error}
        </Message>
      )}
      {loading && <Loader />}
      <Form onSubmit={submitHandler} data-testid="register-form">
        <Form.Group controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name"
            value={name}
            data-testid="register-name"
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            data-testid="register-email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            data-testid="register-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            data-testid="register-confirm-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary" data-testid="register-submit">
          Sign Up
        </Button>
      </Form>

      <Row className="py-3">
        <Col>
          Have an Account?{' '}
          <Link
            to={redirect === '/' ? '/login' : buildLoginRedirectUrl(redirect)}
            data-testid="register-login-link"
          >
            Login
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterScreen;
