import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listUsers, deleteUser } from '../features/userSlice';
import { useRequireAdmin } from '../hooks/useRequireAdmin';
import SeoPrivateMeta from '../components/SeoPrivateMeta';

const UserListScreen = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const userList = useAppSelector((state) => state.userList);
  const { loading, error, users } = userList;

  const isAdmin = useRequireAdmin();

  const userDelete = useAppSelector((state) => state.userDelete);
  const { success: successDelete, error: errorDelete } = userDelete;

  useEffect(() => {
    if (!isAdmin || location.pathname !== '/admin/userlist') {
      return;
    }
    dispatch(listUsers());
  }, [dispatch, isAdmin, location.pathname, successDelete]);

  if (!isAdmin) {
    return null;
  }

  const deleteHandler = (id: string) => {
    if (window.confirm('Are you sure')) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <div data-testid="admin-user-list">
      <SeoPrivateMeta canonicalPath="/admin/userlist" />
      <h1>Users</h1>
      {errorDelete && (
        <Message variant="danger" data-testid="admin-user-delete-error">
          {errorDelete}
        </Message>
      )}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ADMIN</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} data-testid={`admin-user-${user._id}`}>
                <td>{user._id}</td>
                <td data-testid={`admin-user-name-${user._id}`}>{user.name}</td>
                <td>
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                </td>
                <td>
                  {user.isAdmin ? (
                    <i className="fas fa-check" style={{ color: 'green' }}></i>
                  ) : (
                    <i className="fas fa-times" style={{ color: 'red' }}></i>
                  )}
                </td>
                <td>
                  <Link
                    to={`/admin/user/${user._id}/edit`}
                    className="btn btn-light btn-sm"
                    data-testid={`admin-user-edit-${user._id}`}
                  >
                    <i className="fas fa-edit"></i>
                  </Link>
                  <Button
                    variant="danger"
                    className="btn-sm"
                    data-testid={`admin-user-delete-${user._id}`}
                    onClick={() => deleteHandler(user._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default UserListScreen;
