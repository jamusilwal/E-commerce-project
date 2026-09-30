import { Link } from 'react-router-dom';
import { LuShoppingCart, LuHeart } from 'react-icons/lu';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, calculateDiscount, getProductImage, handleImageError } from '../../utils/helpers';
import Stars from './Stars';

/**
 * Product card used by the home carousel and the shop grid.
 * `className` controls sizing (e.g. fixed carousel widths).
 */
const ProductCard = ({ product, className = '' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAdmin } = useAuth();

  const price = Number(product.price) || 0;
  const comparePrice = Number(product.comparePrice) || 0;
  const discount = calculateDiscount(comparePrice, price);
  const rating = Number(product.avgRating) || 0;
  const stock = product.inventory?.quantity;
  const outOfStock = stock !== undefined && stock !== null && stock <= 0;
  const saved = isInWishlist(product.id);

  return (
    <article
      className={`group flex flex-col bg-white rounded-xl border border-border-light hover:border-border hover:shadow-card-hover transition-all ${className}`}
    >
      <div className="relative m-2 mb-0">
        <Link
          to={`/products/${product.slug}`}
          className="block aspect-square rounded-lg bg-surface overflow-hidden"
        >
          <img
            src={getProductImage(product)}
            alt={product.name}
            loading="lazy"
            onError={handleImageError}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              outOfStock ? 'opacity-60' : ''
            }`}
          />
        </Link>
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-sale text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
            -{discount}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute bottom-2.5 left-2.5 bg-text/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
            Out of stock
          </span>
        )}
        {!isAdmin && (
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center transition-colors ${
              saved ? 'text-sale' : 'text-text-light hover:text-sale'
            }`}
            aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            aria-pressed={saved}
          >
            <LuHeart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="flex flex-col flex-1 p-3.5 pt-3">
        {product.category?.name && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1 truncate">
            {product.category.name}
          </p>
        )}
        <Link
          to={`/products/${product.slug}`}
          className="text-[13px] font-semibold text-text leading-snug line-clamp-2 min-h-[2.5em] hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5 mt-2">
          <Stars rating={rating} />
          <span className="text-[11px] text-text-muted">({(product.totalReviews || 0).toLocaleString()})</span>
        </div>
        <div className="flex items-end justify-between gap-2 mt-auto pt-3">
          <div className="leading-tight min-w-0">
            <p className="text-[15px] font-bold text-price">{formatPrice(price)}</p>
            {discount > 0 && (
              <p className="text-[11px] text-text-muted line-through">{formatPrice(comparePrice)}</p>
            )}
          </div>
          {!isAdmin && (
            <button
              type="button"
              onClick={() => addToCart(product.id, 1)}
              disabled={outOfStock}
              className="w-9 h-9 shrink-0 rounded-lg bg-primary hover:bg-primary-light text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={`Add ${product.name} to cart`}
            >
              <LuShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
