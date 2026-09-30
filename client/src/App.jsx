import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import NotFound from './pages/public/NotFound';
import EsewaSuccess from './pages/public/EsewaSuccess';
import EsewaFailure from './pages/public/EsewaFailure';
import KhaltiSuccess from './pages/public/KhaltiSuccess';
import KhaltiSandbox from './pages/public/KhaltiSandbox';
import Categories from './pages/public/Categories';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import InfoPage from './pages/public/InfoPage';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Customer Protected Pages
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderHistory from './pages/customer/OrderHistory';
import OrderDetails from './pages/customer/OrderDetails';
import WishlistPage from './pages/customer/WishlistPage';

// Seller Protected Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerRegister from './pages/seller/SellerRegister';
import SellerProducts from './pages/seller/SellerProducts';
import SellerAddProduct from './pages/seller/SellerAddProduct';
import SellerOrders from './pages/seller/SellerOrders';

// Admin Protected Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSellers from './pages/admin/AdminSellers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';

function App() {
  return (
    <Routes>
      {/* Public Routes wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:slug" element={<ProductDetail />} />
        <Route path="categories" element={<Categories />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        {['shipping', 'returns', 'faq', 'privacy', 'terms', 'cookies'].map((path) => (
          <Route key={path} path={path} element={<InfoPage />} />
        ))}
        <Route path="payment/esewa/success" element={<EsewaSuccess />} />
        <Route path="payment/esewa/failure" element={<EsewaFailure />} />
        <Route path="payment/khalti/success" element={<KhaltiSuccess />} />
        <Route path="payment/khalti/sandbox" element={<KhaltiSandbox />} />

        {/* Customer Cart & Checkout Routes (Admin Restricted) */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER']} />}>
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="wishlist" element={<WishlistPage />} />
        </Route>

        {/* Order History & Tracking */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']} />}>
          <Route path="orders" element={<OrderHistory />} />
          <Route path="orders/:id" element={<OrderDetails />} />
        </Route>

        {/* Seller Registration (any authenticated user) */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER']} />}>
          <Route path="seller/register" element={<SellerRegister />} />
        </Route>

        {/* Seller Dashboard & Product Management */}
        <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
          <Route path="seller/dashboard" element={<SellerDashboard />} />
          <Route path="seller/products" element={<SellerProducts />} />
          <Route path="seller/products/new" element={<SellerAddProduct />} />
          <Route path="seller/products/:id/edit" element={<SellerAddProduct />} />
          <Route path="seller/orders" element={<SellerOrders />} />
        </Route>

        {/* Admin Dashboard inside MainLayout */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/sellers" element={<AdminSellers />} />
          <Route path="admin/products" element={<AdminProducts />} />
          <Route path="admin/orders" element={<AdminOrders />} />
          <Route path="admin/categories" element={<AdminCategories />} />
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/payments" element={<AdminPayments />} />
        </Route>

        {/* 404 Catch All (keeps the header and footer) */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth Pages (Standalone Layout) */}
      <Route path="auth/login" element={<Login />} />
      <Route path="auth/register" element={<Register />} />
      <Route path="auth/forgot-password" element={<ForgotPassword />} />
      <Route path="auth/reset-password/:token" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;
