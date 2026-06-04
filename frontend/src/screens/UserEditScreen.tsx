import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import {
  getUserDetails,
  updateUser,
  userUpdateReset,
  userDetailsReset
} from '../features/userSlice';

const UserEditScreen = () => {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const dispatch = useAppDispatch();

  const userDetails = useAppSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;

  const userUpdate = useAppSelector((state) => state.userUpdate);
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = userUpdate;

  useEffect(() => {
    if (successUpdate) {
      dispatch(userUpdateReset());
      dispatch(userDetailsReset());
      navigate('/admin/userlist');
    } else if (userId && (!user.name || user._id !== userId)) {
      dispatch(getUserDetails(userId));
    } else {
      setName(user.name);
      setEmail(user.email);
      setIsAdmin(user.isAdmin);
    }
  }, [dispatch, navigate, userId, user, successUpdate]);

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    dispatch(updateUser({ _id: userId, name, email, isAdmin }));
  };

  return (
    <div data-testid="admin-user-edit">
      <Link to="/admin/userlist" className="btn btn-light my-3" data-testid="admin-user-edit-back">
        Go Back
      </Link>
      <FormContainer>
        <h1>Edit User</h1>
        {loadingUpdate && <Loader />}
        {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <Form onSubmit={submitHandler} data-testid="admin-user-edit-form">
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name}
                data-testid="admin-user-name"
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                data-testid="admin-user-email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="isadmin">
              <Form.Check
                type="checkbox"
                label="Is Admin"
                checked={isAdmin}
                data-testid="admin-user-is-admin"
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
            </Form.Group>

            <Button type="submit" variant="primary" data-testid="admin-user-submit">
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </div>
  );
};

export default UserEditScreen;
