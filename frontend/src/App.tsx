import {
  BrowserRouter as Router,
  useLocation,
  useRoutes,
  type RouteObject
} from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAuthBootstrap } from './features/authBootstrap';
import { useCartBootstrap } from './features/cartBootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import PageTransition from './components/motion/PageTransition';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import AuthLegacyRedirect from './components/AuthLegacyRedirect';
import AuthModalHost from './components/AuthModalHost';
import ProfileScreen from './screens/ProfileScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';

const appRouteObjects: RouteObject[] = [
  { path: '/order/:id', element: <OrderScreen /> },
  { path: '/shipping', element: <ShippingScreen /> },
  { path: '/payment', element: <PaymentScreen /> },
  { path: '/placeorder', element: <PlaceOrderScreen /> },
  { path: '/login', element: <AuthLegacyRedirect mode="login" /> },
  { path: '/register', element: <AuthLegacyRedirect mode="register" /> },
  { path: '/profile', element: <ProfileScreen /> },
  { path: '/product/:id', element: <ProductScreen /> },
  { path: '/cart/:id?', element: <CartScreen /> },
  { path: '/admin/userlist', element: <UserListScreen /> },
  { path: '/admin/user/:id/edit', element: <UserEditScreen /> },
  { path: '/admin/productlist', element: <ProductListScreen /> },
  { path: '/admin/productlist/:pageNumber', element: <ProductListScreen /> },
  { path: '/admin/product/:id/edit', element: <ProductEditScreen /> },
  { path: '/admin/orderlist', element: <OrderListScreen /> },
  { path: '/search/:keyword', element: <HomeScreen /> },
  { path: '/page/:pageNumber', element: <HomeScreen /> },
  { path: '/search/:keyword/page/:pageNumber', element: <HomeScreen /> },
  { path: '/', element: <HomeScreen /> }
];

const AppRoutes = () => {
  useAuthBootstrap();
  useCartBootstrap();
  const location = useLocation();
  const routeElement = useRoutes(appRouteObjects);

  return (
    <>
      <Header />
      <main className="py-3">
        <Container>
          {routeElement ? (
            <PageTransition key={location.pathname} routeKey={location.pathname}>
              {routeElement}
            </PageTransition>
          ) : null}
        </Container>
      </main>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
      <AuthModalHost />
    </Router>
  );
};

export default App;
