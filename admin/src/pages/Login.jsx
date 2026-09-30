import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLockClosed, HiOutlineMail, HiOutlineShieldCheck } from 'react-icons/hi';

export const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('admin@hamrolokbazar.com');
  const [password, setPassword] = useState('Admin@123');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    navigate('/', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071912] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-xl shadow-emerald-950/50 mb-4 border border-emerald-400/40">
          <HiOutlineShieldCheck className="w-9 h-9" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
          HAMROLOK BAZAR
        </h2>
        <p className="mt-1 text-sm text-emerald-400 font-medium tracking-wide uppercase text-[11px]">
          Official Admin Control Center
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Standalone management console running on dedicated port 5174
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-[#0E281D] py-8 px-6 shadow-2xl rounded-2xl border border-emerald-800/40 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Admin Email Address
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <HiOutlineMail className="w-5 h-5 text-emerald-400/70" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#061811] border border-emerald-800/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="admin@hamrolokbazar.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Master Password
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <HiOutlineLockClosed className="w-5 h-5 text-emerald-400/70" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#061811] border border-emerald-800/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-[#071912] bg-emerald-400 hover:bg-emerald-300 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Verifying Credentials...' : 'Sign In to Admin Portal'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-emerald-800/30 text-center">
            <p className="text-xs text-slate-400">
              Need customer or seller access?{' '}
              <a
                href="https://localhost:5173"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline"
              >
                Go to Storefront (:5173)
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
