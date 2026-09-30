import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LuShoppingCart,
  LuHeart,
  LuTruck,
  LuShieldCheck,
  LuRotateCcw,
  LuMinus,
  LuPlus,
  LuSettings,
  LuPackageSearch,
  LuBadgeCheck,
} from 'react-icons/lu';
import productService from '../../services/productService';
import { reviewService } from '../../services/dataService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import {
  formatPrice,
  formatDate,
  calculateDiscount,
  getInitials,
  handleImageError,
} from '../../utils/helpers';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';
import ProductCard from '../../components/product/ProductCard';
import Stars from '../../components/product/Stars';
import toast from 'react-hot-toast';

const ReviewForm = ({ productId, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim().length < 3) {
      toast.error('Please write a short comment');
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.createReview({ productId, rating, comment: comment.trim() });
      toast.success('Thank you for your review!');
      setComment('');
      onSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-surface space-y-3">
      <p className="text-sm font-semibold text-text">Write a review</p>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onClick={() => setRating(n)}
            className={`text-2xl leading-none ${n <= rating ? 'text-star' : 'text-border'}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What did you like about this product?"
        className="w-full p-3 bg-white border border-border rounded-lg text-sm resize-none focus:border-primary"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-text-muted">Only customers with a delivered order can review.</p>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      setLoading(true);
      // Reset per-product state when moving between products
      setSelectedImage(0);
      setQuantity(1);
      setRelated([]);

      try {
        const res = await productService.getProductBySlug(slug);
        if (!active) return;
        setProduct(res.data.data);
      } catch {
        if (active) setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      active = false;
    };
  }, [slug, reloadKey]);

  // Related products load separately so a failure doesn't hide the product
  useEffect(() => {
    if (!product?.id) return;
    let active = true;
    productService
      .getRelatedProducts(product.id)
      .then((res) => {
        if (active) setRelated(res.data.data || []);
      })
      .catch(() => {
        if (active) setRelated([]);
      });
    return () => {
      active = false;
    };
  }, [product?.id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background p-4 text-center">
        <LuPackageSearch className="w-14 h-14 text-text-muted" strokeWidth={1.3} />
        <h2 className="text-2xl font-bold text-text mt-4">Product Not Found</h2>
        <p className="text-text-light mt-1">This product doesn&apos;t exist or is no longer available.</p>
        <Link to="/products" className="mt-6 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl">
          Back to Shop
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: PLACEHOLDER_IMAGE }];
  const stockQuantity = product.inventory ? product.inventory.quantity : null;
  const inStock = stockQuantity === null || stockQuantity > 0;
  const maxQuantity = stockQuantity === null ? 99 : Math.max(stockQuantity, 1);
  const discount = calculateDiscount(product.comparePrice, product.price);
  const rating = Number(product.avgRating) || 0;
  const isAdmin = user?.role === 'ADMIN';
  const saved = isInWishlist(product.id);
  const reviews = product.reviews || [];

  const handleAddToCart = async () => {
    setAdding(true);
    await addToCart(product.id, quantity);
    setAdding(false);
  };

  return (
    <div className="bg-background py-8 min-h-screen">
      <div className="container-custom">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-text-muted mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/products?category=${product.category.slug}`} className="hover:text-primary">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-text font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-2xl p-5 sm:p-8 border border-border-light shadow-card">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square rounded-xl bg-surface overflow-hidden relative">
              <img
                src={images[selectedImage]?.url || PLACEHOLDER_IMAGE}
                alt={product.name}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-sale text-white text-xs font-bold px-3 py-1 rounded-md">
                  -{discount}%
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id || i}
                    onClick={() => setSelectedImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === i ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" onError={handleImageError} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.category && (
              <Link
                to={`/products?category=${product.category.slug}`}
                className="text-xs font-semibold text-primary-light uppercase tracking-wider hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark mt-1">{product.name}</h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-sm">
              <Stars rating={rating} className="w-4 h-4" />
              <span className="font-semibold text-text">{rating.toFixed(1)}</span>
              <a href="#reviews" className="text-text-muted hover:text-primary">
                ({product.totalReviews || 0} reviews)
              </a>
              <span className="text-border">|</span>
              <span className={`font-semibold ${inStock ? 'text-success' : 'text-error'}`}>
                {!inStock ? 'Out of stock' : stockQuantity === null ? 'In stock' : `${stockQuantity} in stock`}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-5">
              <span className="text-3xl font-bold text-price">{formatPrice(product.price)}</span>
              {discount > 0 && (
                <span className="text-base text-text-muted line-through">{formatPrice(product.comparePrice)}</span>
              )}
            </div>

            <p className="text-sm text-text-light leading-relaxed mt-4 whitespace-pre-line">{product.description}</p>

            <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface">
                <dt className="text-text-muted">Sold by</dt>
                <dd className="font-semibold text-text mt-0.5">{product.seller?.shopName || 'Nepalese Artisan'}</dd>
              </div>
              {product.estimatedDelivery && (
                <div className="p-3 rounded-lg bg-surface">
                  <dt className="text-text-muted">Estimated delivery</dt>
                  <dd className="font-semibold text-text mt-0.5">{product.estimatedDelivery}</dd>
                </div>
              )}
              {product.materials && (
                <div className="p-3 rounded-lg bg-surface sm:col-span-2">
                  <dt className="text-text-muted">Materials</dt>
                  <dd className="font-semibold text-text mt-0.5">{product.materials}</dd>
                </div>
              )}
              {product.dimensions && (
                <div className="p-3 rounded-lg bg-surface">
                  <dt className="text-text-muted">Dimensions</dt>
                  <dd className="font-semibold text-text mt-0.5">{product.dimensions}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 pt-6 border-t border-border-light space-y-4">
              {isAdmin ? (
                <div className="p-4 bg-sage/40 border border-sage-dark rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                      <LuSettings className="w-4 h-4" /> Admin view
                    </p>
                    <p className="text-xs text-text-light mt-0.5">Admin accounts can manage listings but not purchase.</p>
                  </div>
                  <Link
                    to="/admin/products"
                    className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg text-center"
                  >
                    Manage Products
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-light">Quantity</span>
                    <div className="flex items-center border border-border rounded-lg bg-surface">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="p-2.5 text-text hover:bg-white rounded-l-lg disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <LuMinus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold" aria-live="polite">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                        disabled={!inStock || quantity >= maxQuantity}
                        className="p-2.5 text-text hover:bg-white rounded-r-lg disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <LuPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={!inStock || adding}
                      className="flex-1 py-3.5 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <LuShoppingCart className="w-5 h-5" />
                      {!inStock ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-3.5 border rounded-xl transition-colors ${
                        saved ? 'bg-sale/10 border-sale/30 text-sale' : 'bg-white border-border text-text-light hover:text-sale'
                      }`}
                      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                      aria-pressed={saved}
                    >
                      <LuHeart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </>
              )}

              <ul className="grid grid-cols-3 gap-2 text-center text-[11px] text-text-light">
                <li className="p-2.5 rounded-lg bg-surface">
                  <LuShieldCheck className="w-5 h-5 mx-auto text-primary mb-1" strokeWidth={1.6} />
                  100% Authentic
                </li>
                <li className="p-2.5 rounded-lg bg-surface">
                  <LuTruck className="w-5 h-5 mx-auto text-primary mb-1" strokeWidth={1.6} />
                  Nepal-wide Shipping
                </li>
                <li className="p-2.5 rounded-lg bg-surface">
                  <LuRotateCcw className="w-5 h-5 mx-auto text-primary mb-1" strokeWidth={1.6} />
                  Easy Returns
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section id="reviews" className="mt-8 bg-white rounded-2xl p-5 sm:p-8 border border-border-light shadow-card scroll-mt-40">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="text-xl sm:text-2xl text-primary-dark">Customer Reviews</h2>
            <div className="flex items-center gap-2 text-sm">
              <Stars rating={rating} className="w-4 h-4" />
              <span className="font-semibold">{rating.toFixed(1)} / 5</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-text-light mb-5">No written reviews yet.</p>
          ) : (
            <ul className="divide-y divide-border-light mb-6">
              {reviews.map((review) => {
                const name = `${review.user?.firstName || ''} ${review.user?.lastName || ''}`.trim() || 'Customer';
                return (
                  <li key={review.id} className="py-4 flex gap-4">
                    <span className="w-10 h-10 shrink-0 rounded-full bg-sage text-primary text-sm font-bold flex items-center justify-center">
                      {getInitials(name)}
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text">
                        {name}
                        {review.isVerified && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-primary-light">
                            <LuBadgeCheck className="w-3.5 h-3.5" /> Verified purchase
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Stars rating={review.rating} />
                        <span className="text-[11px] text-text-muted">{formatDate(review.createdAt)}</span>
                      </div>
                      {review.comment && <p className="text-sm text-text-light mt-2 leading-relaxed">{review.comment}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {isAuthenticated && !isAdmin ? (
            <ReviewForm productId={product.id} onSubmitted={() => setReloadKey((k) => k + 1)} />
          ) : !isAuthenticated ? (
            <p className="text-sm text-text-light">
              <Link to="/auth/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>{' '}
              to write a review.
            </p>
          ) : null}
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl sm:text-2xl text-primary-dark mb-5">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {related.slice(0, 4).map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
