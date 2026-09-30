import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LuMail, LuArrowLeft } from 'react-icons/lu';
import authService from '../../services/authService';
import Logo from '../../components/common/Logo';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [result, setResult] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      const res = await authService.forgotPassword(email);
      // In development the API returns the token directly instead of emailing it
      setResult({ message: res.data.message, resetToken: res.data.data?.resetToken });
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8 border border-border-light">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold text-text text-center">Forgot your password?</h1>

        {result ? (
          <div className="mt-6 space-y-4 text-center">
            <p className="text-sm text-text-light">{result.message}</p>
            {result.resetToken && (
              <div className="p-3 rounded-lg bg-warning-light text-xs text-warning text-left">
                <p className="font-semibold">Development mode</p>
                <p className="mt-1">Email isn&apos;t sent locally, so use this link to reset the password:</p>
                <Link
                  to={`/auth/reset-password/${result.resetToken}`}
                  className="inline-block mt-2 font-semibold text-primary underline"
                >
                  Reset password
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-text-light text-center mt-2">
              Enter the email you signed up with and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.email ? 'border-error' : 'border-border'} bg-surface text-sm focus:border-primary`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
                    })}
                  />
                </div>
                {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <Link
          to="/auth/login"
          className="flex items-center justify-center gap-1.5 mt-6 text-sm font-semibold text-primary hover:underline"
        >
          <LuArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
