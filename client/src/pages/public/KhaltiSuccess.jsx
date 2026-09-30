import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { paymentService } from '../../services/dataService';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const KhaltiSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();
  const [verifying, setVerifying] = useState(true);
  // Verify only once, even when React re-runs effects in development
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const pidx = searchParams.get('pidx');
    const orderId = searchParams.get('purchase_order_id') || searchParams.get('orderId');

    if (!pidx) {
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await paymentService.verifyKhalti(pidx, orderId);
        toast.success('Khalti Payment Confirmed!');
        await fetchCart();
        navigate(`/orders/${res.data.data.id}`, { replace: true });
      } catch (err) {
        toast.error(err.response?.data?.message || 'Khalti verification failed');
        setVerifying(false);
      }
    };

    verify();
  }, [searchParams, navigate, fetchCart]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background p-4 text-center">
      {verifying ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-bold text-text font-[Playfair_Display]">
            Verifying Khalti Payment...
          </h2>
          <p className="text-xs text-text-light">
            Please wait while we confirm your Khalti transaction with the server.
          </p>
        </div>
      ) : (
        <div>
          <span className="w-16 h-16 mx-auto rounded-full bg-error-light text-error text-3xl font-bold flex items-center justify-center">!</span>
          <h2 className="text-xl font-bold text-text mt-4">Verification Failed</h2>
          <p className="text-xs text-text-light mt-1">
            Could not verify your Khalti payment.
          </p>
          <Link to="/orders" className="mt-4 inline-block px-6 py-2 bg-primary text-white font-semibold rounded-xl text-xs">
            View My Orders
          </Link>
        </div>
      )}
    </div>
  );
};

export default KhaltiSuccess;
