import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LuArrowLeft, LuRefreshCw, LuTruck, LuPackage } from 'react-icons/lu';
import { sellerService } from '../../services/dataService';
import { formatPrice, formatDateTime, getStatusColor, getProductImage, handleImageError } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const FILTERS = ['', ...STATUS_FLOW, 'CANCELLED'];
const PAGE_SIZE = 20;

const label = (status) => status.replace(/_/g, ' ');

/** The API returns one row per order item; group them back into orders */
const groupByOrder = (orderItems) => {
  const map = new Map();
  orderItems.forEach((item) => {
    if (!item.order) return;
    if (!map.has(item.order.id)) map.set(item.order.id, { ...item.order, sellerItems: [] });
    map.get(item.order.id).sellerItems.push(item);
  });
  return [...map.values()];
};

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sellerService.getOrders({ page, limit: PAGE_SIZE, status: status || undefined });
      setOrders(groupByOrder(res.data.data.orders || []));
      setPages(res.data.data.pagination?.pages || 1);
    } catch (err) {
      setOrders([]);
      toast.error(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (order, newStatus) => {
    const extra = {};
    if (newStatus === 'CANCELLED' && !window.confirm(`Cancel order ${order.orderNumber}?`)) return;
    if (newStatus === 'SHIPPED') {
      const tracking = window.prompt('Tracking number (optional):', order.shipment?.trackingNumber || '');
      if (tracking === null) return;
      if (tracking.trim()) extra.trackingNumber = tracking.trim();
    }

    setUpdatingId(order.id);
    try {
      await sellerService.updateOrderStatus(order.id, { status: newStatus, ...extra });
      toast.success(`Order marked ${label(newStatus).toLowerCase()}`);
      await fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-background py-8 min-h-screen">
      <div className="container-custom">
        <Link
          to="/seller/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary"
        >
          <LuArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
        <div className="flex items-center justify-between gap-4 mt-2 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark">Orders</h1>
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-white border border-border hover:bg-surface"
            aria-label="Refresh orders"
          >
            <LuRefreshCw className="w-4 h-4 text-text-light" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                status === s ? 'bg-primary text-white' : 'bg-white border border-border text-text-light hover:border-primary'
              }`}
            >
              {s ? label(s) : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-light p-12 text-center">
            <LuPackage className="w-12 h-12 mx-auto text-text-muted" strokeWidth={1.4} />
            <h3 className="text-lg font-bold text-text mt-4">No orders {status ? `with status “${label(status)}”` : 'yet'}</h3>
            <p className="text-sm text-text-light mt-1">Orders for your products will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const idx = STATUS_FLOW.indexOf(order.status);
              const next = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
              const closed = order.status === 'DELIVERED' || order.status === 'CANCELLED';
              const sellerTotal = order.sellerItems.reduce((sum, item) => sum + (item.total || 0), 0);
              const address = order.address;

              return (
                <article key={order.id} className="bg-white rounded-2xl border border-border-light shadow-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-text">{order.orderNumber}</p>
                      <p className="text-xs text-text-muted mt-0.5">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface text-text-light">
                        {order.payment?.method} · {order.payment?.status}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                        {label(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-5 mt-4">
                    <ul className="space-y-3 min-w-0">
                      {order.sellerItems.map((item) => (
                        <li key={item.id} className="flex items-center gap-3">
                          <img
                            src={getProductImage(item.product)}
                            alt=""
                            onError={handleImageError}
                            className="w-12 h-12 rounded-lg object-cover bg-surface"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text truncate">{item.product?.name}</p>
                            <p className="text-xs text-text-muted">Qty {item.quantity}</p>
                          </div>
                          <span className="text-sm font-bold text-text">{formatPrice(item.total)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between text-sm pt-2 border-t border-border-light">
                        <span className="text-text-light">Your items total</span>
                        <span className="font-bold text-price">{formatPrice(sellerTotal)}</span>
                      </li>
                    </ul>

                    <div className="text-xs text-text-light bg-surface rounded-xl p-4 space-y-1">
                      <p className="font-semibold text-text text-sm">
                        {address?.fullName || `${order.user?.firstName || ''} ${order.user?.lastName || ''}`}
                      </p>
                      {address?.phone && <p>{address.phone}</p>}
                      {address && (
                        <p>
                          {[address.street, address.municipality, address.district, address.province]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                      {order.shipment?.trackingNumber && (
                        <p className="pt-1">
                          Tracking: <span className="font-semibold text-text">{order.shipment.trackingNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {!closed && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border-light">
                      {next && (
                        <button
                          onClick={() => updateStatus(order, next)}
                          disabled={updatingId === order.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                        >
                          <LuTruck className="w-3.5 h-3.5" />
                          Mark as {label(next).toLowerCase()}
                        </button>
                      )}
                      {['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status) && (
                        <button
                          onClick={() => updateStatus(order, 'CANCELLED')}
                          disabled={updatingId === order.id}
                          className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error text-xs font-semibold rounded-lg disabled:opacity-50"
                        >
                          Cancel order
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {!loading && pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-white disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-text-muted">
              Page {page} of {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
