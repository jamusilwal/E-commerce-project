import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LuLock } from 'react-icons/lu';
import authService from '../../services/authService';
import Logo from '../../components/common/Logo';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ password }) => {
    try {
      const res = await authService.resetPassword(token, password);
      toast.success(res.data.message || 'Password reset successful');
      navigate('/auth/login', { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'This reset link is invalid or expired'
      );
    }
  };

  const inputClass = (name) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border ${errors[name] ? 'border-error' : 'border-border'} bg-surface text-sm focus:border-primary`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8 border border-border-light">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold text-text text-center">Choose a new password</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
              New Password
            </label>
            <div className="relative">
              <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                className={inputClass('password')}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
              />
            </div>
            {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                className={inputClass('confirmPassword')}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === watch('password') || 'Passwords do not match',
                })}
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-error mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : 'Reset Password'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          <Link to="/auth/login" className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
