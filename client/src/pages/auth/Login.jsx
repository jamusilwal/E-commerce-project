import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  HiOutlineMail,
  HiLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME } from '../../utils/constants';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedRoleTab, setSelectedRoleTab] = useState('CUSTOMER');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin') {
      setSelectedRoleTab('ADMIN');
      setValue('email', 'admin@hamrolokbazar.com');
      setValue('password', 'Admin@123');
    } else if (roleParam === 'seller') {
      setSelectedRoleTab('SELLER');
    }
  }, [searchParams, setValue]);

  const handleRoleTabChange = (role) => {
    setSelectedRoleTab(role);
    if (role === 'ADMIN') {
      setValue('email', 'admin@hamrolokbazar.com');
      setValue('password', 'Admin@123');
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch {
      // Error toast handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-card hover:shadow-card-hover p-8 border border-border-light"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl font-[Playfair_Display]">H</span>
            </div>
            <span className="text-xl font-bold text-primary font-[Playfair_Display]">
              {APP_NAME}
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-text font-[Playfair_Display]">
            {selectedRoleTab === 'ADMIN' ? 'Admin Portal Login' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-text-light mt-1">
            {selectedRoleTab === 'ADMIN'
              ? 'Access the central platform control panel'
              : 'Sign in to access your account & orders'}
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-3 gap-1.5 mb-6 p-1 bg-surface rounded-xl border border-border">
          <button
            type="button"
            onClick={() => handleRoleTabChange('CUSTOMER')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold text-xs transition-all ${selectedRoleTab === 'CUSTOMER'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-light hover:text-text'
              }`}
          >
            <HiOutlineUser className="w-3.5 h-3.5" />
            Customer
          </button>
          <button
            type="button"
            onClick={() => handleRoleTabChange('SELLER')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold text-xs transition-all ${selectedRoleTab === 'SELLER'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-light hover:text-text'
              }`}
          >
            <HiOutlineShoppingBag className="w-3.5 h-3.5" />
            Artisan
          </button>
          <button
            type="button"
            onClick={() => handleRoleTabChange('ADMIN')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-semibold text-xs transition-all ${selectedRoleTab === 'ADMIN'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-purple-700 hover:bg-purple-50'
              }`}
          >
            <HiOutlineShieldCheck className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>

        {/* Admin Quick Fill Demo Banner */}
        {selectedRoleTab === 'ADMIN' && (
          <div className="mb-5 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
            <div>
              <p className="font-bold">Admin Credentials Pre-filled</p>
              <p className="text-[11px] text-purple-700">admin@hamrolokbazar.com</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setValue('email', 'admin@hamrolokbazar.com');
                setValue('password', 'Admin@123');
              }}
              className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-bold shadow-sm"
            >
              Fill Again
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="email"
                placeholder="Enter your email"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border ${errors.email ? 'border-error ring-1 ring-error/20' : 'border-border'
                  } bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-light">
                Password
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-11 pr-11 py-3 rounded-xl border ${errors.password ? 'border-error ring-1 ring-error/20' : 'border-border'
                  } bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              >
                {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 ${selectedRoleTab === 'ADMIN'
                ? 'bg-purple-700 hover:bg-purple-800'
                : 'bg-primary hover:bg-primary-dark'
              } text-white font-semibold rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : selectedRoleTab === 'ADMIN' ? (
              'Sign In as Administrator'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-border-light pt-6">
          <p className="text-sm text-text-light">
            Don&apos;t have an account?{' '}
            <Link to="/auth/register" className="font-semibold text-primary hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
