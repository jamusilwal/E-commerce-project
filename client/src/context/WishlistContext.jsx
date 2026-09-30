import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services/dataService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const canUseWishlist = isAuthenticated && user?.role !== 'ADMIN';

  const fetchWishlist = useCallback(async () => {
    if (!canUseWishlist) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await wishlistService.getWishlist();
      setItems(res.data.data?.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [canUseWishlist]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId) => items.some((item) => item.productId === productId),
    [items]
  );

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to save items to your wishlist');
      return false;
    }
    if (user?.role === 'ADMIN') {
      toast.error('Admin accounts do not have a wishlist');
      return false;
    }
    try {
      await wishlistService.addToWishlist(productId);
      toast.success('Saved to wishlist');
      await fetchWishlist();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      toast.success('Removed from wishlist');
      await fetchWishlist();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
      return false;
    }
  };

  const toggleWishlist = (productId) =>
    isInWishlist(productId) ? removeFromWishlist(productId) : addToWishlist(productId);

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        loading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
