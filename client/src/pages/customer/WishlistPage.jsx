import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHeart, HiOutlineTrash, HiOutlineShoppingBag } from 'react-icons/hi';
import { wishlistService } from '../../services/dataService';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchWishlist = async () => {
    try {
      const res = await wishlistService.getWishlist();
      setWishlist(res.data.data);
    } catch {
      setWishlist(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await wishlistService.moveToCart(productId);
      toast.success('Moved to cart!');
      fetchWishlist();
    } catch {
      toast.error('Failed to move to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const items = wishlist?.items || [];

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
                      src={item.product?.images?.[0]?.url || 'https://placehold.co/400x400'}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-error hover:bg-error hover:text-white transition-all shadow-sm"
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
                    className="w-full py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
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
