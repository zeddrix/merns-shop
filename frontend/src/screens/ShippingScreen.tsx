import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { saveShippingAddress } from '../features/cartSlice';
import { useRequireAuth } from '../hooks/useRequireAuth';

const ShippingScreen = () => {
  const isAuthenticated = useRequireAuth();
  const cart = useAppSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress.address ?? '');
  const [city, setCity] = useState(shippingAddress.city ?? '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode ?? '');
  const [country, setCountry] = useState(shippingAddress.country ?? '');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    navigate('/payment');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <h1 data-testid="shipping-heading">Shipping</h1>
      <Form onSubmit={submitHandler} data-testid="shipping-form">
        <Form.Group controlId="address">
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter address"
            value={address}
            required
            data-testid="shipping-address"
            onChange={(e) => setAddress(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="city">
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter city"
            value={city}
            required
            data-testid="shipping-city"
            onChange={(e) => setCity(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="postalCode">
          <Form.Label>Postal Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter postal code"
            value={postalCode}
            required
            data-testid="shipping-postal-code"
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="country">
          <Form.Label>Country</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter country"
            value={country}
            required
            data-testid="shipping-country"
            onChange={(e) => setCountry(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" variant="primary" data-testid="shipping-submit">
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ShippingScreen;
