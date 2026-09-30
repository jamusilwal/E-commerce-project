import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LuWallet, LuTriangleAlert } from 'react-icons/lu';

/**
 * Development-only stand-in for the Khalti checkout page.
 * The server redirects here when no real Khalti key is configured; confirming
 * sends the browser to the normal success URL, exactly like Khalti would.
 */
const KhaltiSandbox = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pidx = searchParams.get('pidx');
  const orderId = searchParams.get('orderId');

  if (!pidx || !orderId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="text-xl font-bold text-text">Invalid payment link</h2>
        <Link to="/orders" className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded-xl text-sm">
          View My Orders
        </Link>
      </div>
    );
  }

  const handlePay = () => {
    const params = new URLSearchParams({ pidx, purchase_order_id: orderId, status: 'Completed' });
    navigate(`/payment/khalti/success?${params.toString()}`, { replace: true });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-border-light shadow-card text-center">
        <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LuWallet className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-text">Khalti Test Payment</h2>
        <p className="text-sm text-text-light mt-2">
          No Khalti API key is configured, so this sandbox page simulates the Khalti checkout.
        </p>
        <p className="flex items-start gap-2 text-left text-xs text-warning bg-warning-light rounded-lg p-3 mt-4">
          <LuTriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
          For development only. In production the customer is sent to the real Khalti page.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handlePay}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm"
          >
            Confirm Test Payment
          </button>
          <Link
            to={`/orders/${orderId}`}
            className="px-6 py-2.5 bg-white border border-border text-text font-semibold rounded-xl text-sm hover:bg-surface"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default KhaltiSandbox;
