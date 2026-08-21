import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineChevronRight } from 'react-icons/hi';
import { orderService } from '../../services/dataService';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        setOrders(res.data.data.orders);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
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
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
              <HiOutlineShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-text">No Orders Placed Yet</h3>
            <p className="text-sm text-text-light mt-1">
              Start supporting Nepalese artisans today!
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block px-6 py-2.5 bg-primary text-white font-semibold rounded-xl text-xs"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 border border-border-light shadow-sm hover:shadow-card-hover transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-text text-base">{order.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Placed on {formatDate(order.createdAt)} • {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                  </p>
                  <p className="text-sm font-bold text-primary mt-2">
                    {formatPrice(order.grandTotal)}
                  </p>
                </div>

                <Link
                  to={`/orders/${order.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline self-start sm:self-center"
                >
                  View Details &amp; Tracking
                  <HiOutlineChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
