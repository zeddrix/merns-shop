import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod } from '../features/cartSlice';

const PaymentScreen = () => {
  const cart = useAppSelector((state) => state.cart);
  const { shippingAddress } = cart;
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [navigate, shippingAddress.address]);

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1 data-testid="payment-heading">Payment Method</h1>
      <Form onSubmit={submitHandler} data-testid="payment-form">
        <Form.Group>
          <Form.Label as="legend">Select Method</Form.Label>
          <Col>
            <Form.Check
              type="radio"
              label="PayPal or Credit Card"
              id="PayPal"
              name="paymentMethod"
              value="PayPal"
              checked={paymentMethod === 'PayPal'}
              data-testid="payment-method-paypal"
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </Col>
        </Form.Group>

        <Button type="submit" variant="primary" data-testid="payment-submit">
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
};

export default PaymentScreen;
