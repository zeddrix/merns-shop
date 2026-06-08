import { lazy, Suspense, type ReactNode } from 'react';
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
import OfflineBanner from './components/OfflineBanner';
import PwaInstallBanner from './components/PwaInstallBanner';
import PwaManager from './components/PwaManager';
import NotificationBell from './components/NotificationBell';
import PageTransition from './components/motion/PageTransition';
import Loader from './components/Loader';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import AuthLegacyRedirect from './components/AuthLegacyRedirect';
import AuthModalHost from './components/AuthModalHost';
import ScrollToTop from './components/ScrollToTop';
import AboutScreen from './screens/AboutScreen';
import NotFoundScreen from './screens/NotFoundScreen';

const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const CheckoutScreen = lazy(() => import('./screens/CheckoutScreen'));
const ShippingScreen = lazy(() => import('./screens/ShippingScreen'));
const PaymentScreen = lazy(() => import('./screens/PaymentScreen'));
const PlaceOrderScreen = lazy(() => import('./screens/PlaceOrderScreen'));
const OrderScreen = lazy(() => import('./screens/OrderScreen'));
const UserListScreen = lazy(() => import('./screens/UserListScreen'));
const UserEditScreen = lazy(() => import('./screens/UserEditScreen'));
const ProductListScreen = lazy(() => import('./screens/ProductListScreen'));
const ProductEditScreen = lazy(() => import('./screens/ProductEditScreen'));
const OrderListScreen = lazy(() => import('./screens/OrderListScreen'));

const lazyRoute = (element: ReactNode) => <Suspense fallback={<Loader />}>{element}</Suspense>;

const appRouteObjects: RouteObject[] = [
  { path: '/order/:id', element: lazyRoute(<OrderScreen />) },
  { path: '/checkout', element: lazyRoute(<CheckoutScreen />) },
  { path: '/shipping', element: lazyRoute(<ShippingScreen />) },
  { path: '/payment', element: lazyRoute(<PaymentScreen />) },
  { path: '/placeorder', element: lazyRoute(<PlaceOrderScreen />) },
  { path: '/login', element: <AuthLegacyRedirect mode="login" /> },
  { path: '/register', element: <AuthLegacyRedirect mode="register" /> },
  { path: '/profile', element: lazyRoute(<ProfileScreen />) },
  { path: '/about', element: <AboutScreen /> },
  { path: '/product/:id', element: <ProductScreen /> },
  { path: '/cart/:id?', element: <CartScreen /> },
  { path: '/admin/userlist', element: lazyRoute(<UserListScreen />) },
  { path: '/admin/user/:id/edit', element: lazyRoute(<UserEditScreen />) },
  { path: '/admin/productlist', element: lazyRoute(<ProductListScreen />) },
  { path: '/admin/productlist/:pageNumber', element: lazyRoute(<ProductListScreen />) },
  { path: '/admin/product/:id/edit', element: lazyRoute(<ProductEditScreen />) },
  { path: '/admin/orderlist', element: lazyRoute(<OrderListScreen />) },
  { path: '/search/:keyword', element: <HomeScreen /> },
  { path: '/page/:pageNumber', element: <HomeScreen /> },
  { path: '/search/:keyword/page/:pageNumber', element: <HomeScreen /> },
  { path: '/', element: <HomeScreen /> },
  { path: '*', element: <NotFoundScreen /> }
];

const AppRoutes = () => {
  useAuthBootstrap();
  useCartBootstrap();
  const location = useLocation();
  const routeElement = useRoutes(appRouteObjects);
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <PwaManager />
      <OfflineBanner />
      <PwaInstallBanner />
      <ScrollToTop />
      <Header />
      <NotificationBell />
      <main className="py-3">
        <Container>
          {routeElement ? (
            isAdminRoute ? (
              routeElement
            ) : (
              <PageTransition key={location.pathname} routeKey={location.pathname}>
                {routeElement}
              </PageTransition>
            )
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
