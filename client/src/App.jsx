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

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Protected Pages
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderHistory from './pages/customer/OrderHistory';
import OrderDetails from './pages/customer/OrderDetails';
import WishlistPage from './pages/customer/WishlistPage';

// Seller Protected Pages
import SellerDashboard from './pages/seller/SellerDashboard';

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
        <Route path="categories" element={<Products />} />
        <Route path="about" element={<Home />} />
        <Route path="contact" element={<Home />} />
        <Route path="payment/esewa/success" element={<EsewaSuccess />} />
        <Route path="payment/esewa/failure" element={<EsewaFailure />} />
        <Route path="payment/khalti/success" element={<KhaltiSuccess />} />

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

        {/* Seller Dashboard inside MainLayout */}
        <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
          <Route path="seller/dashboard" element={<SellerDashboard />} />
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
      </Route>

      {/* Auth Pages (Standalone Layout) */}
      <Route path="auth/login" element={<Login />} />
      <Route path="auth/register" element={<Register />} />

      {/* 404 Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
