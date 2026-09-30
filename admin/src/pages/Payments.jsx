import { useState, useEffect } from 'react';
import {
  HiOutlineSearch,
  HiOutlineCreditCard,
  HiOutlineFilter,
} from 'react-icons/hi';
import { adminService } from '../services/adminService';
import { formatPrice, formatDateTime } from '../utils/helpers';
import { PAYMENT_STATUS_COLORS } from '../utils/constants';

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      const res = await adminService.getAllPayments(params);
      setPayments(res.data?.data || []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter, statusFilter]);

  const filteredPayments = payments.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const txId = (p.transactionId || p.id || '').toLowerCase();
    const orderId = (p.orderId || '').toLowerCase();
    return txId.includes(s) || orderId.includes(s);
  });

  const totalCollected = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments & Transactions</h1>
          <p className="text-sm text-slate-500">
            Real-time transaction audit ledger across eSewa, Khalti, and Cash on Delivery (COD).
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-right">
          <p className="text-[10px] uppercase font-semibold text-emerald-700">Settled Revenue</p>
          <p className="text-lg font-bold text-emerald-900">{formatPrice(totalCollected)}</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <HiOutlineSearch className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by transaction ID or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <HiOutlineFilter className="w-4 h-4 text-slate-400" />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Gateways</option>
            <option value="ESEWA">eSewa</option>
            <option value="KHALTI">Khalti</option>
            <option value="COD">Cash on Delivery</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Transaction Code</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Auditing transactions...
                  </td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((p) => {
                  const statusClass = PAYMENT_STATUS_COLORS[p.status] || 'bg-slate-100 text-slate-700';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.transactionId || p.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        #{p.orderId?.slice(-6).toUpperCase() || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                          {p.method === 'ESEWA' && <span className="text-emerald-600 font-bold">🟢 eSewa</span>}
                          {p.method === 'KHALTI' && <span className="text-purple-600 font-bold">🟣 Khalti</span>}
                          {p.method === 'COD' && <span className="text-slate-600 font-bold">💵 Cash on Delivery</span>}
                          {!['ESEWA', 'KHALTI', 'COD'].includes(p.method) && p.method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {formatPrice(p.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusClass}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDateTime(p.createdAt)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No transactions recorded matching filters.
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

export default Payments;
