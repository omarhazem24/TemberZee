import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import ProductPage from './pages/ProductPage';
import AdminPromotionsPage from './pages/AdminPromotionsPage';
import AdminRevenuePage from './pages/AdminRevenuePage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import CreateProductPage from './pages/CreateProductPage';
import EditProductPage from './pages/EditProductPage';
import OrderListPage from './pages/OrderListPage';
import OrderPage from './pages/OrderPage';
import PaymentMethodPage from './pages/PaymentMethodPage';
import ShopPage from './pages/ShopPage';
import AdminOrderListPage from './pages/AdminOrderListPage';
import AdminCarouselPage from './pages/AdminCarouselPage';
import WishlistPage from './pages/WishlistPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ForgotPasswordOtpPage from './pages/ForgotPasswordOtpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const AppContent = () => {
  const location = useLocation();
  const hideHeader = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password' || location.pathname === '/forgot-password-otp' || location.pathname.startsWith('/reset-password');
  const hideFooter = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password' || location.pathname === '/forgot-password-otp' || location.pathname.startsWith('/reset-password');

  return (
    <div className="d-flex flex-column min-vh-100">
      <ToastContainer position="top-center" />
      {!hideHeader && <Header />}
      <main className='py-3 flex-grow-1'>
        <Container>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/shop' element={<ShopPage />} />
            <Route path='/product/:id' element={<ProductPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/signup' element={<SignupPage />} />
            <Route path='/forgot-password' element={<ForgotPasswordPage />} />
            <Route path='/forgot-password-otp' element={<ForgotPasswordOtpPage />} />
            <Route path='/reset-password/:resetToken' element={<ResetPasswordPage />} />
            <Route path='/cart' element={<CartPage />} />
            <Route path='/payment' element={<PaymentMethodPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/wishlist' element={<WishlistPage />} />
            <Route path='/orders' element={<OrderListPage />} />
            <Route path='/order/:id' element={<OrderPage />} />
            
            <Route path='/admin/promotions' element={<AdminPromotionsPage />} />
            <Route path='/admin/revenue' element={<AdminRevenuePage />} />
            <Route path='/admin/reviews' element={<AdminReviewsPage />} />
            <Route path='/admin/orders' element={<AdminOrderListPage />} />
            <Route path='/admin/carousel' element={<AdminCarouselPage />} />
            <Route path='/admin/product/create' element={<CreateProductPage />} />
            <Route path='/admin/product/:id/edit' element={<EditProductPage />} />
            
            <Route path='/privacy' element={<PrivacyPolicyPage />} />
            <Route path='/terms' element={<TermsPage />} />
            <Route path='/returns' element={<ReturnPolicyPage />} />
          </Routes>
        </Container>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
