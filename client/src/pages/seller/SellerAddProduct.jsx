import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlinePhotograph,
  HiOutlineTag,
  HiOutlineClipboardList,
  HiOutlineArrowLeft,
  HiOutlineUpload,
  HiOutlineX,
  HiOutlineSparkles,
} from 'react-icons/hi';
import { productService, categoryService } from '../../services/dataService';
import { handleImageError } from '../../utils/helpers';
import toast from 'react-hot-toast';

const toFormValues = (product) => ({
  name: product.name || '',
  categoryId: product.categoryId || '',
  shortDescription: product.shortDescription || '',
  description: product.description || '',
  materials: product.materials || '',
  price: product.price ?? '',
  comparePrice: product.comparePrice ?? '',
  quantity: product.inventory?.quantity ?? 0,
  weight: product.weight ?? '',
  estimatedDelivery: product.estimatedDelivery || '',
  dimensions: product.dimensions || '',
  tags: (product.tags || []).join(', '),
  isActive: product.isActive !== false,
});

/** Add a new product, or edit an existing one at /seller/products/:id/edit */
const SellerAddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const previewsRef = useRef([]);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      quantity: 10,
      estimatedDelivery: '3-5 business days',
      isActive: true,
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        setCategories(res.data.data || []);
      } catch {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  // Edit mode: load the product from the seller's own listings
  useEffect(() => {
    if (!isEdit) return;
    const loadProduct = async () => {
      try {
        const res = await productService.getSellerProducts({ page: 1, limit: 500 });
        const product = (res.data.data.products || []).find((p) => p.id === id);
        if (!product) {
          toast.error('Product not found');
          navigate('/seller/products', { replace: true });
          return;
        }
        reset(toFormValues(product));
        setExistingImages(product.images || []);
      } catch {
        toast.error('Failed to load product');
        navigate('/seller/products', { replace: true });
      } finally {
        setLoadingProduct(false);
      }
    };
    loadProduct();
  }, [id, isEdit, navigate, reset]);

  // Free preview object URLs when leaving the page
  useEffect(() => () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const maxNewImages = 5 - existingImages.length;

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow picking the same file again later
    if (files.length === 0) return;

    if (files.length + selectedImages.length > maxNewImages) {
      toast.error(`You can add ${Math.max(0, maxNewImages - selectedImages.length)} more image(s) (5 max)`);
      return;
    }
    const tooLarge = files.find((file) => file.size > 5 * 1024 * 1024);
    if (tooLarge) {
      toast.error(`${tooLarge.name} is larger than 5MB`);
      return;
    }

    // Object URLs are created synchronously, so previews stay in the same order as files
    const urls = files.map((file) => URL.createObjectURL(file));
    previewsRef.current.push(...urls);
    setSelectedImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...urls]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const productPayload = {
        name: data.name.trim(),
        description: data.description,
        shortDescription: data.shortDescription || '',
        materials: data.materials || '',
        price: parseFloat(data.price),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
        categoryId: data.categoryId,
        quantity: parseInt(data.quantity, 10) || 0,
        estimatedDelivery: data.estimatedDelivery || '3-5 business days',
        weight: data.weight ? parseFloat(data.weight) : null,
        dimensions: data.dimensions || '',
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      let productId = id;
      if (isEdit) {
        await productService.updateProduct(id, { ...productPayload, isActive: !!data.isActive });
      } else {
        const res = await productService.createProduct({
          ...productPayload,
          comparePrice: productPayload.comparePrice ?? undefined,
          weight: productPayload.weight ?? undefined,
          isFeatured: false,
        });
        productId = res.data.data.id;
      }

      // Upload images if any
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach((file) => formData.append('images', file));
        try {
          await productService.uploadImages(productId, formData);
        } catch (err) {
          toast.error(
            `Product saved, but images could not be uploaded${
              err.response?.data?.message ? `: ${err.response.data.message}` : '.'
            } You can try again by editing the product.`
          );
        }
      }

      toast.success(isEdit ? 'Product updated' : 'Product created successfully! 🎉');
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface py-8 min-h-screen">
      <div className="container-custom max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/seller/products')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text mb-6 transition"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to My Products
        </button>

        {/* Banner */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 text-white mb-8 relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[11px] font-bold tracking-wider uppercase mb-3">
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              {isEdit ? 'Edit Listing' : 'New Listing'}
            </span>
            <h1 className="text-3xl font-bold text-white">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-white/80 mt-2 max-w-xl leading-relaxed">
              {isEdit
                ? 'Update the details, price or stock of this product. Changes appear on the marketplace straight away.'
                : 'List your handmade creation on HAMROLOK BAZAR. Fill in the details below to showcase your craft to buyers across Nepal and beyond.'}
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-bold font-[Playfair_Display] select-none translate-x-10 translate-y-6">
            {isEdit ? 'EDIT' : 'NEW'}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-light shadow-sm">
            <h2 className="text-lg font-bold text-text font-[Playfair_Display] mb-6 flex items-center gap-2">
              <HiOutlineShoppingBag className="w-5 h-5 text-primary" />
              Product Details
            </h2>

            <div className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Product Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hand-carved Wooden Buddha Statue"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-error ring-1 ring-error/20' : 'border-border'} bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                  {...register('name', { required: 'Product name is required' })}
                />
                {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Category <span className="text-error">*</span>
                </label>
                <select
                  className={`w-full px-4 py-3 rounded-xl border ${errors.categoryId ? 'border-error' : 'border-border'} bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                  {...register('categoryId', { required: 'Please select a category' })}
                >
                  <option value="">Select a category...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-error mt-1">{errors.categoryId.message}</p>}
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="Brief tagline or summary (shown on product cards)"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  {...register('shortDescription')}
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Full Description <span className="text-error">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Detailed description — materials, technique, history, dimensions, care instructions..."
                  className={`w-full p-4 rounded-xl border ${errors.description ? 'border-error ring-1 ring-error/20' : 'border-border'} bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                  {...register('description', {
                    required: 'Product description is required',
                    minLength: { value: 20, message: 'At least 20 characters required' },
                  })}
                />
                {errors.description && <p className="text-xs text-error mt-1">{errors.description.message}</p>}
              </div>

              {/* Materials */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Materials Used
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sal wood, natural lacquer, handmade copper nails"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  {...register('materials')}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-light shadow-sm">
            <h2 className="text-lg font-bold text-text font-[Playfair_Display] mb-6 flex items-center gap-2">
              <HiOutlineCurrencyDollar className="w-5 h-5 text-primary" />
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Price */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Price (NPR) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted font-semibold">रू</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.price ? 'border-error' : 'border-border'} bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 1, message: 'Price must be at least 1' },
                    })}
                  />
                </div>
                {errors.price && <p className="text-xs text-error mt-1">{errors.price.message}</p>}
              </div>

              {/* Compare Price */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Compare-at Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted font-semibold">रू</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Original price before discount"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.comparePrice ? 'border-error' : 'border-border'} bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                    {...register('comparePrice', {
                      validate: (value) =>
                        !value ||
                        parseFloat(value) > parseFloat(getValues('price') || 0) ||
                        'Compare-at price must be higher than the price',
                    })}
                  />
                </div>
                {errors.comparePrice && <p className="text-xs text-error mt-1">{errors.comparePrice.message}</p>}
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Stock Quantity <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  placeholder="10"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.quantity ? 'border-error' : 'border-border'} bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all`}
                  {...register('quantity', {
                    required: 'Stock quantity is required',
                    min: { value: 0, message: 'Cannot be negative' },
                  })}
                />
                {errors.quantity && <p className="text-xs text-error mt-1">{errors.quantity.message}</p>}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 0.5"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  {...register('weight')}
                />
              </div>
            </div>
          </div>

          {/* Shipping & Tags */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-light shadow-sm">
            <h2 className="text-lg font-bold text-text font-[Playfair_Display] mb-6 flex items-center gap-2">
              <HiOutlineTag className="w-5 h-5 text-primary" />
              Shipping & Tags
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Estimated Delivery */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                    Estimated Delivery
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3-5 business days"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    {...register('estimatedDelivery')}
                  />
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15cm x 10cm x 8cm"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    {...register('dimensions')}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-light mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. handmade, wooden, buddha, meditation, nepal"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  {...register('tags')}
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Tags help buyers find your products in search
                </p>
              </div>
            </div>
          </div>

          {/* Visibility (edit mode) */}
          {isEdit && (
            <label className="flex items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-border-light shadow-sm cursor-pointer">
              <span>
                <span className="block text-sm font-semibold text-text">Visible on the marketplace</span>
                <span className="block text-xs text-text-muted mt-0.5">Turn off to hide this product from buyers without deleting it.</span>
              </span>
              <input type="checkbox" className="w-5 h-5 accent-primary" {...register('isActive')} />
            </label>
          )}

          {/* Product Images */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-light shadow-sm">
            <h2 className="text-lg font-bold text-text font-[Playfair_Display] mb-6 flex items-center gap-2">
              <HiOutlinePhotograph className="w-5 h-5 text-primary" />
              Product Images
            </h2>

            {/* Existing images (edit mode) */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-text-light mb-2">Current images</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {existingImages.map((img, idx) => (
                    <div key={img.id || idx} className="relative rounded-xl overflow-hidden border border-border-light aspect-square">
                      <img src={img.url} alt="" onError={handleImageError} className="w-full h-full object-cover" />
                      {(img.isPrimary || idx === 0) && (
                        <span className="absolute bottom-1.5 left-1.5 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          PRIMARY
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-border-light aspect-square">
                    <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition"
                      aria-label={`Remove image ${idx + 1}`}
                    >
                      <HiOutlineX className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && existingImages.length === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        PRIMARY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {selectedImages.length < maxNewImages && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:border-primary rounded-2xl bg-surface cursor-pointer transition-colors group">
                <HiOutlineUpload className="w-8 h-8 text-text-muted group-hover:text-primary transition" />
                <span className="text-xs text-text-muted mt-2 group-hover:text-primary transition">
                  Click to upload images ({existingImages.length + selectedImages.length}/5)
                </span>
                <span className="text-[10px] text-text-muted/60 mt-0.5">
                  JPG, PNG, WebP — max 5MB each
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}

            <p className="text-[11px] text-text-muted mt-3">
              {isEdit
                ? 'New images are added after the current ones.'
                : 'First image will be the main product image. You can also add images after creating the product.'}
            </p>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEdit ? 'Saving Changes…' : 'Creating Product…'}</span>
                </>
              ) : (
                <>
                  <HiOutlineClipboardList className="w-5 h-5" />
                  <span>{isEdit ? 'Save Changes' : 'Create Product Listing'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="px-8 py-4 bg-surface border border-border text-text font-semibold rounded-xl text-sm hover:bg-border-light transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerAddProduct;
