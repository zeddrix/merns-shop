import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { getUserDetails, updateUserProfile } from '../features/userSlice';
import { listMyOrder } from '../features/orderSlice';
import { useRequireAuth } from '../hooks/useRequireAuth';

const ProfileScreen = () => {
  const isAuthenticated = useRequireAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  const userDetails = useAppSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;

  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  const userUpdateProfile = useAppSelector((state) => state.userUpdateProfile);
  const { success } = userUpdateProfile;

  const myOrder = useAppSelector((state) => state.myOrder);
  const { loading: loadingOrders, error: errorOrders, orders } = myOrder;

  useEffect(() => {
    if (!userInfo) {
      return;
    }

    if (!user._id) {
      dispatch(getUserDetails('profile'));
      dispatch(listMyOrder());
      return;
    }

    if (!success) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [dispatch, userInfo, user._id, user.name, user.email, success]);

  if (!isAuthenticated) {
    return null;
  }

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
    } else {
      dispatch(
        updateUserProfile({
          id: user._id,
          name,
          email,
          password
        })
      );
    }
  };

  return (
    <Row data-testid="profile-screen">
      <Col md={3}>
        <h2>User Profile</h2>
        {message && <Message variant="danger">{message}</Message>}
        {success && <Message variant="success">Profile Updated</Message>}
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <Form onSubmit={submitHandler} data-testid="profile-form">
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name}
                data-testid="profile-name"
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                data-testid="profile-email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                data-testid="profile-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                data-testid="profile-confirm-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>

            <Button type="submit" variant="primary" data-testid="profile-submit">
              Update
            </Button>
          </Form>
        )}
      </Col>
      <Col md={9}>
        <h2>My Orders</h2>
        {loadingOrders ? (
          <Loader />
        ) : errorOrders ? (
          <Message variant="danger">{errorOrders}</Message>
        ) : (
          <Table
            striped
            bordered
            hover
            responsive
            className="table-sm"
            data-testid="my-orders-table"
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} data-testid={`my-order-${order._id}`}>
                  <td>{order._id}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>{order.totalPrice}</td>
                  <td>
                    {order.isPaid && order.paidAt ? (
                      order.paidAt.substring(0, 10)
                    ) : (
                      <i className="fas fa-times" style={{ color: 'red' }}></i>
                    )}
                  </td>
                  <td data-testid={`my-order-delivered-${order._id}`}>
                    {order.isDelivered && order.deliveredAt ? (
                      order.deliveredAt.substring(0, 10)
                    ) : (
                      <i className="fas fa-times" style={{ color: 'red' }}></i>
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/order/${order._id}`}
                      className="btn btn-light btn-sm"
                      data-testid={`my-order-details-${order._id}`}
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

export default ProfileScreen;
