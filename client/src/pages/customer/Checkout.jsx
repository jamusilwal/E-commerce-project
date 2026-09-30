import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { HiOutlineCheckCircle, HiOutlineCreditCard, HiOutlineLocationMarker } from 'react-icons/hi';
import { addressService, orderService, paymentService } from '../../services/dataService';
import { useCart } from '../../context/CartContext';
import { PROVINCES, PAYMENT_METHODS, FREE_DELIVERY_THRESHOLD, DELIVERY_FEE } from '../../utils/constants';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, subtotal, loading: cartLoading, fetchCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.COD);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addressesLoading, setAddressesLoading] = useState(true);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const grandTotal = subtotal + deliveryFee;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Load user shipping addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await addressService.getAddresses();
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        setAddresses(list);
        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowAddressForm(true);
        }
      } catch {
        setShowAddressForm(true);
      } finally {
        setAddressesLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleAddAddress = async (data) => {
    try {
      const res = await addressService.createAddress({
        fullName: data.fullName,
        phone: data.phone,
        province: data.province,
        district: data.district,
        municipality: data.municipality,
        ward: data.ward || undefined,
        street: data.street || undefined,
        isDefault: addresses.length === 0,
      });
      const newAddr = res.data.data;
      setAddresses([newAddr, ...addresses]);
      setSelectedAddressId(newAddr.id);
      setShowAddressForm(false);
      reset();
      toast.success('Address saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  /**
   * Submit eSewa POST form dynamically
   */
  const submitEsewaForm = (formData) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = formData.gateway_url;

    Object.keys(formData).forEach((key) => {
      if (key !== 'gateway_url') {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
      }
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a shipping address');
      return;
    }

    setIsSubmitting(true);
    let order = null;
    let toastId;
    try {
      // 1. Create order (the server empties the cart once the order exists)
      const orderRes = await orderService.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
      });
      order = orderRes.data.data;

      // 2. Handle Payment Gateway Flows
      if (paymentMethod === PAYMENT_METHODS.ESEWA) {
        toastId = toast.loading('Redirecting to eSewa…');
        const payRes = await paymentService.initiateEsewa(order.id);
        submitEsewaForm(payRes.data.data);
        return;
      }

      if (paymentMethod === PAYMENT_METHODS.KHALTI) {
        toastId = toast.loading('Redirecting to Khalti…');
        const payRes = await paymentService.initiateKhalti(order.id);
        window.location.href = payRes.data.data.paymentUrl;
        return;
      }

      // COD Flow
      toast.success('Order placed successfully!');
      await fetchCart();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      if (toastId) toast.dismiss(toastId);
      if (order) {
        // The order exists but the gateway could not be reached
        toast.error(err.response?.data?.message || 'Payment could not be started. You can retry from your order.');
        await fetchCart();
        navigate(`/orders/${order.id}`);
      } else {
        toast.error(err.response?.data?.message || 'Failed to place order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (name) =>
    errors[name] ? <p className="text-xs text-error mt-1">{errors[name].message}</p> : null;

  const inputClass = (name) =>
    `w-full p-2.5 bg-surface border rounded-xl text-sm focus:border-primary ${
      errors[name] ? 'border-error' : 'border-border'
    }`;

  const payLabel = {
    [PAYMENT_METHODS.ESEWA]: 'Pay with eSewa',
    [PAYMENT_METHODS.KHALTI]: 'Pay with Khalti',
    [PAYMENT_METHODS.COD]: 'Place Order (Cash on Delivery)',
  };

  if (cartLoading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4 text-center">
        <div>
          <h2 className="text-xl font-bold text-text">No items in checkout</h2>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded-xl text-sm"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface py-10 min-h-screen">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-text mb-8 font-[Playfair_Display]">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text text-lg flex items-center gap-2">
                  <HiOutlineLocationMarker className="w-5 h-5 text-primary" />
                  1. Shipping Address
                </h3>
                {addresses.length > 0 && !showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {/* Address selector */}
              {!showAddressForm && addresses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <button
                      type="button"
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      aria-pressed={selectedAddressId === addr.id}
                      className={`text-left p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border-light hover:border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-text">{addr.fullName}</span>
                        {selectedAddressId === addr.id && (
                          <HiOutlineCheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-text-light mt-1">Ph: {addr.phone}</p>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        {[addr.street, addr.ward ? `${addr.municipality}-${addr.ward}` : addr.municipality, addr.district, addr.province]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* Add address form */}
              {showAddressForm && (
                <form onSubmit={handleSubmit(handleAddAddress)} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-light mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className={inputClass('fullName')}
                        {...register('fullName', { required: 'Full name is required' })}
                      />
                      {fieldError('fullName')}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-light mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="9800000000"
                        className={inputClass('phone')}
                        {...register('phone', {
                          required: 'Mobile number is required',
                          pattern: {
                            value: /^(\+977)?9[6-9]\d{8}$/,
                            message: 'Enter a valid Nepali mobile number (e.g. 9800000000)',
                          },
                        })}
                      />
                      {fieldError('phone')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-light mb-1">
                        Province
                      </label>
                      <select
                        className={inputClass('province')}
                        {...register('province', { required: 'Please select a province' })}
                      >
                        <option value="">Select Province</option>
                        {PROVINCES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      {fieldError('province')}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-light mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        placeholder="Kathmandu"
                        className={inputClass('district')}
                        {...register('district', { required: 'District is required' })}
                      />
                      {fieldError('district')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-light mb-1">
                        Municipality
                      </label>
                      <input
                        type="text"
                        placeholder="Kathmandu Metro"
                        className={inputClass('municipality')}
                        {...register('municipality', { required: 'Municipality is required' })}
                      />
                      {fieldError('municipality')}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-light mb-1">
                        Ward No.
                      </label>
                      <input
                        type="text"
                        placeholder="10"
                        className="w-full p-2.5 bg-surface border border-border rounded-xl text-sm"
                        {...register('ward')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-light mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        placeholder="New Road"
                        className="w-full p-2.5 bg-surface border border-border rounded-xl text-sm"
                        {...register('street')}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-primary text-white font-semibold rounded-xl text-xs"
                    >
                      Save Address
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-5 py-2 border border-border text-text font-semibold rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Step 2: Payment Gateway Selection */}
            <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
              <h3 className="font-bold text-text text-lg flex items-center gap-2 mb-4">
                <HiOutlineCreditCard className="w-5 h-5 text-primary" />
                2. Select Nepalese Payment Gateway
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* eSewa */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.ESEWA)}
                  aria-pressed={paymentMethod === PAYMENT_METHODS.ESEWA}
                  className={`w-full p-5 rounded-2xl border cursor-pointer text-center transition-all ${
                    paymentMethod === PAYMENT_METHODS.ESEWA
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20 font-bold shadow-sm'
                      : 'border-border-light hover:border-border'
                  }`}
                >
                  <div className="w-12 h-12 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center mx-auto mb-2 text-lg shadow-sm shadow-emerald-600/30">
                    e
                  </div>
                  <p className="text-sm font-bold text-text">eSewa ePay</p>
                  <p className="text-[10px] text-text-muted mt-0.5">UAT Sandbox / Live</p>
                  <span className="inline-block mt-1 text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">ID: 9849511111</span>
                </button>

                {/* Khalti */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.KHALTI)}
                  aria-pressed={paymentMethod === PAYMENT_METHODS.KHALTI}
                  className={`w-full p-5 rounded-2xl border cursor-pointer text-center transition-all ${
                    paymentMethod === PAYMENT_METHODS.KHALTI
                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/20 font-bold shadow-sm'
                      : 'border-border-light hover:border-border'
                  }`}
                >
                  <div className="w-12 h-12 bg-purple-600 text-white font-bold rounded-xl flex items-center justify-center mx-auto mb-2 text-lg">
                    K
                  </div>
                  <p className="text-sm font-bold text-text">Khalti SDK</p>
                  <p className="text-[10px] text-text-muted mt-1">Direct wallet &amp; netbanking</p>
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.COD)}
                  aria-pressed={paymentMethod === PAYMENT_METHODS.COD}
                  className={`w-full p-5 rounded-2xl border cursor-pointer text-center transition-all ${
                    paymentMethod === PAYMENT_METHODS.COD
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 font-bold shadow-sm'
                      : 'border-border-light hover:border-border'
                  }`}
                >
                  <span className="text-3xl mb-1 block">💵</span>
                  <p className="text-sm font-bold text-text">Cash on Delivery</p>
                  <p className="text-[10px] text-text-muted mt-1">Pay upon receiving package</p>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="bg-white rounded-2xl p-6 border border-border-light h-fit shadow-card space-y-4">
            <h3 className="text-lg font-bold text-text font-[Playfair_Display]">Order Summary</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-text font-medium line-clamp-1 flex-1 pr-2">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-bold text-text shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border-light pt-4 space-y-2 text-xs text-text-light">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-text">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-text">
                  {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-text border-t border-border-light pt-3">
                <span>Total Payable</span>
                <span className="text-primary">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || addressesLoading || !selectedAddressId}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                payLabel[paymentMethod]
              )}
            </button>
            {!addressesLoading && !selectedAddressId && (
              <p className="text-xs text-text-muted text-center">Add a shipping address to continue.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
