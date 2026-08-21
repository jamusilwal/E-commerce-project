import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlinePlus,
} from 'react-icons/hi';
import { sellerService } from '../../services/dataService';
import { formatPrice } from '../../utils/helpers';

const SellerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await sellerService.getDashboard();
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

  const { profile, stats, recentOrders } = data || {};
  const isApproved = profile?.status === 'APPROVED';

  return (
    <div className="bg-surface py-8 min-h-screen">
      <div className="container-custom">
        {/* Banner if pending approval */}
        {!isApproved && (
          <div className="mb-6 p-4 rounded-2xl bg-warning-light text-warning border border-warning/20 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Account Approval Pending</p>
              <p className="text-xs opacity-90 mt-0.5">
                Your artisan account is currently under review by our team. Once approved, your products will be visible on the public marketplace.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Artisan Portal
            </span>
            <h1 className="text-3xl font-bold text-text font-[Playfair_Display]">
              {profile?.shopName || 'Artisan Dashboard'}
            </h1>
          </div>

          <Link
            to="/seller/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-xs shadow-md transition-all self-start sm:self-auto"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted">Total Products</p>
                <h3 className="text-2xl font-bold text-text mt-1">{stats?.totalProducts || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <HiOutlineShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted">Total Sales</p>
                <h3 className="text-2xl font-bold text-text mt-1">{stats?.totalOrders || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <HiOutlineCheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted">Pending Orders</p>
                <h3 className="text-2xl font-bold text-text mt-1">{stats?.pendingOrders || 0}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning-light flex items-center justify-center text-warning">
                <HiOutlineClock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-text-muted">Total Revenue</p>
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

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text text-base">Recent Artisan Orders</h3>
              <Link to="/seller/orders" className="text-xs font-semibold text-primary hover:underline">
                View All
              </Link>
            </div>
            {recentOrders?.length === 0 ? (
              <p className="text-xs text-text-muted">No recent orders.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs border-b border-border-light pb-2.5">
                    <div>
                      <p className="font-bold text-text">{item.product?.name}</p>
                      <p className="text-text-muted text-[10px]">{item.order?.orderNumber}</p>
                    </div>
                    <span className="font-bold text-primary">{formatPrice(item.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Artisan Profile Info */}
          <div className="bg-white p-6 rounded-2xl border border-border-light shadow-sm">
            <h3 className="font-bold text-text text-base mb-4">Shop Profile Overview</h3>
            <div className="space-y-2.5 text-xs text-text-light">
              <p><strong className="text-text">Shop Name:</strong> {profile?.shopName}</p>
              <p><strong className="text-text">Status:</strong> <span className="font-bold text-primary">{profile?.status}</span></p>
              <p><strong className="text-text">PAN Number:</strong> {profile?.panNumber || 'N/A'}</p>
              <p><strong className="text-text">Contact Phone:</strong> {profile?.businessPhone || 'N/A'}</p>
              <p><strong className="text-text">Address:</strong> {profile?.businessAddress || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
