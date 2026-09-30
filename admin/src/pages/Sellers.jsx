import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineUserGroup,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import { adminService } from '../services/adminService';
import { formatDate } from '../utils/helpers';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';

export const Sellers = () => {
  const { refreshPending } = useOutletContext() || {};
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingSeller, setRejectingSeller] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getPendingSellers();
      setPendingSellers(res.data?.data || []);
      if (refreshPending) refreshPending();
    } catch {
      setPendingSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this artisan to sell on HAMROLOK BAZAR?')) return;
    setActionLoading(true);
    try {
      await adminService.approveSeller(id);
      toast.success('Artisan seller verified and approved!');
      fetchSellers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return toast.error('Please specify a rejection reason');

    setActionLoading(true);
    try {
      await adminService.rejectSeller(rejectingSeller.id, rejectReason);
      toast.success('Artisan application rejected');
      setRejectingSeller(null);
      setRejectReason('');
      fetchSellers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Artisan Onboarding</h1>
          <p className="text-sm text-slate-500">
            Review submitted credentials, craftsmanship profiles, and documents for new artisan accounts.
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
          Pending Verification: {pendingSellers.length}
        </div>
      </div>

      {/* Pending Sellers List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Checking pending registrations...
          </div>
        ) : pendingSellers.length > 0 ? (
          pendingSellers.map((seller) => (
            <div
              key={seller.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl font-bold text-amber-800 shrink-0">
                    🛠️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{seller.shopName}</h3>
                      <Badge variant="warning">Pending Review</Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      Applied on {formatDate(seller.createdAt)} • Registered by {seller.user?.firstName} {seller.user?.lastName}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  {seller.bio || 'No shop biography provided.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <HiOutlineMail className="w-4 h-4 text-slate-400" />
                    {seller.user?.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HiOutlinePhone className="w-4 h-4 text-slate-400" />
                    {seller.phone || seller.user?.phone || 'No phone'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HiOutlineLocationMarker className="w-4 h-4 text-slate-400" />
                    {seller.district || 'Nepal'} {seller.province ? `, ${seller.province}` : ''}
                  </span>
                </div>

                {seller.citizenshipNumber && (
                  <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 inline-block font-mono text-slate-700">
                    Citizenship / PAN: <span className="font-bold">{seller.citizenshipNumber}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                <button
                  onClick={() => handleApprove(seller.id)}
                  disabled={actionLoading}
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <HiOutlineCheck className="w-4 h-4" />
                  Approve Artisan
                </button>
                <button
                  onClick={() => setRejectingSeller(seller)}
                  disabled={actionLoading}
                  className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <HiOutlineX className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl">
              ✓
            </div>
            <h3 className="font-bold text-slate-800 text-sm">All Artisan Applications Caught Up!</h3>
            <p className="text-xs text-slate-400 mt-1">
              There are currently no new sellers waiting for verification.
            </p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingSeller && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Reject Artisan Application
              </h3>
              <button
                onClick={() => setRejectingSeller(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                You are about to reject the application for{' '}
                <strong className="text-slate-900">{rejectingSeller.shopName}</strong>. Please provide
                a clear reason so they can re-apply if appropriate:
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Rejection *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Unclear identification documents, craft verification failed, or duplicate shop registration..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingSeller(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sellers;
