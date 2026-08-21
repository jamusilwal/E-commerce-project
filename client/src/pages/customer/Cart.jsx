import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineTrash, HiOutlineArrowRight, HiOutlineShoppingBag } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/helpers';

const Cart = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();
  const navigate = useNavigate();

  const deliveryFee = subtotal >= 5000 || itemCount === 0 ? 0 : 150;
  const grandTotal = subtotal + deliveryFee;

  if (loading) {
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
                    src={item.product.images?.[0]?.url || 'https://placehold.co/100x100'}
                    alt={item.product.name}
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
                      Seller: {item.product.seller?.shopName || 'Nepalese Artisan'}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="flex items-center border border-border rounded-xl bg-surface">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-1 font-bold text-text hover:bg-white rounded-l-xl"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 font-bold text-text hover:bg-white rounded-r-xl"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-bold text-text text-sm sm:w-24 text-right">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-text-muted hover:text-error transition-colors"
                    title="Remove Item"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={clearCart}
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
              {subtotal < 5000 && (
                <p className="text-[11px] text-text-muted italic">
                  Free delivery on orders over NPR 5,000!
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
