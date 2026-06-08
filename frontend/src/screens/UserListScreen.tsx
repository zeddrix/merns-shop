import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import ApiUnreachablePanel from '../components/ApiUnreachablePanel';
import Loader from '../components/Loader';
import { isApiUnreachableMessage } from '../utils/getErrorMessage';
import { listUsers, deleteUser } from '../features/userSlice';
import { useRequireAdmin } from '../hooks/useRequireAdmin';
import AuthRequiredGate from '../components/AuthRequiredGate';
import SeoPrivateMeta from '../components/SeoPrivateMeta';
import AppIcon from '../components/icons/AppIcon';
import { faCheck, faEdit, faTimes, faTrash } from '../components/icons';

const UserListScreen = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const userList = useAppSelector((state) => state.userList);
  const { loading, error, users } = userList;

  const userInfo = useAppSelector((state) => state.userLogin.userInfo);
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
    if (!userInfo) {
      return (
        <>
          <SeoPrivateMeta canonicalPath="/admin/userlist" />
          <AuthRequiredGate variant="admin" />
        </>
      );
    }
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
      ) : error && isApiUnreachableMessage(error) ? (
        <ApiUnreachablePanel onRetry={() => dispatch(listUsers())} />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <div className="d-md-none" data-testid="admin-user-cards">
            {users.map((user) => (
              <div
                key={user._id}
                className="admin-user-card"
                data-testid={`admin-user-card-${user._id}`}
              >
                <div className="admin-user-card__row">
                  <span className="admin-user-card__label">Name</span>
                  <span data-testid={`admin-user-card-name-${user._id}`}>{user.name}</span>
                </div>
                <div className="admin-user-card__row">
                  <span className="admin-user-card__label">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="admin-user-card__row">
                  <span className="admin-user-card__label">Admin</span>
                  <span>{user.isAdmin ? 'Yes' : 'No'}</span>
                </div>
                <div className="admin-user-card__actions">
                  <Link
                    to={`/admin/user/${user._id}/edit`}
                    className="btn btn-light btn-sm"
                    data-testid={`admin-user-card-edit-${user._id}`}
                  >
                    <AppIcon icon={faEdit} /> Edit
                  </Link>
                  <Button
                    variant="danger"
                    className="btn-sm"
                    data-testid={`admin-user-delete-${user._id}`}
                    onClick={() => deleteHandler(user._id)}
                  >
                    <AppIcon icon={faTrash} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Table striped bordered hover responsive className="table-sm d-none d-md-table">
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
                      <AppIcon icon={faCheck} style={{ color: 'green' }} />
                    ) : (
                      <AppIcon icon={faTimes} style={{ color: 'red' }} />
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/admin/user/${user._id}/edit`}
                      className="btn btn-light btn-sm"
                      data-testid={`admin-user-edit-${user._id}`}
                    >
                      <AppIcon icon={faEdit} />
                    </Link>
                    <Button
                      variant="danger"
                      className="btn-sm"
                      data-testid={`admin-user-delete-${user._id}`}
                      onClick={() => deleteHandler(user._id)}
                    >
                      <AppIcon icon={faTrash} />
                    </Button>
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

export default UserListScreen;
