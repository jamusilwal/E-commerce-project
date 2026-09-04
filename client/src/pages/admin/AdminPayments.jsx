import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCreditCard, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi';
import { adminService, paymentService } from '../../services/dataService';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (methodFilter) params.method = methodFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await adminService.getAllPayments(params);
      setPayments(res.data.data.payments || []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter, statusFilter]);

  const handleVerify = async (paymentId) => {
    try {
      const res = await paymentService.verifySecurity(paymentId);
      if (res.data.data.valid) {
        toast.success('✓ Valid: Cryptographic SHA-256 + RSA Signature Verified!');
      } else {
        toast.error(`Verification Failed: ${res.data.data.error || 'Invalid signature'}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const getMethodBadge = (method) => {
    switch (method) {
      case 'ESEWA':
        return 'bg-emerald-600 text-white';
      case 'KHALTI':
        return 'bg-purple-600 text-white';
      case 'COD':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="bg-surface py-8 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link to="/admin/dashboard" className="text-xs text-primary font-semibold hover:underline">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-text font-[Playfair_Display] mt-1">
              Payments &amp; Transactions
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Cryptographically signed transaction logs (eSewa, Khalti, COD)
            </p>
          </div>
          <button
            onClick={fetchPayments}
            className="p-2 rounded-xl bg-white border border-border hover:bg-surface transition-colors"
            title="Refresh"
          >
            <HiOutlineRefresh className="w-5 h-5 text-text-light" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2">
            {['', 'ESEWA', 'KHALTI', 'COD'].map((m) => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  methodFilter === m
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-border text-text-light hover:border-primary'
                }`}
              >
                {m || 'All Gateways'}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {['', 'COMPLETED', 'PENDING', 'FAILED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-border text-text-light hover:border-primary'
                }`}
              >
                {s || 'All Statuses'}
              </button>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center text-text-muted text-sm">No transaction records found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface/50 border-b border-border-light text-text-muted uppercase tracking-wider">
                    <th className="py-3.5 px-4">Transaction ID</th>
                    <th className="py-3.5 px-4">Order #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Security Proof</th>
                    <th className="py-3.5 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-surface/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-text font-bold">
                        {p.transactionId || p.id.substring(0, 16)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          to="/admin/orders"
                          className="font-bold text-primary hover:underline"
                        >
                          #{p.order?.orderNumber || 'N/A'}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-text-light">
                        {p.order?.user?.firstName} {p.order?.user?.lastName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getMethodBadge(
                            p.method
                          )}`}
                        >
                          {p.method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-text">{formatPrice(p.amount)}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            p.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {p.signature ? (
                          <div className="text-[10px] font-mono text-emerald-700">
                            <span className="font-bold">✓ Signed</span> ({p.signingKeyId || 'RSA-2048'})
                          </div>
                        ) : (
                          <span className="text-[10px] text-text-muted">Pending completion</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {p.signature && (
                          <button
                            onClick={() => handleVerify(p.id)}
                            className="px-2.5 py-1 bg-surface hover:bg-emerald-50 border border-border-light hover:border-emerald-300 text-emerald-700 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                          >
                            <HiOutlineShieldCheck className="w-3.5 h-3.5" /> Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
