import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineTrash, HiOutlineArrowRight, HiOutlineShoppingBag } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from '../../utils/constants';
import { formatPrice, getProductImage, handleImageError } from '../../utils/helpers';

const Cart = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();
  const navigate = useNavigate();

  const [busyItemId, setBusyItemId] = useState(null);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || itemCount === 0 ? 0 : DELIVERY_FEE;
  const grandTotal = subtotal + deliveryFee;

  const changeQuantity = async (item, quantity) => {
    setBusyItemId(item.id);
    await updateQuantity(item.id, quantity);
    setBusyItemId(null);
  };

  const handleRemove = async (item) => {
    setBusyItemId(item.id);
    await removeItem(item.id);
    setBusyItemId(null);
  };

  const handleClear = () => {
    if (window.confirm('Remove all items from your cart?')) clearCart();
  };

  // Only block the page on the very first load; later refreshes update in place
  if (loading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-4 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
          <HiOutlineShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-text font-[Playfair_Display]">Your Cart is Empty</h2>
        <p className="text-sm text-text-light mt-1 max-w-sm">
          Looks like you haven&apos;t added any Nepalese handmade treasures to your cart yet.
        </p>
        <Link
          to="/products"
          className="mt-6 px-8 py-3 bg-primary text-white font-semibold rounded-xl shadow-md hover:bg-primary-dark transition-all"
        >
          Explore Artisans &amp; Crafts
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface py-10 min-h-screen">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-text mb-8 font-[Playfair_Display]">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-4 sm:p-6 border border-border-light flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={getProductImage(item.product)}
                    alt={item.product.name}
                    onError={handleImageError}
                    className="w-20 h-20 rounded-xl object-cover bg-surface shrink-0"
                  />
                  <div>
                    <Link
                      to={`/products/${item.product.slug}`}
                      className="font-bold text-text hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-text-muted mt-1">
                      {item.product.inventory && item.product.inventory.quantity < item.quantity
                        ? <span className="text-error font-semibold">Only {item.product.inventory.quantity} left in stock</span>
                        : `${formatPrice(item.product.price)} each`}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="flex items-center border border-border rounded-xl bg-surface">
                    <button
                      onClick={() => changeQuantity(item, item.quantity - 1)}
                      disabled={item.quantity <= 1 || busyItemId === item.id}
                      className="px-3 py-1 font-bold text-text hover:bg-white rounded-l-xl disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm font-semibold" aria-live="polite">{item.quantity}</span>
                    <button
                      onClick={() => changeQuantity(item, item.quantity + 1)}
                      disabled={
                        busyItemId === item.id ||
                        (item.product.inventory && item.quantity >= item.product.inventory.quantity)
                      }
                      className="px-3 py-1 font-bold text-text hover:bg-white rounded-r-xl disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-bold text-text text-sm sm:w-24 text-right">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => handleRemove(item)}
                    disabled={busyItemId === item.id}
                    className="p-2 text-text-muted hover:text-error transition-colors disabled:opacity-40"
                    title="Remove item"
                    aria-label={`Remove ${item.product.name}`}
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={handleClear}
                className="text-xs font-semibold text-error hover:underline"
              >
                Clear Entire Cart
              </button>
              <Link to="/products" className="text-xs font-semibold text-primary hover:underline">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 border border-border-light h-fit shadow-card space-y-4">
            <h3 className="text-lg font-bold text-text font-[Playfair_Display]">Order Summary</h3>

            <div className="space-y-2.5 text-sm border-b border-border-light pb-4">
              <div className="flex justify-between text-text-light">
                <span>Subtotal</span>
                <span className="font-semibold text-text">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-light">
                <span>Delivery Charge (Nepal)</span>
                <span className="font-semibold text-text">
                  {deliveryFee === 0 ? (
                    <span className="text-success font-bold">FREE</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>
              {subtotal < FREE_DELIVERY_THRESHOLD && (
                <p className="text-[11px] text-text-muted italic">
                  Add {formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery.
                </p>
              )}
            </div>

            <div className="flex justify-between items-center text-lg font-bold text-text">
              <span>Grand Total</span>
              <span className="text-primary">{formatPrice(grandTotal)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              Proceed to Checkout
              <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
