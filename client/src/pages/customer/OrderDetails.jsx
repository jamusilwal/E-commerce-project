import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiOutlineCheckCircle,
  HiOutlineDownload,
  HiOutlineXCircle,
} from 'react-icons/hi';
import { orderService, paymentService } from '../../services/dataService';
import { formatPrice, formatDateTime, getStatusColor, getProductImage, handleImageError } from '../../utils/helpers';
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
  const [downloadingBill, setDownloadingBill] = useState(false);
  const [paying, setPaying] = useState(false);

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

  const handleRetryPayment = async () => {
    setPaying(true);
    try {
      if (order.payment?.method === 'ESEWA') {
        const res = await paymentService.initiateEsewa(order.id);
        const data = res.data.data;
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.gateway_url;
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'gateway_url') return;
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }
      const res = await paymentService.initiateKhalti(order.id);
      window.location.href = res.data.data.paymentUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start payment');
      setPaying(false);
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

  const handleOpenWhatsApp = () => {
    const itemsText = (order.items || [])
      .map((item) => `  • ${item.quantity}x ${item.product?.name || 'Item'} (Rs. ${item.total || item.price * item.quantity})`)
      .join('\n');

    const message = encodeURIComponent(
      `🛍️ *HAMROLOK BAZAR — Order Details*\n\n` +
      `📦 *Order Number:* #${order.orderNumber}\n` +
      `👤 *Customer:* ${order.address?.fullName || 'Customer'}\n` +
      `💳 *Payment:* ${order.payment?.method || 'N/A'} (${order.payment?.status || 'PENDING'})\n` +
      `💰 *Grand Total:* Rs. ${Number(order.grandTotal || 0).toLocaleString('en-NP')}\n\n` +
      `🛒 *Items:*\n${itemsText}\n\n` +
      `📍 *Delivery Address:* ${order.address?.municipality || ''}, ${order.address?.district || 'Nepal'}\n` +
      `🔗 *Track Order:* ${window.location.origin}/orders/${order.id}\n\n` +
      `_Dhanyabad for shopping with HAMROLOK BAZAR!_`
    );

    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleDownloadBill = async () => {
    try {
      setDownloadingBill(true);
      const res = await orderService.downloadBill(order.id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `HLB-${order.orderNumber}-Invoice.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Bill downloaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download bill');
    } finally {
      setDownloadingBill(false);
    }
  };

  // Bill is available for confirmed and beyond (not PENDING or CANCELLED)
  const billAvailable = !['PENDING', 'CANCELLED'].includes(order.status);

  // Online payments that never completed can be retried from here
  const canRetryPayment =
    !isCancelled &&
    ['ESEWA', 'KHALTI'].includes(order.payment?.method) &&
    order.payment?.status !== 'COMPLETED';

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

          <div className="flex items-center gap-3 flex-wrap">
            {billAvailable && (
              <button
                onClick={handleDownloadBill}
                disabled={downloadingBill}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download PDF Invoice"
              >
                <HiOutlineDownload className="w-4 h-4" />
                <span>{downloadingBill ? 'Generating...' : 'Download Bill'}</span>
              </button>
            )}
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
              title="Generate and open WhatsApp message with order details"
            >
              <span>📱</span>
              <span>Send to WhatsApp</span>
            </button>
            {canRetryPayment && (
              <button
                onClick={handleRetryPayment}
                disabled={paying}
                className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {paying ? 'Redirecting…' : `Complete Payment (${order.payment.method})`}
              </button>
            )}
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
                        src={getProductImage(item.product)}
                        alt={item.product?.name}
                        onError={handleImageError}
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
                {[
                  order.address?.street,
                  order.address?.ward ? `${order.address.municipality}-${order.address.ward}` : order.address?.municipality,
                  order.address?.district,
                  order.address?.province,
                ]
                  .filter(Boolean)
                  .join(', ')}
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
                <span
                  className={`font-bold ${
                    order.payment?.status === 'COMPLETED'
                      ? 'text-success'
                      : order.payment?.status === 'FAILED'
                        ? 'text-error'
                        : 'text-warning'
                  }`}
                >
                  {order.payment?.status || 'PENDING'}
                </span>
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
                {order.discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
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
