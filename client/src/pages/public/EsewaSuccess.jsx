import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { paymentService } from '../../services/dataService';
import toast from 'react-hot-toast';

const EsewaSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const encodedData = searchParams.get('data');

    if (!encodedData) {
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await paymentService.verifyEsewa(encodedData);
        toast.success('eSewa Payment Confirmed!');
        navigate(`/orders/${res.data.data.id}`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Payment verification failed');
        setVerifying(false);
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 text-center">
      {verifying ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-bold text-text font-[Playfair_Display]">
            Verifying eSewa Payment...
          </h2>
          <p className="text-xs text-text-light">
            Please wait while we confirm your eSewa transaction with the server.
          </p>
        </div>
      ) : (
        <div>
          <span className="text-5xl">❌</span>
          <h2 className="text-xl font-bold text-text mt-4">Verification Failed</h2>
          <p className="text-xs text-text-light mt-1">
            Could not verify your eSewa payment. Please check your order details.
          </p>
          <Link to="/orders" className="mt-4 inline-block px-6 py-2 bg-primary text-white font-semibold rounded-xl text-xs">
            View My Orders
          </Link>
        </div>
      )}
    </div>
  );
};

export default EsewaSuccess;
