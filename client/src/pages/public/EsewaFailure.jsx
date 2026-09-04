import { Link, useSearchParams } from 'react-router-dom';
import { HiOutlineExclamationCircle, HiOutlineArrowLeft, HiOutlineShoppingBag } from 'react-icons/hi';

const EsewaFailure = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-surface p-4 text-center">
      <div className="max-w-md w-full bg-surface-card p-8 rounded-2xl border border-border shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiOutlineExclamationCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-text font-[Playfair_Display]">
          Payment Not Completed
        </h2>
        <p className="text-sm text-text-light mt-2 leading-relaxed">
          Your eSewa transaction was cancelled or could not be processed. No funds were charged from your account.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/checkout"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-dark transition"
          >
            <HiOutlineShoppingBag className="w-4 h-4" />
            Retry Checkout
          </Link>
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface border border-border text-text font-semibold rounded-xl text-sm hover:bg-surface-alt transition"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EsewaFailure;
