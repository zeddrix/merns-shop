import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listOrders } from '../features/orderSlice';

const OrderListScreen = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const orderList = useAppSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  useEffect(() => {
    if (userInfo?.isAdmin) {
      dispatch(listOrders());
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate, userInfo]);

  return (
    <div data-testid="admin-order-list">
      <h1>Orders</h1>
      {loading ? (
        <Loader />
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
