import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineShoppingBag,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME } from '../../utils/constants';

const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('CUSTOMER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        role: selectedRole,
      };

      const user = await registerAuth(payload);
      if (selectedRole === 'SELLER') {
        navigate('/seller/register');
      } else {
        navigate('/');
      }
    } catch {
      // Error handled in context toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-white to-secondary flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-card hover:shadow-card-hover p-8 border border-border-light"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl font-[Playfair_Display]">H</span>
            </div>
            <span className="text-xl font-bold text-primary font-[Playfair_Display]">
              {APP_NAME}
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-text font-[Playfair_Display]">
            Create an Account
          </h2>
          <p className="text-sm text-text-light mt-1">
            Join Nepal&apos;s dedicated handmade marketplace
          </p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-surface rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setSelectedRole('CUSTOMER')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-xs transition-all ${selectedRole === 'CUSTOMER'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-light hover:text-text'
              }`}
          >
            <HiOutlineUser className="w-4 h-4" />
            Customer
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('SELLER')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-xs transition-all ${selectedRole === 'SELLER'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-light hover:text-text'
              }`}
          >
            <HiOutlineShoppingBag className="w-4 h-4" />
            Artisan / Seller
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1">
                First Name
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="First Name"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${errors.firstName ? 'border-error' : 'border-border'
                    } bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                  {...register('firstName', { required: 'First name is required' })}
                />
              </div>
              {errors.firstName && (
                <p className="text-xs text-error mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1">
                Last Name
              </label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Last Name"
                  className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${errors.lastName ? 'border-error' : 'border-border'
                    } bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                  {...register('lastName', { required: 'Last name is required' })}
                />
              </div>
              {errors.lastName && (
                <p className="text-xs text-error mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1">
              Email Address
            </label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                placeholder="Enter your email adddress"
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${errors.email ? 'border-error' : 'border-border'
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
            {errors.email && (
              <p className="text-xs text-error mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1">
              Phone Number (Nepal)
            </label>
            <div className="relative">
              <HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="tel"
                placeholder="Your phone number"
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${errors.phone ? 'border-error' : 'border-border'
                  } bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                {...register('phone', {
                  pattern: {
                    value: /^(\+977)?[9][6-9]\d{8}$/,
                    message: 'Enter a valid Nepalese phone number',
                  },
                })}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-error mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1">
              Password
            </label>
            <div className="relative">
              <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border ${errors.password ? 'border-error' : 'border-border'
                  } bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              >
                {showPassword ? (
                  <HiOutlineEyeOff className="w-4 h-4" />
                ) : (
                  <HiOutlineEye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-error mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="password"
                placeholder="Re-enter password"
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${errors.confirmPassword ? 'border-error' : 'border-border'
                  } bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (val) => val === passwordValue || 'Passwords do not match',
                })}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-error mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              `Register as ${selectedRole === 'SELLER' ? 'Artisan' : 'Customer'}`
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center border-t border-border-light pt-4">
          <p className="text-sm text-text-light">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
