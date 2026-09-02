import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineTruck, HiOutlineRefresh } from 'react-icons/hi';
import { adminService } from '../../services/dataService';
import { formatPrice } from '../../utils/helpers';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  'PENDING', 'CONFIRMED', 'PREPARING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
];

const statusColor = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-indigo-100 text-indigo-700',
  PACKED: 'bg-cyan-100 text-cyan-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const statusSteps = ['PENDING', 'CONFIRMED', 'PREPARING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filterStatus) params.status = filterStatus;
      const res = await adminService.getAllOrders(params);
      setOrders(res.data.data.orders || []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const handleStatusUpdate = async (orderId, newStatus, extra = {}) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus, ...extra });
      toast.success(`Order updated to ${newStatus.replace(/_/g, ' ')}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (current) => {
    const idx = statusSteps.indexOf(current);
    if (idx < 0 || idx >= statusSteps.length - 1) return null;
    return statusSteps[idx + 1];
  };

  const getStepIndex = (status) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface py-8 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link to="/admin/dashboard" className="text-xs text-primary font-semibold hover:underline">← Back to Dashboard</Link>
            <h1 className="text-2xl font-bold text-text font-[Playfair_Display] mt-1">Order Management & Delivery Tracking</h1>
            <p className="text-xs text-text-muted mt-0.5">{orders.length} orders</p>
          </div>
          <button onClick={fetchOrders} className="p-2 rounded-xl bg-white border border-border hover:bg-surface transition-colors" title="Refresh">
            <HiOutlineRefresh className="w-5 h-5 text-text-light" />
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${!filterStatus ? 'bg-primary text-white' : 'bg-white border border-border text-text-light hover:border-primary'}`}>
            All
          </button>
          {ORDER_STATUSES.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === s ? 'bg-primary text-white' : 'bg-white border border-border text-text-light hover:border-primary'}`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border-light p-12 text-center text-text-muted">
              No orders found
            </div>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const nextStatus = getNextStatus(order.status);
              const currentStep = getStepIndex(order.status);

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
                  {/* Order Header Row */}
                  <div
                    className="p-5 cursor-pointer hover:bg-surface/30 transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-bold text-text text-sm">{order.orderNumber}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            {order.user?.firstName} {order.user?.lastName} • {order.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface text-text-muted">
                          {order.payment?.method || 'N/A'}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        <span className="font-bold text-primary text-sm">{formatPrice(order.grandTotal)}</span>
                        <span className="text-text-muted text-[10px]">
                          {new Date(order.createdAt).toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Panel */}
                  {isExpanded && (
                    <div className="border-t border-border-light p-5 bg-surface/20">
                      {/* Delivery Progress Tracker */}
                      <div className="mb-6">
                        <h4 className="font-bold text-xs text-text-light uppercase tracking-wider mb-4 flex items-center gap-2">
                          <HiOutlineTruck className="w-4 h-4" /> Delivery Progress
                        </h4>
                        <div className="flex items-center gap-0 overflow-x-auto pb-2">
                          {statusSteps.map((step, idx) => {
                            const isCompleted = idx <= currentStep;
                            const isCurrent = idx === currentStep;
                            return (
                              <div key={step} className="flex items-center">
                                <div className="flex flex-col items-center min-w-[80px]">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                                    isCompleted
                                      ? isCurrent
                                        ? 'bg-primary border-primary text-white scale-110 shadow-md'
                                        : 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'bg-white border-border-light text-text-muted'
                                  }`}>
                                    {isCompleted && !isCurrent ? '✓' : idx + 1}
                                  </div>
                                  <p className={`text-[9px] mt-1.5 font-semibold text-center leading-tight ${
                                    isCurrent ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-text-muted'
                                  }`}>
                                    {step.replace(/_/g, '\n')}
                                  </p>
                                </div>
                                {idx < statusSteps.length - 1 && (
                                  <div className={`w-8 h-0.5 -mt-4 ${idx < currentStep ? 'bg-emerald-400' : 'bg-border-light'}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <h4 className="font-bold text-xs text-text-light uppercase tracking-wider mb-2">Order Items</h4>
                        <div className="text-xs text-text-light">
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex justify-between py-1">
                              <span>{item.quantity}x items</span>
                              <span className="font-bold text-text">{formatPrice(item.total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipment Info */}
                      {order.shipment && (
                        <div className="mb-4 p-3 bg-white rounded-xl border border-border-light">
                          <h4 className="font-bold text-xs text-text-light uppercase tracking-wider mb-2">Shipment Details</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-text-muted">Tracking:</span> <span className="font-bold text-text">{order.shipment.trackingNumber || 'Not assigned'}</span></div>
                            <div><span className="text-text-muted">Courier:</span> <span className="font-bold text-text">{order.shipment.courierName || 'Not assigned'}</span></div>
                            <div><span className="text-text-muted">Shipment Status:</span> <span className="font-bold text-text">{order.shipment.status}</span></div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border-light">
                          {nextStatus && (
                            <button
                              onClick={() => handleStatusUpdate(order.id, nextStatus)}
                              disabled={updatingId === order.id}
                              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {updatingId === order.id ? (
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <HiOutlineTruck className="w-3.5 h-3.5" />
                              )}
                              Advance to {nextStatus.replace(/_/g, ' ')}
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                            disabled={updatingId === order.id}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl text-xs transition-all disabled:opacity-50"
                          >
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
