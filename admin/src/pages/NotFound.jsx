import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="py-24 text-center">
      <div className="text-5xl font-black text-slate-300 mb-2">404</div>
      <h2 className="text-xl font-bold text-slate-800">Admin Section Not Found</h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        The administration route you are trying to access does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
