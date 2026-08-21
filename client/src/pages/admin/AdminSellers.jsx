import { useState, useEffect } from 'react';
import { adminService } from '../../services/dataService';
import toast from 'react-hot-toast';

const AdminSellers = () => {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await adminService.getPendingSellers();
      setPendingSellers(res.data.data);
    } catch {
      setPendingSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminService.approveSeller(id);
      toast.success('Artisan seller approved!');
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      await adminService.rejectSeller(id, reason);
      toast.success('Seller application rejected');
      fetchPending();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface py-8 min-h-screen">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-text mb-8 font-[Playfair_Display]">
          Pending Artisan Approvals ({pendingSellers.length})
        </h1>

        {pendingSellers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center text-text-light text-sm">
            No pending seller applications right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingSellers.map((seller) => (
              <div
                key={seller.id}
                className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-text text-lg">{seller.shopName}</h3>
                    <p className="text-xs text-text-muted">
                      Applicant: {seller.user?.firstName} {seller.user?.lastName} ({seller.user?.email})
                    </p>
                  </div>
                  <span className="bg-warning-light text-warning text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                    PENDING
                  </span>
                </div>

                <div className="text-xs text-text-light space-y-1 bg-surface p-3 rounded-xl">
                  <p><strong>PAN:</strong> {seller.panNumber || 'N/A'}</p>
                  <p><strong>Phone:</strong> {seller.businessPhone || seller.user?.phone || 'N/A'}</p>
                  <p><strong>Address:</strong> {seller.businessAddress || 'N/A'}</p>
                  {seller.shopDescription && (
                    <p className="mt-1 italic">&ldquo;{seller.shopDescription}&rdquo;</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleApprove(seller.id)}
                    className="flex-1 py-2 bg-success text-white text-xs font-bold rounded-xl hover:bg-success/90 transition-all"
                  >
                    Approve Artisan
                  </button>
                  <button
                    onClick={() => handleReject(seller.id)}
                    className="flex-1 py-2 bg-error/10 text-error hover:bg-error hover:text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSellers;
