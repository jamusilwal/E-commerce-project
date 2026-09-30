import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineTrash, HiOutlineShoppingBag } from 'react-icons/hi';
import { wishlistService } from '../../services/dataService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice, getProductImage, handleImageError } from '../../utils/helpers';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { items, loading, removeFromWishlist, fetchWishlist } = useWishlist();
  const { fetchCart } = useCart();
  const [busyId, setBusyId] = useState(null);

  // Always show fresh data when the page opens
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    setBusyId(productId);
    await removeFromWishlist(productId);
    setBusyId(null);
  };

  const handleMoveToCart = async (productId) => {
    setBusyId(productId);
    try {
      await wishlistService.moveToCart(productId);
      toast.success('Moved to cart!');
      await Promise.all([fetchWishlist(), fetchCart()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to move to cart');
    } finally {
      setBusyId(null);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface py-10 min-h-screen">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-text mb-8 font-[Playfair_Display]">
          My Wishlist ({items.length})
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <HiOutlineHeart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-text">Your Wishlist is Empty</h3>
            <p className="text-sm text-text-light mt-1">
              Save your favorite Nepalese handmade items to view or purchase later.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block px-6 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-surface relative">
                    <img
                      src={getProductImage(item.product)}
                      alt={item.product?.name}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={busyId === item.productId}
                      aria-label={`Remove ${item.product?.name} from wishlist`}
                      className="disabled:opacity-50 absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-error hover:bg-error hover:text-white transition-all shadow-sm"
                      title="Remove"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    <Link
                      to={`/products/${item.product?.slug}`}
                      className="font-bold text-text text-sm hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.product?.name}
                    </Link>
                    <p className="text-primary font-bold text-sm mt-1">
                      {formatPrice(item.product?.price)}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleMoveToCart(item.productId)}
                    disabled={busyId === item.productId}
                    className="disabled:opacity-50 w-full py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <HiOutlineShoppingBag className="w-4 h-4" />
                    Move to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
