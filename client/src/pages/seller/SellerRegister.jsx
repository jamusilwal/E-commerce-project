import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  HiOutlineShoppingBag,
  HiOutlineIdentification,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import { sellerService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CRAFT_CATEGORIES = [
  'Traditional Dhaka & Textile Weaving',
  'Bhaktapur Clay & Ceramic Pottery',
  'Mithila Traditional Folk Art',
  'Patan Metalcraft, Statues & Filigree',
  'Himalayan Hand-Carved Woodcraft',
  'Tibetan Singing Bowls & Ritual Items',
  'Traditional Silver & Brass Jewelry',
  'Organic Himalayan Tea & Herbal Wellness',
  'Lokta Paper & Traditional Stationery',
];

const SellerRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [existingProfile, setExistingProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      businessEmail: user?.email || '',
      businessPhone: user?.phone || '',
    },
  });

  useEffect(() => {
    const checkSellerStatus = async () => {
      try {
        const res = await sellerService.getDashboard();
        if (res.data?.data?.profile) {
          setExistingProfile(res.data.data.profile);
        }
      } catch {
        // Not registered as seller yet
      } finally {
        setLoading(false);
      }
    };

    checkSellerStatus();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        shopName: data.shopName,
        shopDescription: `${data.craftSpecialty ? `[Craft: ${data.craftSpecialty}] ` : ''}${data.shopDescription}`,
        businessPhone: data.businessPhone,
        businessEmail: data.businessEmail,
        businessAddress: `${data.municipality || ''}, ${data.district || ''}, Nepal`.trim(),
        panNumber: data.panNumber || undefined,
      };

      await sellerService.registerSeller(payload);
      toast.success('Artisan Application Submitted for Admin Approval!');
      const res = await sellerService.getDashboard();
      setExistingProfile(res.data.data.profile);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit artisan application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If already registered and Approved
  if (existingProfile?.status === 'APPROVED') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-surface p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-white rounded-3xl p-8 border border-border-light shadow-sm text-center"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiOutlineCheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-text font-[Playfair_Display]">
            You are an Approved Artisan!
          </h2>
          <p className="text-xs text-text-light mt-2 leading-relaxed">
            Your shop <strong className="text-primary">{existingProfile.shopName}</strong> is fully verified and active. You can list products and manage orders directly.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/seller/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-xs transition"
            >
              <span>Artisan Dashboard</span>
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/seller/products"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border text-text font-semibold rounded-xl text-xs hover:bg-surface-alt transition"
            >
              <span>Manage My Products</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // If already registered and Pending review
  if (existingProfile?.status === 'PENDING') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-surface p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white rounded-3xl p-8 border border-border-light shadow-sm"
        >
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HiOutlineClock className="w-10 h-10 animate-pulse" />
          </div>
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-wider mb-2">
              Application Under Review
            </span>
            <h2 className="text-2xl font-bold text-text font-[Playfair_Display]">
              {existingProfile.shopName}
            </h2>
            <p className="text-xs text-text-light mt-2 leading-relaxed max-w-md mx-auto">
              Your artisan application has been submitted to the HAMROLOK BAZAR admin panel. Once our curators verify your craft details, your artisan store will be activated.
            </p>
          </div>

          <div className="mt-6 p-4 bg-surface rounded-2xl border border-border-light space-y-2 text-xs text-text-light">
            <div className="flex justify-between">
              <span className="font-semibold text-text">Shop Name:</span>
              <span>{existingProfile.shopName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-text">Contact Phone:</span>
              <span>{existingProfile.businessPhone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-text">PAN:</span>
              <span>{existingProfile.panNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-text">Status:</span>
              <span className="font-bold text-amber-600">Pending Admin Verification</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-block px-6 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs hover:bg-primary-dark transition"
            >
              Return to Marketplace
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-surface py-12 min-h-screen">
      <div className="container-custom max-w-3xl">
        {/* Banner */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 text-white mb-8 relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[11px] font-bold tracking-wider uppercase mb-3">
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              Artisan Onboarding
            </span>
            <h1 className="text-3xl font-bold font-[Playfair_Display]">
              Become a Verified Nepalese Artisan
            </h1>
            <p className="text-xs text-white/80 mt-2 max-w-xl leading-relaxed">
              Join HAMROLOK BAZAR to showcase your traditional handicrafts, paintings, textiles, and handmade creations directly to appreciative buyers across Nepal and worldwide.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-bold font-[Playfair_Display] select-none translate-x-10 translate-y-6">
            HAMRO
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-3xl p-8 border border-border-light shadow-sm">
          <h2 className="text-xl font-bold text-text font-[Playfair_Display] mb-6 flex items-center gap-2">
            <HiOutlineShoppingBag className="w-6 h-6 text-primary" />
            Artisan Shop &amp; Workshop Details
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Shop Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                Shop / Artisan Brand Name <span className="text-error">*</span>
              </label>
              <div className="relative">
                <HiOutlineShoppingBag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="e.g. Bhaktapur Traditional Pottery Studio"
                  className={`w-full pl-10 pr-3 py-3 rounded-xl border ${
                    errors.shopName ? 'border-error ring-1 ring-error/20' : 'border-border'
                  } bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                  {...register('shopName', { required: 'Shop name is required' })}
                />
              </div>
              {errors.shopName && (
                <p className="text-xs text-error mt-1">{errors.shopName.message}</p>
              )}
            </div>

            {/* Craft Specialty */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                Primary Craft Specialty <span className="text-error">*</span>
              </label>
              <select
                className="w-full px-3.5 py-3 rounded-xl border border-border bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                {...register('craftSpecialty', { required: 'Please select your primary craft' })}
              >
                <option value="">Select your traditional craft...</option>
                {CRAFT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.craftSpecialty && (
                <p className="text-xs text-error mt-1">{errors.craftSpecialty.message}</p>
              )}
            </div>

            {/* Shop Story / Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                Artisan Story &amp; Heritage Description <span className="text-error">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Tell customers about your artisans, technique, materials used, and heritage (e.g. 3rd generation woodcarvers from Lalitpur using local seasoned sal wood)..."
                className={`w-full p-3.5 rounded-xl border ${
                  errors.shopDescription ? 'border-error ring-1 ring-error/20' : 'border-border'
                } bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                {...register('shopDescription', {
                  required: 'Please provide a brief story about your craft',
                  minLength: { value: 20, message: 'Please provide at least 20 characters' },
                })}
              />
              {errors.shopDescription && (
                <p className="text-xs text-error mt-1">{errors.shopDescription.message}</p>
              )}
            </div>

            {/* Contact Details (2 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Business Phone (Nepal) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <HiOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    className={`w-full pl-10 pr-3 py-3 rounded-xl border ${
                      errors.businessPhone ? 'border-error' : 'border-border'
                    } bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                    {...register('businessPhone', { required: 'Contact phone is required' })}
                  />
                </div>
                {errors.businessPhone && (
                  <p className="text-xs text-error mt-1">{errors.businessPhone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Business Email
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    placeholder="artisan@example.com"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-border bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    {...register('businessEmail')}
                  />
                </div>
              </div>
            </div>

            {/* Location (District & Municipality) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  District <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <HiOutlineLocationMarker className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="e.g. Bhaktapur / Palpa / Janakpur"
                    className={`w-full pl-10 pr-3 py-3 rounded-xl border ${
                      errors.district ? 'border-error' : 'border-border'
                    } bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                    {...register('district', { required: 'District is required' })}
                  />
                </div>
                {errors.district && (
                  <p className="text-xs text-error mt-1">{errors.district.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Municipality / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pottery Square, Ward-4"
                  className="w-full px-3.5 py-3 rounded-xl border border-border bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  {...register('municipality')}
                />
              </div>
            </div>

            {/* PAN Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                PAN / Tax Registration Number (Optional)
              </label>
              <div className="relative">
                <HiOutlineIdentification className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="9-digit PAN Number (if registered)"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-border bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono"
                  {...register('panNumber')}
                />
              </div>
            </div>

            {/* Admin Verification Notice */}
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-start gap-3 text-xs text-text-light">
              <HiOutlineShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p>
                <strong>Admin Approval Process:</strong> To ensure authenticity and protect Nepali handicraft traditions, all artisan applications are manually verified by HAMROLOK BAZAR administrators before listing is unlocked.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Artisan Application</span>
                  <HiOutlineArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;
