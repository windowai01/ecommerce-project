import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ORDER_API, ADDRESS_API, COUPON_API, PAYMENT_API, RAZORPAY_KEY_ID, apiRequest } from '../api/config';
import { cartStore, authStore, toastStore } from '../store/store';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', landmark: '', addressType: 'HOME'
  });

  const user = authStore.getUser();
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal - couponDiscount + shipping;

  useEffect(() => {
    const cartItems = cartStore.getCart();
    if (cartItems.length === 0) { navigate('/cart'); return; }
    setCart(cartItems);
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const data = await apiRequest(ADDRESS_API.GET_ALL);
      setAddresses(data);
      const defaultAddr = data.find(a => a.isDefault) || data[0];
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
    } catch (err) { console.error(err); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const saved = await apiRequest(ADDRESS_API.ADD, { method: 'POST', body: JSON.stringify(addressForm) });
      setAddresses([...addresses, saved]);
      setSelectedAddress(saved.id);
      setShowAddressForm(false);
      setAddressForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', landmark: '', addressType: 'HOME' });
      toastStore.success('Address added!');
    } catch (err) { toastStore.error(err.message); }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const data = await apiRequest(COUPON_API.VALIDATE, {
        method: 'POST',
        body: JSON.stringify({ code: couponCode.toUpperCase(), orderAmount: subtotal }),
      });
      if (data.valid) {
        setCouponDiscount(parseFloat(data.discount));
        setCouponApplied(data.couponCode);
        toastStore.success(data.message);
      } else {
        toastStore.error(data.message);
      }
    } catch (err) { toastStore.error(err.message); }
  };

  const removeCoupon = () => { setCouponDiscount(0); setCouponApplied(null); setCouponCode(''); };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toastStore.warning('Please select an address'); return; }
    setLoading(true);

    try {
      // Create order
      const orderData = {
        items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        addressId: selectedAddress,
        couponCode: couponApplied,
      };
      const order = await apiRequest(ORDER_API.CREATE, { method: 'POST', body: JSON.stringify(orderData) });

      if (paymentMethod === 'COD') {
        await apiRequest(PAYMENT_API.COD, { method: 'POST', body: JSON.stringify({ orderId: order.id }) });
        cartStore.clearCart();
        toastStore.success('Order placed successfully!');
        navigate('/dashboard');
      } else {
        // Razorpay
        const paymentOrder = await apiRequest(PAYMENT_API.CREATE_ORDER, { method: 'POST', body: JSON.stringify({ orderId: order.id }) });
        
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: paymentOrder.amount,
          currency: 'INR',
          name: 'ShopEase',
          description: `Order #${order.orderNumber}`,
          order_id: paymentOrder.razorpayOrderId,
          handler: async (response) => {
            try {
              await apiRequest(PAYMENT_API.VERIFY, {
                method: 'POST',
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: order.id,
                }),
              });
              cartStore.clearCart();
              toastStore.success('Payment successful!');
              navigate('/dashboard');
            } catch (err) { toastStore.error('Payment verification failed'); }
          },
          prefill: { name: user?.firstName, email: user?.email, contact: user?.phone },
          theme: { color: '#6366f1' },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (err) {
      toastStore.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center justify-center mb-8">
        {['Address', 'Payment', 'Review'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step > i ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              {step > i ? '✓' : i + 1}
            </div>
            <span className={`ml-2 ${step >= i + 1 ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>{s}</span>
            {i < 2 && <div className={`w-16 h-1 mx-4 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Select Delivery Address</h2>
              
              <div className="space-y-4">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${selectedAddress === addr.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{addr.fullName}</span>
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{addr.addressType}</span>
                        {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Default</span>}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{addr.addressLine1}, {addr.addressLine2}</p>
                      <p className="text-gray-600 dark:text-gray-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-gray-600 dark:text-gray-400">Phone: {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button onClick={() => setShowAddressForm(!showAddressForm)} className="mt-4 text-indigo-600 font-semibold hover:underline">
                + Add New Address
              </button>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Full Name" required value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                    <input placeholder="Phone" required value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                  </div>
                  <input placeholder="Address Line 1" required value={addressForm.addressLine1} onChange={e => setAddressForm({...addressForm, addressLine1: e.target.value})} className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                  <input placeholder="Address Line 2" value={addressForm.addressLine2} onChange={e => setAddressForm({...addressForm, addressLine2: e.target.value})} className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                  <div className="grid grid-cols-3 gap-3">
                    <input placeholder="City" required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                    <input placeholder="State" required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                    <input placeholder="Pincode" required value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                  </div>
                  <button type="submit" className="btn-primary w-full">Save Address</button>
                </form>
              )}

              <button onClick={() => setStep(2)} disabled={!selectedAddress} className="mt-6 btn-primary w-full">Continue to Payment</button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[{ id: 'RAZORPAY', name: 'Pay Online', desc: 'UPI, Cards, Net Banking', icon: '💳' },
                  { id: 'COD', name: 'Cash on Delivery', desc: 'Pay when you receive', icon: '💵' }
                ].map(method => (
                  <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === method.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="font-semibold">{method.name}</p>
                      <p className="text-sm text-gray-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Review Order</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-6">
              <h2 className="text-xl font-semibold">Review Order</h2>
              
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      {item.product.image ? <img src={item.product.image} alt="" className="w-full h-full object-cover rounded-lg" /> : '📦'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg sticky top-24">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              {couponApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({couponApplied})</span>
                  <span>-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-indigo-600">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Coupon */}
            {!couponApplied ? (
              <div className="mt-4 flex gap-2">
                <input placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                  className="flex-1 p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 text-sm" />
                <button onClick={applyCoupon} className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg font-semibold text-sm">Apply</button>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <span className="text-green-700 font-medium">{couponApplied} applied!</span>
                <button onClick={removeCoupon} className="text-red-600 text-sm">Remove</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;