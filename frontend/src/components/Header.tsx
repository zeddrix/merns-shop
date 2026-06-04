import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { logout } from '../features/userSlice';
import SearchBox from './SearchBox';
import { DISPLAY_BRAND_NAME } from '../constants/brand';

const Header = () => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/" data-testid="site-brand">
            {DISPLAY_BRAND_NAME}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <SearchBox />
            <Nav className="me-auto">
              <Nav.Link
                as={Link}
                to="/?category=Electronics&subcategory=Phones"
                data-testid="nav-category-phones"
              >
                Phones
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/?category=Electronics&subcategory=Tablets"
                data-testid="nav-category-tablets"
              >
                Tablets
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/?category=Electronics&subcategory=TVs"
                data-testid="nav-category-tvs"
              >
                TVs
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/?category=Electronics&subcategory=Consoles"
                data-testid="nav-category-consoles"
              >
                Consoles
              </Nav.Link>
            </Nav>
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/cart" data-testid="nav-cart">
                <i className="fas fa-shopping-cart" /> Cart
              </Nav.Link>
              {userInfo ? (
                <NavDropdown title={userInfo.name} id="username">
                  <NavDropdown.Item as={Link} to="/profile" data-testid="nav-profile">
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={logoutHandler} data-testid="nav-logout">
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={Link} to="/login" data-testid="nav-login">
                  <i className="fas fa-user" />
                  Sign In
                </Nav.Link>
              )}
              {userInfo?.isAdmin && (
                <NavDropdown title="Admin" id="adminmenu">
                  <NavDropdown.Item as={Link} to="/admin/userlist" data-testid="nav-admin-users">
                    Users
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    as={Link}
                    to="/admin/productlist"
                    data-testid="nav-admin-products"
                  >
                    Products
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/admin/orderlist" data-testid="nav-admin-orders">
                    Orders
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
