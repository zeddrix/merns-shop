import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import ApiUnreachablePanel from '../components/ApiUnreachablePanel';
import Loader from '../components/Loader';
import { isApiUnreachableMessage } from '../utils/getErrorMessage';
import { listOrders } from '../features/orderSlice';
import { useRequireAdmin } from '../hooks/useRequireAdmin';
import AuthRequiredGate from '../components/AuthRequiredGate';
import SeoPrivateMeta from '../components/SeoPrivateMeta';
import AppIcon from '../components/icons/AppIcon';
import { faTimes } from '../components/icons';

const OrderListScreen = () => {
  const dispatch = useAppDispatch();

  const orderList = useAppSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  const userInfo = useAppSelector((state) => state.userLogin.userInfo);
  const isAdmin = useRequireAdmin();

  useEffect(() => {
    if (isAdmin) {
      dispatch(listOrders());
    }
  }, [dispatch, isAdmin]);

  if (!isAdmin) {
    if (!userInfo) {
      return (
        <>
          <SeoPrivateMeta canonicalPath="/admin/orderlist" />
          <AuthRequiredGate variant="admin" />
        </>
      );
    }
    return null;
  }

  return (
    <div data-testid="admin-order-list">
      <SeoPrivateMeta canonicalPath="/admin/orderlist" />
      <h1>Orders</h1>
      {loading ? (
        <Loader />
      ) : error && isApiUnreachableMessage(error) ? (
        <ApiUnreachablePanel onRetry={() => dispatch(listOrders())} />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <div className="d-md-none" data-testid="admin-order-cards">
            {orders.map((order) => (
              <div
                key={order._id}
                className="admin-order-card"
                data-testid={`admin-order-card-${order._id}`}
              >
                <div className="admin-order-card__row">
                  <span className="admin-order-card__label">Order</span>
                  <span>{order._id}</span>
                </div>
                <div className="admin-order-card__row">
                  <span className="admin-order-card__label">User</span>
                  <span>{order.user?.name}</span>
                </div>
                <div className="admin-order-card__row">
                  <span className="admin-order-card__label">Date</span>
                  <span>{order.createdAt.substring(0, 10)}</span>
                </div>
                <div className="admin-order-card__row">
                  <span className="admin-order-card__label">Total</span>
                  <span>${order.totalPrice}</span>
                </div>
                <div className="admin-order-card__row">
                  <span className="admin-order-card__label">Paid</span>
                  <span>
                    {order.isPaid && order.paidAt ? (
                      order.paidAt.substring(0, 10)
                    ) : (
                      <AppIcon icon={faTimes} style={{ color: 'red' }} />
                    )}
                  </span>
                </div>
                <div className="admin-order-card__row">
                  <span className="admin-order-card__label">Delivered</span>
                  <span>
                    {order.isDelivered && order.deliveredAt ? (
                      order.deliveredAt.substring(0, 10)
                    ) : (
                      <AppIcon icon={faTimes} style={{ color: 'red' }} />
                    )}
                  </span>
                </div>
                <div className="admin-order-card__actions">
                  <Link
                    to={`/order/${order._id}`}
                    className="btn btn-light btn-sm"
                    data-testid={`admin-order-card-details-${order._id}`}
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Table striped bordered hover responsive className="table-sm d-none d-md-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>USER</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} data-testid={`admin-order-${order._id}`}>
                  <td>{order._id}</td>
                  <td>{order.user?.name}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>${order.totalPrice}</td>
                  <td>
                    {order.isPaid && order.paidAt ? (
                      order.paidAt.substring(0, 10)
                    ) : (
                      <AppIcon icon={faTimes} style={{ color: 'red' }} />
                    )}
                  </td>
                  <td>
                    {order.isDelivered && order.deliveredAt ? (
                      order.deliveredAt.substring(0, 10)
                    ) : (
                      <AppIcon icon={faTimes} style={{ color: 'red' }} />
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/order/${order._id}`}
                      className="btn btn-light btn-sm"
                      data-testid={`admin-order-details-${order._id}`}
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
    </div>
  );
};

export default OrderListScreen;
