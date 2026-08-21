import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import NotFound from './pages/public/NotFound';
import EsewaSuccess from './pages/public/EsewaSuccess';
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
        <Route path="payment/khalti/success" element={<KhaltiSuccess />} />

        {/* Customer Protected Routes inside MainLayout */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']} />}>
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="wishlist" element={<WishlistPage />} />
        </Route>

        {/* Seller Dashboard inside MainLayout */}
        <Route element={<ProtectedRoute allowedRoles={['SELLER']} />}>
          <Route path="seller/dashboard" element={<SellerDashboard />} />
        </Route>

        {/* Admin Dashboard inside MainLayout */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/sellers" element={<AdminSellers />} />
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
