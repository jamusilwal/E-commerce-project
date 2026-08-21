import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineUserGroup,
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { adminService } from '../../services/dataService';
import { formatPrice } from '../../utils/helpers';

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

  return (
    <div className="bg-surface py-8 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Administration
            </span>
            <h1 className="text-3xl font-bold text-text font-[Playfair_Display]">
              Platform Control Panel
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/sellers"
              className="px-4 py-2 bg-primary text-white font-semibold rounded-xl text-xs"
            >
              Approve Artisans ({stats?.pendingSellers || 0})
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted">Total Customers</p>
                <h3 className="text-2xl font-bold text-text mt-1">{stats?.totalCustomers || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info-light flex items-center justify-center text-info">
                <HiOutlineUserGroup className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted">Approved Artisans</p>
                <h3 className="text-2xl font-bold text-text mt-1">{stats?.totalSellers || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <HiOutlineCheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted">Total Orders</p>
                <h3 className="text-2xl font-bold text-text mt-1">{stats?.totalOrders || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <HiOutlineShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted">Total Marketplace Volume</p>
                <h3 className="text-2xl font-bold text-primary mt-1">
                  {formatPrice(stats?.revenue || 0)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center text-success">
                <HiOutlineCurrencyDollar className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl border border-border-light shadow-sm p-6">
          <h3 className="font-bold text-text text-base mb-4">Recent Marketplace Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-light text-text-muted uppercase tracking-wider">
                  <th className="py-3 px-2">Order #</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {recentOrders?.map((ord) => (
                  <tr key={ord.id} className="hover:bg-surface/50">
                    <td className="py-3 px-2 font-bold text-text">{ord.orderNumber}</td>
                    <td className="py-3 px-2 text-text-light">
                      {ord.user?.firstName} {ord.user?.lastName}
                    </td>
                    <td className="py-3 px-2 font-semibold text-primary">{ord.status}</td>
                    <td className="py-3 px-2 font-bold text-text">{formatPrice(ord.grandTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
