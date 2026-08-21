import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineTruck,
  HiOutlineDownload,
  HiOutlineXCircle,
} from 'react-icons/hi';
import { orderService } from '../../services/dataService';
import { formatPrice, formatDateTime, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const trackingSteps = [
  { status: 'PENDING', label: 'Order Placed' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'PACKED', label: 'Packed' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { status: 'DELIVERED', label: 'Delivered' },
];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderById(id);
        setOrder(res.data.data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancelOrder(id, 'Cancelled by user from order page');
      toast.success('Order cancelled');
      const res = await orderService.getOrderById(id);
      setOrder(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-4 text-center">
        <h2 className="text-xl font-bold text-text">Order Not Found</h2>
        <Link to="/orders" className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded-xl text-xs">
          View All Orders
        </Link>
      </div>
    );
  }

  // Calculate tracking progress index
  const currentStepIndex = trackingSteps.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="bg-surface py-10 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-text-muted">Order Details</span>
            <h1 className="text-2xl font-bold text-text font-[Playfair_Display]">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-text-light mt-0.5">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
              {order.status.replace(/_/g, ' ')}
            </span>
            {['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status) && (
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-error/10 hover:bg-error text-error hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Live Tracking Progress Bar */}
        {!isCancelled ? (
          <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm mb-8">
            <h3 className="text-sm font-bold text-text mb-6">Live Order Tracking</h3>
            <div className="flex items-center justify-between relative overflow-x-auto pb-4">
              {trackingSteps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center min-w-[80px] z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-surface text-text-muted border border-border'
                      } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                    >
                      {isCompleted ? <HiOutlineCheckCircle className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] mt-2 text-center font-medium ${isCompleted ? 'text-primary font-bold' : 'text-text-muted'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-error/5 border border-error/20 rounded-2xl p-6 mb-8 text-center text-error">
            <HiOutlineXCircle className="w-10 h-10 mx-auto mb-2" />
            <h3 className="font-bold text-lg">This order has been cancelled</h3>
            <p className="text-xs mt-1 text-error/80">{order.cancelReason || 'Cancelled'}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
              <h3 className="font-bold text-text mb-4">Ordered Items</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-border-light pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product?.images?.[0]?.url || 'https://placehold.co/80x80'}
                        alt={item.product?.name}
                        className="w-16 h-16 rounded-xl object-cover bg-surface"
                      />
                      <div>
                        <Link
                          to={`/products/${item.product?.slug}`}
                          className="font-bold text-sm text-text hover:text-primary transition-colors"
                        >
                          {item.product?.name}
                        </Link>
                        <p className="text-xs text-text-muted mt-0.5">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-text">
                      {formatPrice(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
              <h4 className="font-bold text-text text-sm mb-3">Shipping Address</h4>
              <p className="text-xs font-semibold text-text">{order.address?.fullName}</p>
              <p className="text-xs text-text-light mt-1">Ph: {order.address?.phone}</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                {order.address?.municipality}-{order.address?.ward}, {order.address?.district},{' '}
                {order.address?.province}
              </p>
            </div>

            {/* Payment & Summary */}
            <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-3">
              <h4 className="font-bold text-text text-sm mb-3">Payment Summary</h4>
              <div className="flex justify-between text-xs text-text-light">
                <span>Payment Method</span>
                <span className="font-bold text-text">{order.payment?.method}</span>
              </div>
              <div className="flex justify-between text-xs text-text-light">
                <span>Payment Status</span>
                <span className="font-bold text-success">{order.payment?.status}</span>
              </div>
              <div className="border-t border-border-light pt-3 space-y-1.5 text-xs text-text-light">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>{order.deliveryCharge === 0 ? 'FREE' : formatPrice(order.deliveryCharge)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-text border-t border-border-light pt-2">
                  <span>Grand Total</span>
                  <span className="text-primary">{formatPrice(order.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
