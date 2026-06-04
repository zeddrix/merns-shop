import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { buildLoginRedirectUrl, buildRegisterRedirectUrl } from '../utils/authRedirect';

interface CheckoutStepsProps {
  step1?: boolean;
  step2?: boolean;
  step3?: boolean;
  step4?: boolean;
  redirectPath?: string;
}

const CheckoutSteps = ({
  step1,
  step2,
  step3,
  step4,
  redirectPath = '/shipping'
}: CheckoutStepsProps) => {
  const loginUrl = buildLoginRedirectUrl(redirectPath);
  const registerUrl = buildRegisterRedirectUrl(redirectPath);

  return (
    <Nav className="justify-content-center mb-4" data-testid="checkout-steps">
      <Nav.Item>
        {step1 ? (
          <>
            <Nav.Link as={Link} to={loginUrl} data-testid="checkout-step-signin">
              Sign In
            </Nav.Link>
            <Nav.Link as={Link} to={registerUrl} data-testid="checkout-step-sign-up">
              Sign Up
            </Nav.Link>
          </>
        ) : (
          <Nav.Link disabled>Sign In</Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step2 ? (
          <Nav.Link as={Link} to="/shipping" data-testid="checkout-step-shipping">
            Shipping
          </Nav.Link>
        ) : (
          <Nav.Link disabled>Shipping</Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step3 ? (
          <Nav.Link as={Link} to="/payment" data-testid="checkout-step-payment">
            Payment
          </Nav.Link>
        ) : (
          <Nav.Link disabled>Payment</Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step4 ? (
          <Nav.Link as={Link} to="/placeorder" data-testid="checkout-step-place-order">
            Place Order
          </Nav.Link>
        ) : (
          <Nav.Link disabled>Place Order</Nav.Link>
        )}
      </Nav.Item>
    </Nav>
  );
};

export default CheckoutSteps;
