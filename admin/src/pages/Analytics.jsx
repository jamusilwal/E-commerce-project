import { useState, useEffect } from 'react';
import {
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
  HiOutlineTag,
} from 'react-icons/hi';
import { adminService } from '../services/adminService';
import { formatPrice } from '../utils/helpers';
import StatCard from '../components/StatCard';

export const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getAnalytics()
      .then((res) => setAnalytics(res.data?.data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Aggregating Business Intelligence...</p>
      </div>
    );
  }

  const { paymentsByMethod = [], topProducts = [], ordersByStatus = [] } = analytics || {};

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Analytics</h1>
        <p className="text-sm text-slate-500">
          Sales distributions, top selling artisan goods, and payment gateway share.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Payment Volume by Method</h3>
          <div className="space-y-4">
            {paymentsByMethod.length > 0 ? (
              paymentsByMethod.map((item) => (
                <div key={item.method} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>
                      {item.method === 'ESEWA'
                        ? '🟢 eSewa'
                        : item.method === 'KHALTI'
                        ? '🟣 Khalti'
                        : '💵 Cash on Delivery'}
                    </span>
                    <span>{formatPrice(item._sum?.amount || 0)} ({item._count?.id || 0} txns)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${
                        item.method === 'ESEWA'
                          ? 'bg-emerald-500'
                          : item.method === 'KHALTI'
                          ? 'bg-purple-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: '65%' }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No payment distributions recorded yet.</p>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Orders by Pipeline Status</h3>
          <div className="space-y-3">
            {ordersByStatus.length > 0 ? (
              ordersByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-800">{item.status}</span>
                  <span className="font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                    {item._count?.id || 0}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No orders to categorize yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Artisan Products */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">Top Selling Artisan Products</h3>
          <p className="text-xs text-slate-500">Highest volume items sold on the marketplace</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {topProducts.length > 0 ? (
                topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4">{formatPrice(p.price)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-800">{p.totalSold || 0} sold</td>
                    <td className="py-3.5 px-4">★ {p.avgRating ? Number(p.avgRating).toFixed(1) : '5.0'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No sales recorded yet.
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

export default Analytics;
