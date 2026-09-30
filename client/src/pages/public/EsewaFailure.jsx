import { Link, useSearchParams } from 'react-router-dom';
import { HiOutlineExclamationCircle, HiOutlineArrowLeft, HiOutlineClipboardList } from 'react-icons/hi';

/**
 * Shown when a customer cancels or fails an eSewa payment.
 * The order already exists (cart was emptied when it was created), so the way
 * forward is to retry payment from the order page, not to check out again.
 */
const EsewaFailure = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background p-4 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-border-light shadow-card">
        <div className="w-16 h-16 bg-error-light text-error rounded-full flex items-center justify-center mx-auto mb-4">
          <HiOutlineExclamationCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-text">Payment Not Completed</h2>
        <p className="text-sm text-text-light mt-2 leading-relaxed">
          Your eSewa transaction was cancelled or could not be processed, and no money was taken. Your order
          is saved — you can complete the payment from your order page.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={orderId ? `/orders/${orderId}` : '/orders'}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-light transition"
          >
            <HiOutlineClipboardList className="w-4 h-4" />
            {orderId ? 'View Order & Retry' : 'View My Orders'}
          </Link>
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-border text-text font-semibold rounded-xl text-sm hover:bg-surface transition"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EsewaFailure;
