import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
  HiOutlineTag,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineArrowRight,
  HiOutlineExclamation,
  HiOutlineRefresh,
} from 'react-icons/hi';
import { adminService } from '../services/adminService';
import { formatPrice, formatDate } from '../utils/helpers';
import { ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '../utils/constants';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboard();
      setData(res.data?.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading Platform Metrics...</p>
      </div>
    );
  }

  const { stats, recentOrders } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Dashboard</h1>
          <p className="text-sm text-slate-500">
            Real-time platform metrics, marketplace activity, and operational alerts.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <HiOutlineRefresh className="w-4 h-4 text-slate-500" />
          Refresh Stats
        </button>
      </div>

      {/* Pending Sellers Alert Banner */}
      {stats?.pendingSellers > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-white shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <HiOutlineExclamation className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                {stats.pendingSellers} Artisan Application{stats.pendingSellers > 1 ? 's' : ''} Pending Review
              </p>
              <p className="text-xs text-amber-100">
                New sellers have submitted documents and are waiting for administrator verification.
              </p>
            </div>
          </div>
          <Link
            to="/sellers"
            className="px-4 py-2 bg-white text-amber-900 font-semibold text-xs rounded-lg shadow-xs hover:bg-amber-50 transition-colors shrink-0"
          >
            Review Now →
          </Link>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Gross Revenue"
          value={formatPrice(stats?.revenue)}
          icon={HiOutlineCurrencyDollar}
          color="emerald"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={HiOutlineShoppingBag}
          subtitle={`${stats?.pendingOrders || 0} pending`}
          color="blue"
        />
        <StatCard
          title="Active Products"
          value={stats?.totalProducts || 0}
          icon={HiOutlineTag}
          color="purple"
        />
        <StatCard
          title="Verified Artisans"
          value={stats?.totalSellers || 0}
          icon={HiOutlineUserGroup}
          color="indigo"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={HiOutlineUsers}
          color="emerald"
        />
        <StatCard
          title="Pending Sellers"
          value={stats?.pendingSellers || 0}
          icon={HiOutlineClock}
          color="amber"
        />
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/orders"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs text-slate-500 font-medium">Manage</p>
            <p className="font-bold text-slate-900 group-hover:text-emerald-700">All Orders</p>
          </div>
          <HiOutlineArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          to="/sellers"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs text-slate-500 font-medium">Review</p>
            <p className="font-bold text-slate-900 group-hover:text-emerald-700">Artisan Applications</p>
          </div>
          <HiOutlineArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          to="/categories"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs text-slate-500 font-medium">Catalog</p>
            <p className="font-bold text-slate-900 group-hover:text-emerald-700">Categories</p>
          </div>
          <HiOutlineArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>
        <Link
          to="/payments"
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs text-slate-500 font-medium">Financial</p>
            <p className="font-bold text-slate-900 group-hover:text-emerald-700">Transactions Log</p>
          </div>
          <HiOutlineArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Marketplace Orders</h2>
            <p className="text-xs text-slate-500">Latest 10 orders placed across the platform</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentOrders?.length ? (
                recentOrders.map((order) => {
                  const statusClass = ORDER_STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-700';
                  const paymentClass = PAYMENT_STATUS_COLORS[order.payment?.status] || 'bg-slate-100 text-slate-700';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                        #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {order.user?.firstName} {order.user?.lastName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(order.createdAt)}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{formatPrice(order.totalAmount)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${paymentClass}`}>
                          {order.payment?.method || 'N/A'} • {order.payment?.status || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to="/orders"
                          className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No orders recorded in the platform yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
