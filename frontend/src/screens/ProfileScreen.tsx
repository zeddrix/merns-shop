import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';
import { profileFormSchema, type ProfileFormInput } from '@shared/validators/auth';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import ApiUnreachablePanel from '../components/ApiUnreachablePanel';
import Loader from '../components/Loader';
import PasswordStrengthHints from '../components/PasswordStrengthHints';
import { isApiUnreachableMessage } from '../utils/getErrorMessage';
import { getUserDetails, updateUserProfile } from '../features/userSlice';
import { listMyOrder } from '../features/orderSlice';
import { useRequireAuth } from '../hooks/useRequireAuth';
import AuthRequiredGate from '../components/AuthRequiredGate';
import SeoPrivateMeta from '../components/SeoPrivateMeta';
import OrderTableStatusCell from '../components/OrderTableStatusCell';
import PushNotificationSettings from '../components/PushNotificationSettings';

const ProfileScreen = () => {
  const isAuthenticated = useRequireAuth();
  const dispatch = useAppDispatch();

  const userDetails = useAppSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;

  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  const userUpdateProfile = useAppSelector((state) => state.userUpdateProfile);
  const { success } = userUpdateProfile;

  const myOrder = useAppSelector((state) => state.myOrder);
  const { loading: loadingOrders, error: errorOrders, orders } = myOrder;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const passwordValue = watch('password');

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
      reset({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: ''
      });
    }
  }, [dispatch, userInfo, user._id, user.name, user.email, success, reset]);

  if (!isAuthenticated) {
    return (
      <>
        <SeoPrivateMeta canonicalPath="/profile" />
        <AuthRequiredGate variant="profile" />
      </>
    );
  }

  const onSubmit = (data: ProfileFormInput) => {
    dispatch(
      updateUserProfile({
        id: user._id,
        name: data.name,
        email: data.email,
        password: data.password
      })
    );
  };

  const profileApiUnreachable = Boolean(error && isApiUnreachableMessage(error));
  const ordersApiUnreachable = Boolean(errorOrders && isApiUnreachableMessage(errorOrders));
  const showSharedApiUnreachable = profileApiUnreachable || ordersApiUnreachable;

  const retryProfileData = () => {
    if (profileApiUnreachable) {
      dispatch(getUserDetails('profile'));
    }
    if (ordersApiUnreachable) {
      dispatch(listMyOrder());
    }
  };

  const passwordMismatch =
    errors.confirmPassword?.message === 'Passwords do not match' ? errors.confirmPassword : null;

  return (
    <>
      <SeoPrivateMeta canonicalPath="/profile" />
      <Row data-testid="profile-screen">
        {showSharedApiUnreachable && (
          <Col xs={12} className="mb-3">
            <ApiUnreachablePanel data-testid="profile-api-unreachable" onRetry={retryProfileData} />
          </Col>
        )}
        <Col xs={12} md={3} className="mb-3 mb-md-0">
          <h2>User Profile</h2>
          {passwordMismatch && (
            <Message variant="danger" data-testid="alert-message">
              {passwordMismatch.message}
            </Message>
          )}
          {success && <Message variant="success">Profile Updated</Message>}
          {loading ? (
            <Loader />
          ) : profileApiUnreachable ? null : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <Form onSubmit={handleSubmit(onSubmit)} data-testid="profile-form" noValidate>
              <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  data-testid="profile-name"
                  isInvalid={Boolean(errors.name)}
                  {...register('name')}
                />
                {errors.name && (
                  <Form.Control.Feedback type="invalid">
                    {errors.name.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Form.Group controlId="email">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  data-testid="profile-email"
                  isInvalid={Boolean(errors.email)}
                  {...register('email')}
                />
                {errors.email && (
                  <Form.Control.Feedback type="invalid">
                    {errors.email.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  data-testid="profile-password"
                  isInvalid={Boolean(errors.password)}
                  {...register('password')}
                />
                <PasswordStrengthHints password={passwordValue} />
                {errors.password && !passwordMismatch && (
                  <Form.Control.Feedback type="invalid">
                    {errors.password.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Form.Group controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm password"
                  data-testid="profile-confirm-password"
                  isInvalid={Boolean(errors.confirmPassword)}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && !passwordMismatch && (
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>

              <Button type="submit" variant="primary" data-testid="profile-submit">
                Update
              </Button>
            </Form>
          )}
          <PushNotificationSettings />
        </Col>
        <Col xs={12} md={9}>
          <h2>My Orders</h2>
          {loadingOrders ? (
            <Loader />
          ) : ordersApiUnreachable ? null : errorOrders ? (
            <Message variant="danger">{errorOrders}</Message>
          ) : (
            <>
              <div className="d-md-none" data-testid="my-orders-cards">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="profile-order-card"
                    data-testid={`profile-order-card-${order._id}`}
                  >
                    <div className="profile-order-card__row">
                      <span className="profile-order-card__label">Order</span>
                      <span>{order._id}</span>
                    </div>
                    <div className="profile-order-card__row">
                      <span className="profile-order-card__label">Date</span>
                      <span>{order.createdAt.substring(0, 10)}</span>
                    </div>
                    <div className="profile-order-card__row">
                      <span className="profile-order-card__label">Total</span>
                      <span>${order.totalPrice}</span>
                    </div>
                    <div className="profile-order-card__row">
                      <span className="profile-order-card__label">Paid</span>
                      <span>
                        <OrderTableStatusCell
                          kind="paid"
                          isComplete={Boolean(order.isPaid && order.paidAt)}
                          dateValue={order.paidAt}
                        />
                      </span>
                    </div>
                    <div className="profile-order-card__row">
                      <span className="profile-order-card__label">Delivered</span>
                      <span data-testid={`profile-order-delivered-${order._id}`}>
                        <OrderTableStatusCell
                          kind="delivered"
                          isComplete={Boolean(order.isDelivered && order.deliveredAt)}
                          dateValue={order.deliveredAt}
                        />
                      </span>
                    </div>
                    <div className="profile-order-card__actions">
                      <Link
                        to={`/order/${order._id}`}
                        className="btn btn-light btn-sm"
                        data-testid={`profile-order-details-${order._id}`}
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <Table
                striped
                bordered
                hover
                responsive
                className="table-sm d-none d-md-table"
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
                        <OrderTableStatusCell
                          kind="paid"
                          isComplete={Boolean(order.isPaid && order.paidAt)}
                          dateValue={order.paidAt}
                        />
                      </td>
                      <td data-testid={`my-order-delivered-${order._id}`}>
                        <OrderTableStatusCell
                          kind="delivered"
                          isComplete={Boolean(order.isDelivered && order.deliveredAt)}
                          dateValue={order.deliveredAt}
                        />
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
            </>
          )}
        </Col>
      </Row>
    </>
  );
};

export default ProfileScreen;
