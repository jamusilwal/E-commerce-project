import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineStar,
  HiOutlineShoppingBag,
  HiOutlineHeart,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
} from 'react-icons/hi';
import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getProductBySlug(slug);
        const prod = res.data.data;
        setProduct(prod);

        // Fetch related products
        if (prod?.id) {
          const relRes = await productService.getRelatedProducts(prod.id);
          setRelated(relRes.data.data);
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-4 text-center">
        <span className="text-5xl">🏺</span>
        <h2 className="text-2xl font-bold text-text mt-4">Product Not Found</h2>
        <p className="text-text-light mt-1">The product you are looking for does not exist.</p>
        <Link to="/products" className="mt-6 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : [{ url: 'https://placehold.co/600x600/F8F4EC/8B1E3F?text=Handmade+Product' }];

  const stockQuantity = product.inventory?.quantity ?? 0;

  return (
    <div className="bg-surface py-10 min-h-screen">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="text-text font-medium">{product.name}</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl p-6 sm:p-10 border border-border-light shadow-card">
          {/* Left: Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl bg-surface overflow-hidden border border-border-light relative">
              <img
                src={images[selectedImage]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.comparePrice > product.price && (
                <span className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  SAVE {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === i ? 'border-primary shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                {product.category?.name}
              </span>
              <h1 className="text-3xl font-bold text-text mt-1 font-[Playfair_Display]">
                {product.name}
              </h1>

              {/* Artisan / Seller Badge */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-light">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                  {product.seller?.shopName?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="text-xs text-text-muted">Artisan / Seller</p>
                  <p className="text-sm font-semibold text-text">{product.seller?.shopName || 'Nepalese Craftsman'}</p>
                </div>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1 text-accent">
                  <HiOutlineStar className="w-5 h-5 fill-current" />
                  <span className="font-bold text-text text-sm">
                    {product.avgRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-text-muted">
                  ({product.totalReviews || 0} reviews)
                </span>
                <span className="text-xs text-text-muted">•</span>
                <span className="text-xs font-semibold text-success">
                  {stockQuantity > 0 ? `${stockQuantity} in stock` : 'Out of Stock'}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-6">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice > product.price && (
                  <span className="text-base text-text-muted line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-text-light leading-relaxed mt-4">
                {product.description}
              </p>

              {/* Materials */}
              {product.materials && (
                <div className="mt-4 p-3 bg-surface rounded-xl border border-border-light text-xs text-text-light">
                  <strong className="text-text font-semibold">Materials Used: </strong>
                  {product.materials}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-6 border-t border-border-light">
              {/* Quantity selector */}
              <div className="flex items-center gap-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-light">
                  Quantity
                </label>
                <div className="flex items-center border border-border rounded-xl bg-surface">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-text hover:bg-white rounded-l-xl font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                    className="px-3 py-1.5 text-text hover:bg-white rounded-r-xl font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => addToCart(product.id, quantity)}
                  disabled={stockQuantity === 0}
                  className="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <HiOutlineShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  className="p-3.5 bg-surface hover:bg-primary/5 text-primary border border-border rounded-xl transition-all"
                  title="Add to Wishlist"
                >
                  <HiOutlineHeart className="w-5 h-5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 text-center text-[11px] text-text-light">
                <div className="p-2 rounded-xl bg-surface">
                  <HiOutlineShieldCheck className="w-5 h-5 mx-auto text-primary mb-1" />
                  100% Authentic
                </div>
                <div className="p-2 rounded-xl bg-surface">
                  <HiOutlineTruck className="w-5 h-5 mx-auto text-primary mb-1" />
                  Nepal-wide Shipping
                </div>
                <div className="p-2 rounded-xl bg-surface">
                  <HiOutlineRefresh className="w-5 h-5 mx-auto text-primary mb-1" />
                  Supports Artisans
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-text mb-6 font-[Playfair_Display]">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/products/${rel.slug}`}
                  className="bg-white rounded-2xl p-4 border border-border-light hover:shadow-card-hover transition-all"
                >
                  <div className="aspect-square bg-surface rounded-xl overflow-hidden mb-3">
                    <img
                      src={rel.images?.[0]?.url || 'https://placehold.co/400x400/F8F4EC/8B1E3F?text=Handmade'}
                      alt={rel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-text text-sm line-clamp-1">{rel.name}</h4>
                  <p className="text-primary font-bold text-sm mt-1">{formatPrice(rel.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
