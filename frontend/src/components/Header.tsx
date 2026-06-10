import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { logout } from '../features/userSlice';
import { clearStaleItemsNotice } from '../features/cartSlice';
import {
  fetchNotifications,
  setLastPushTitle,
  addNotificationFromPush
} from '../features/pushSlice';
import SearchBox from './SearchBox';
import SearchOverlay from './SearchOverlay';
import CartPopover from './CartPopover';
import NotificationPopover from './NotificationPopover';
import PwaInstallButton from './PwaInstallButton';
import { DISPLAY_BRAND_NAME } from '../constants/brand';
import { useIsDesktop } from '../hooks/useIsDesktop';
import AppIcon from './icons/AppIcon';
import { faBell, faSearch, faShoppingBag, faUser } from './icons';
import { buildAuthSearch, stripAuthSearch } from '../utils/authModalUrl';

const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const [cartOpen, setCartOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartWrapRef = useRef<HTMLDivElement>(null);
  const notificationWrapRef = useRef<HTMLDivElement>(null);

  const userInfo = useAppSelector((state) => state.userLogin.userInfo);
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const staleItemsPruned = useAppSelector((state) => state.cart.staleItemsPruned);
  const { notifications } = useAppSelector((state) => state.push);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentPath = `${location.pathname}${stripAuthSearch(location.search)}`;

  const logoutHandler = () => {
    dispatch(logout());
  };

  const openLoginHandler = () => {
    navigate({
      pathname: location.pathname,
      search: buildAuthSearch('login', currentPath, stripAuthSearch(location.search))
    });
  };

  const openRegisterHandler = () => {
    navigate({
      pathname: location.pathname,
      search: buildAuthSearch('register', currentPath, stripAuthSearch(location.search))
    });
  };

  useEffect(() => {
    if (!userInfo) {
      return;
    }
    void dispatch(fetchNotifications());
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (!userInfo || !('serviceWorker' in navigator)) {
      return;
    }

    const handler = (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        payload?: { title?: string; body?: string; url?: string; tag?: string };
      };
      if (data?.type !== 'push-received' || !data.payload?.title) {
        return;
      }

      dispatch(setLastPushTitle(data.payload.title));
      dispatch(
        addNotificationFromPush({
          _id: `push-${Date.now()}`,
          type: data.payload.tag === 'order_delivered' ? 'order_delivered' : 'order_paid',
          title: data.payload.title,
          body: data.payload.body ?? '',
          url: data.payload.url ?? '/profile',
          read: false,
          createdAt: new Date().toISOString()
        })
      );
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (!cartOpen) return;
    const handlePointerDown = (event: Event) => {
      if (!cartWrapRef.current?.contains(event.target as Node)) {
        setCartOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [cartOpen]);

  useEffect(() => {
    if (!notificationOpen) return;
    const handlePointerDown = (event: Event) => {
      if (!notificationWrapRef.current?.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [notificationOpen]);

  const cartClickHandler = (event: MouseEvent) => {
    setNotificationOpen(false);
    if (isDesktop) {
      event.preventDefault();
      setCartOpen((open) => !open);
      return;
    }
    navigate('/cart');
  };

  const notificationClickHandler = () => {
    setCartOpen(false);
    void dispatch(fetchNotifications());
    setNotificationOpen((open) => !open);
  };

  return (
    <header className="site-header">
      {staleItemsPruned && (
        <div className="cart-stale-notice" data-testid="cart-stale-pruned-notice">
          <span>Some saved cart items were removed because they are no longer available.</span>
          <button
            type="button"
            className="cart-stale-notice-dismiss"
            data-testid="cart-stale-pruned-dismiss"
            onClick={() => dispatch(clearStaleItemsNotice())}
          >
            Dismiss
          </button>
        </div>
      )}
      <Navbar className="site-navbar" variant="dark" expand="lg" collapseOnSelect>
        <Container className="site-navbar-container">
          <Navbar.Brand as={Link} to="/" className="site-brand" data-testid="site-brand">
            {DISPLAY_BRAND_NAME}
          </Navbar.Brand>
          <div className="site-header-tools ms-auto d-flex align-items-center gap-2">
            <div className="site-search-desktop d-none d-lg-flex align-items-center">
              <button
                type="button"
                className="nav-search-open touch-target"
                data-testid="nav-search-open"
                aria-label="Open search"
                onClick={() => setSearchOpen(true)}
              >
                <AppIcon icon={faSearch} />
              </button>
            </div>
            <PwaInstallButton />
            <div className="cart-nav-wrap" ref={cartWrapRef}>
              <Nav.Link
                as={Link}
                to="/cart"
                className="cart-nav-link"
                data-testid="nav-cart"
                onClick={cartClickHandler}
              >
                <AppIcon icon={faShoppingBag} />
                <span className="cart-nav-label d-none d-lg-inline">Cart</span>
                {cartCount > 0 && (
                  <span className="cart-badge" data-testid="nav-cart-count">
                    {cartCount}
                  </span>
                )}
              </Nav.Link>
              {isDesktop && cartOpen && <CartPopover onClose={() => setCartOpen(false)} />}
            </div>
            {userInfo && (
              <div className="notification-nav-wrap" ref={notificationWrapRef}>
                <button
                  type="button"
                  className="notification-nav-link touch-target"
                  data-testid="notification-bell"
                  aria-label="Notifications"
                  onClick={notificationClickHandler}
                >
                  <AppIcon icon={faBell} />
                  {unreadCount > 0 && (
                    <Badge
                      bg="danger"
                      className="notification-nav-badge"
                      data-testid="notification-unread-count"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </button>
                {notificationOpen && (
                  <NotificationPopover onClose={() => setNotificationOpen(false)} />
                )}
              </div>
            )}
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              data-testid="navbar-toggle"
              className="d-lg-none"
            />
          </div>
          <Navbar.Collapse id="basic-navbar-nav" className="site-navbar-collapse">
            <div className="site-search-mobile d-lg-none w-100">
              <SearchBox />
            </div>
            <Nav className="site-nav-categories">
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
            <Nav className="site-nav-actions ms-lg-auto">
              <Nav.Link as={Link} to="/about" data-testid="nav-about">
                About
              </Nav.Link>
              {userInfo ? (
                <NavDropdown
                  title={userInfo.name}
                  id="username"
                  align="end"
                  menuVariant="dark"
                  className="header-nav-dropdown"
                  data-testid="nav-user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/profile" data-testid="nav-profile">
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={logoutHandler} data-testid="nav-logout">
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Nav.Link
                    as="button"
                    type="button"
                    className="nav-auth-button"
                    data-testid="nav-login"
                    onClick={openLoginHandler}
                  >
                    <AppIcon icon={faUser} />
                    <span className="d-none d-md-inline ms-1">Sign In</span>
                  </Nav.Link>
                  <Nav.Link
                    as="button"
                    type="button"
                    className="nav-auth-button"
                    data-testid="nav-sign-up"
                    onClick={openRegisterHandler}
                  >
                    Sign Up
                  </Nav.Link>
                </>
              )}
              {userInfo?.isAdmin && (
                <NavDropdown
                  title="Admin"
                  id="adminmenu"
                  align="end"
                  menuVariant="dark"
                  className="header-nav-dropdown"
                >
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
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

export default Header;
