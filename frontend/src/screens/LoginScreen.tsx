import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { login } from '../features/userSlice';
import { buildRegisterRedirectUrl, getRedirectPath } from '../utils/authRedirect';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userLogin = useAppSelector((state) => state.userLogin);
  const { loading, error, userInfo } = userLogin;

  const redirect = getRedirectPath(location.search);
  const hasCheckoutRedirect = redirect !== '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const registerUrl = redirect === '/' ? '/register' : buildRegisterRedirectUrl(redirect);

  return (
    <FormContainer>
      <h1 data-testid="login-heading">Sign In</h1>
      {error && <Message variant="danger">{error}</Message>}
      {loading && <Loader />}
      <Form onSubmit={submitHandler} data-testid="login-form">
        <Form.Group controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            data-testid="login-email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            data-testid="login-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary" data-testid="login-submit">
          Sign In
        </Button>
      </Form>

      <Row className="py-3">
        <Col>
          New Customer?{' '}
          <Link to={registerUrl} data-testid="login-register-link">
            Sign Up
          </Link>
        </Col>
      </Row>
      {hasCheckoutRedirect && (
        <Row className="pb-3">
          <Col>
            <span data-testid="login-checkout-sign-up-hint">
              Continue checkout after you sign in or{' '}
              <Link to={registerUrl} data-testid="login-checkout-sign-up-link">
                sign up
              </Link>
              .
            </span>
          </Col>
        </Row>
      )}
    </FormContainer>
  );
};

export default LoginScreen;
