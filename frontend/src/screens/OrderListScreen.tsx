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
import SeoPrivateMeta from '../components/SeoPrivateMeta';

const OrderListScreen = () => {
  const dispatch = useAppDispatch();

  const orderList = useAppSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  const isAdmin = useRequireAdmin();

  useEffect(() => {
    if (isAdmin) {
      dispatch(listOrders());
    }
  }, [dispatch, isAdmin]);

  if (!isAdmin) {
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
        <Table striped bordered hover responsive className="table-sm">
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
                    <i className="fas fa-times" style={{ color: 'red' }}></i>
                  )}
                </td>
                <td>
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
                    data-testid={`admin-order-details-${order._id}`}
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default OrderListScreen;
