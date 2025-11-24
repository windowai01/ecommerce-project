import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ORDER_API, ADDRESS_API, COUPON_API, apiRequest } from '../api/config';
import { cartStore, authStore, toastStore } from '../store/store';

// Payment API (add to config.js)
const PAYMENT_API = {
  PROCESS: 'http://localhost:8080/api/payment/process',
};

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', landmark: '', addressType: 'HOME'
  });
  
  // Card details (mock - just for UI)
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState(''); 

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
    
    // Validate payment details
    if (paymentMethod === 'CARD') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        toastStore.error('Please fill all card details'); return;
      }
    } else if (paymentMethod === 'UPI' && !upiId) {
      toastStore.error('Please enter UPI ID'); return;
    } else if (paymentMethod === 'NETBANKING' && !selectedBank) {
      toastStore.error('Please select a bank'); return;
    }
    
    setLoading(true);

    try {
      // Step 1: Create order
      const orderData = {
        items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        addressId: selectedAddress,
        couponCode: couponApplied,
      };
      const order = await apiRequest(ORDER_API.CREATE, { method: 'POST', body: JSON.stringify(orderData) });

      // Step 2: Process payment (mock)
      const paymentResponse = await apiRequest(PAYMENT_API.PROCESS, {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id, paymentMethod }),
      });

      if (paymentResponse.success) {
        cartStore.clearCart();
        toastStore.success(paymentResponse.message);
        
        // Navigate to success page or dashboard
        navigate('/order-success', { 
          state: { 
            orderId: paymentResponse.orderId,
            orderNumber: paymentResponse.orderNumber,
            transactionId: paymentResponse.transactionId,
            paymentMethod: paymentResponse.paymentMethod,
            amount: total
          }
        });
      } else {
        toastStore.error(paymentResponse.message || 'Payment failed');
      }
    } catch (err) {
      toastStore.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'CARD', name: 'Credit/Debit Card', desc: 'Visa, Mastercard, Rupay', icon: '💳' },
    { id: 'UPI', name: 'UPI', desc: 'Google Pay, PhonePe, Paytm', icon: '📱' },
    { id: 'NETBANKING', name: 'Net Banking', desc: 'All major banks', icon: '🏦' },
    { id: 'COD', name: 'Cash on Delivery', desc: 'Pay when you receive', icon: '💵' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {['Address', 'Payment', 'Review'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600'
            }`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`ml-2 hidden sm:block ${step >= i + 1 ? 'text-gray-800 dark:text-white font-medium' : 'text-gray-400'}`}>{s}</span>
            {i < 2 && <div className={`w-12 sm:w-20 h-1 mx-2 sm:mx-4 rounded ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📍</span> Select Delivery Address
              </h2>
              
              <div className="space-y-4">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAddress === addr.id 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-indigo-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{addr.fullName}</span>
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{addr.addressType}</span>
                        {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Default</span>}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`}</p>
                      <p className="text-gray-600 dark:text-gray-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-gray-500 text-sm mt-1">📞 {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button onClick={() => setShowAddressForm(!showAddressForm)} className="mt-4 text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                <span className="text-xl">+</span> Add New Address
              </button>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Full Name *" required value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                    <input placeholder="Phone *" required value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                  </div>
                  <input placeholder="Address Line 1 *" required value={addressForm.addressLine1} onChange={e => setAddressForm({...addressForm, addressLine1: e.target.value})} className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                  <input placeholder="Address Line 2" value={addressForm.addressLine2} onChange={e => setAddressForm({...addressForm, addressLine2: e.target.value})} className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                  <div className="grid grid-cols-3 gap-3">
                    <input placeholder="City *" required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                    <input placeholder="State *" required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                    <input placeholder="Pincode *" required value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-800" />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary flex-1">Save Address</button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              )}

              <button onClick={() => setStep(2)} disabled={!selectedAddress} className={`mt-6 w-full py-4 rounded-xl font-semibold text-white transition-all ${
                selectedAddress ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'
              }`}>
                Continue to Payment →
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">💳</span> Payment Method
              </h2>
              
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === method.id 
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-indigo-600" />
                    <span className="text-3xl">{method.icon}</span>
                    <div>
                      <p className="font-semibold">{method.name}</p>
                      <p className="text-sm text-gray-500">{method.desc}</p>
                    </div>
                    {method.id === 'COD' && <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded">No extra charge</span>}
                  </label>
                ))}
              </div>

              {/* Card Details Form */}
              {paymentMethod === 'CARD' && (
                <div className="mt-6 p-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white">
                  <div className="flex justify-between items-start mb-8">
                    <div className="text-xs opacity-70">Credit / Debit Card</div>
                    <div className="flex gap-2">
                      <span className="text-2xl">💳</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Card Number" 
                      maxLength={19}
                      value={cardDetails.number}
                      onChange={e => setCardDetails({...cardDetails, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()})}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 tracking-widest"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        maxLength={5}
                        value={cardDetails.expiry}
                        onChange={e => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length >= 2) val = val.slice(0,2) + '/' + val.slice(2);
                          setCardDetails({...cardDetails, expiry: val});
                        }}
                        className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                      />
                      <input 
                        type="password" 
                        placeholder="CVV" 
                        maxLength={3}
                        value={cardDetails.cvv}
                        onChange={e => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                        className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                      />
                      <input 
                        type="text" 
                        placeholder="Name" 
                        value={cardDetails.name}
                        onChange={e => setCardDetails({...cardDetails, name: e.target.value.toUpperCase()})}
                        className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mt-4">🔒 Your card details are secure and encrypted</p>
                </div>
              )}

              {/* UPI Form */}
              {paymentMethod === 'UPI' && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <label className="block text-sm font-medium mb-2">Enter UPI ID</label>
                  <input 
                    type="text" 
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full p-3 border dark:border-gray-600 dark:bg-gray-800 rounded-lg"
                  />
                  <div className="flex gap-3 mt-3">
                    {['@ybl', '@paytm', '@okicici', '@oksbi'].map(suffix => (
                      <button key={suffix} type="button" onClick={() => setUpiId(prev => prev.split('@')[0] + suffix)}
                        className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded hover:bg-gray-300">
                        {suffix}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Net Banking */}
              {paymentMethod === 'NETBANKING' && (
  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
    <label className="block text-sm font-medium mb-3">Select Your Bank</label>
    
    {/* Popular Banks - Quick Select Buttons */}
    <div className="grid grid-cols-4 gap-3 mb-4">
      {[
        { id: 'SBI', name: 'SBI' },
        { id: 'HDFC', name: 'HDFC' },
        { id: 'ICICI', name: 'ICICI' },
        { id: 'AXIS', name: 'Axis' },
      ].map(bank => (
        <button 
          key={bank.id}
          type="button"
          onClick={() => setSelectedBank(bank.id)}
          className={`p-3 border rounded-xl text-sm font-medium transition-all ${
            selectedBank === bank.id 
              ? 'border-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 ring-2 ring-indigo-500' 
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
          }`}
        >
          🏦 {bank.name}
        </button>
      ))}
    </div>

    <label className="block text-xs text-gray-500 mb-2">Or choose from all banks:</label>
    <select 
      value={selectedBank}
      onChange={(e) => setSelectedBank(e.target.value)}
      className={`w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-600 transition ${
        selectedBank ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-300'
      }`}
    >
      <option value="">-- Select a Bank --</option>
      <option value="SBI">State Bank of India</option>
      <option value="HDFC">HDFC Bank</option>
      <option value="ICICI">ICICI Bank</option>
      <option value="AXIS">Axis Bank</option>
      <option value="PNB">Punjab National Bank</option>
      <option value="BOB">Bank of Baroda</option>
      <option value="KOTAK">Kotak Mahindra Bank</option>
      <option value="YES">Yes Bank</option>
      <option value="IDBI">IDBI Bank</option>
      <option value="UNION">Union Bank of India</option>
      <option value="CANARA">Canara Bank</option>
      <option value="BOI">Bank of India</option>
      <option value="INDIAN">Indian Bank</option>
      <option value="FEDERAL">Federal Bank</option>
      <option value="INDUSIND">IndusInd Bank</option>
    </select>

    {/* Selected Bank Confirmation */}
    {selectedBank && (
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
        <span className="text-2xl">✅</span>
        <div className="flex-1">
          <p className="font-semibold text-green-700 dark:text-green-400">
            {selectedBank} Bank Selected
          </p>
          <p className="text-xs text-green-600 dark:text-green-500">
            You'll be redirected to your bank's secure payment page
          </p>
        </div>
      </div>
    )}

    {!selectedBank && (
      <p className="mt-3 text-xs text-amber-600 flex items-center gap-1">
        ⚠️ Please select a bank to continue
      </p>
    )}
  </div>
)}



              <div className="flex gap-4 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1">Review Order →</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-2xl">📋</span> Review Your Order
              </h2>

              {/* Address Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="font-medium text-sm text-gray-500 mb-2">DELIVERING TO</h3>
                {addresses.filter(a => a.id === selectedAddress).map(addr => (
                  <div key={addr.id}>
                    <p className="font-semibold">{addr.fullName}</p>
                    <p className="text-gray-600 dark:text-gray-400">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-gray-500">📞 {addr.phone}</p>
                  </div>
                ))}
              </div>

              {/* Payment Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
  <h3 className="font-medium text-sm text-gray-500 mb-2">PAYMENT METHOD</h3>
  <p className="font-semibold">{paymentMethods.find(p => p.id === paymentMethod)?.name}</p>
  {paymentMethod === 'CARD' && cardDetails.number && (
    <p className="text-gray-500">Card ending in {cardDetails.number.slice(-4)}</p>
  )}
  {paymentMethod === 'UPI' && upiId && (
    <p className="text-gray-500">{upiId}</p>
  )}
  {/* ADD THIS for Net Banking */}
  {paymentMethod === 'NETBANKING' && selectedBank && (
    <p className="text-gray-500">🏦 {selectedBank} Bank</p>
  )}
  {paymentMethod === 'COD' && (
    <p className="text-gray-500">💵 Pay on delivery</p>
  )}
</div>
              
              {/* Items */}
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-3">ORDER ITEMS ({cart.length})</h3>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.product.image ? <img src={item.product.image} alt="" className="w-full h-full object-cover" /> : '📦'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold line-clamp-1">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className={`flex-1 py-4 rounded-xl font-semibold text-white transition-all ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30'
                }`}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing Payment...
                    </span>
                  ) : (
                    `Pay ₹${total.toLocaleString()} 🔒`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg sticky top-24">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal ({cart.reduce((s,i) => s+i.quantity, 0)} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-500">💡 Add ₹{(999 - subtotal).toLocaleString()} more for free shipping</p>
              )}
              {couponApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({couponApplied})</span>
                  <span>-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t dark:border-gray-700 pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-indigo-600">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-6 pt-6 border-t dark:border-gray-700">
              <h4 className="font-medium mb-3">Have a coupon?</h4>
              {!couponApplied ? (
                <div className="flex gap-2">
                  <input placeholder="Enter code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 p-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700 text-sm uppercase" />
                  <button onClick={applyCoupon} className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-200 transition">
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div>
                    <span className="text-green-700 dark:text-green-400 font-medium">{couponApplied}</span>
                    <p className="text-xs text-green-600">You save ₹{couponDiscount.toLocaleString()}!</p>
                  </div>
                  <button onClick={removeCoupon} className="text-red-500 text-sm hover:underline">Remove</button>
                </div>
              )}
            </div>

            {/* Security Badge */}
            <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <span className="text-2xl">🔒</span>
              <p className="text-xs text-gray-500 mt-1">Secure checkout powered by 256-bit SSL encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;