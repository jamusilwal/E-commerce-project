import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Sellers from './pages/Sellers';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Analytics from './pages/Analytics';
import Banners from './pages/Banners';
import ContactMessages from './pages/ContactMessages';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated Admin Management Routes */}
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="sellers" element={<Sellers />} />
        <Route path="users" element={<Users />} />
        <Route path="payments" element={<Payments />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="banners" element={<Banners />} />
        <Route path="messages" element={<ContactMessages />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
