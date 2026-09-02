import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineUserGroup,
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineViewGrid,
  HiOutlineTruck,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineTag,
} from 'react-icons/hi';
import { adminService } from '../../services/dataService';
import { formatPrice } from '../../utils/helpers';

const statusColor = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-indigo-100 text-indigo-700',
  PACKED: 'bg-cyan-100 text-cyan-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getDashboard();
        setData(res.data.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { stats, recentOrders } = data || {};

  const statCards = [
    { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: HiOutlineUserGroup, color: 'bg-blue-50 text-blue-600' },
    { label: 'Approved Artisans', value: stats?.totalSellers || 0, icon: HiOutlineCheckCircle, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: HiOutlineTag, color: 'bg-violet-50 text-violet-600' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: HiOutlineShoppingBag, color: 'bg-amber-50 text-amber-600' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: HiOutlineClock, color: 'bg-orange-50 text-orange-600' },
    { label: 'Delivered Orders', value: stats?.deliveredOrders || 0, icon: HiOutlineTruck, color: 'bg-teal-50 text-teal-600' },
    { label: 'Pending Sellers', value: stats?.pendingSellers || 0, icon: HiOutlineUsers, color: 'bg-rose-50 text-rose-600' },
    { label: 'Revenue (NPR)', value: formatPrice(stats?.revenue || 0), icon: HiOutlineCurrencyDollar, color: 'bg-primary/10 text-primary', isPrice: true },
  ];

  const navLinks = [
    { label: 'Products', to: '/admin/products', icon: HiOutlineViewGrid, desc: 'Add, edit, delete products' },
    { label: 'All Orders', to: '/admin/orders', icon: HiOutlineClipboardList, desc: 'Track & update order status' },
    { label: 'Approve Artisans', to: '/admin/sellers', icon: HiOutlineUsers, desc: `${stats?.pendingSellers || 0} pending applications` },
    { label: 'Analytics', to: '/admin/analytics', icon: HiOutlineChartBar, desc: 'Sales & revenue reports' },
  ];

  return (
    <div className="bg-surface py-8 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Administration</span>
          <h1 className="text-3xl font-bold text-text font-[Playfair_Display]">Admin Control Panel</h1>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {navLinks.map((nav) => (
            <Link
              key={nav.to}
              to={nav.to}
              className="bg-white p-5 rounded-2xl border border-border-light hover:border-primary/30 hover:shadow-card-hover transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors mb-3">
                <nav.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <p className="font-bold text-sm text-text">{nav.label}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{nav.desc}</p>
            </Link>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white p-5 rounded-2xl border border-border-light shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{card.label}</p>
                  <h3 className={`text-xl font-bold mt-1 ${card.isPrice ? 'text-primary' : 'text-text'}`}>
                    {card.isPrice ? card.value : card.value}
                  </h3>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl border border-border-light shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-text text-base">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-primary hover:underline">
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-light text-text-muted uppercase tracking-wider">
                  <th className="py-3 px-2">Order #</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Payment</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Total</th>
                  <th className="py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {recentOrders?.length > 0 ? (
                  recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-surface/50">
                      <td className="py-3 px-2">
                        <Link to={`/admin/orders`} className="font-bold text-primary hover:underline">
                          {ord.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-text-light">
                        {ord.user?.firstName} {ord.user?.lastName}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface text-text-muted">
                          {ord.payment?.method || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColor[ord.status] || 'bg-gray-100 text-gray-600'}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold text-text">{formatPrice(ord.grandTotal)}</td>
                      <td className="py-3 px-2 text-text-muted">
                        {new Date(ord.createdAt).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-muted">No orders yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
