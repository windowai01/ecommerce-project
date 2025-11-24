import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  
  const orderData = location.state || {};

  useEffect(() => {
    // Redirect if no order data
    if (!orderData.orderId) {
      navigate('/');
      return;
    }
    
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!orderData.orderId) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['🎉', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center relative z-10">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Order Placed Successfully! 🎉
        </h1>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Thank you for your order. We've received your payment and will process it soon.
        </p>

        {/* Order Details Card */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-6 mb-8 text-left">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Order Number</span>
              <span className="font-bold text-indigo-600">{orderData.orderNumber}</span>
            </div>
            {orderData.transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
                <span className="font-mono text-sm">{orderData.transactionId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
              <span className="font-medium">
                {orderData.paymentMethod === 'COD' ? '💵 Cash on Delivery' : 
                 orderData.paymentMethod === 'CARD' ? '💳 Card Payment' :
                 orderData.paymentMethod === 'UPI' ? '📱 UPI' : 
                 orderData.paymentMethod === 'NETBANKING' ? '🏦 Net Banking' : orderData.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between border-t dark:border-gray-600 pt-3 mt-3">
              <span className="text-gray-600 dark:text-gray-400">Amount</span>
              <span className="text-xl font-bold text-green-600">₹{orderData.amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 mb-8 text-green-600 bg-green-50 dark:bg-green-900/20 py-3 rounded-xl">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="font-medium">
            {orderData.paymentMethod === 'COD' ? 'Order confirmed - Pay on delivery' : 'Payment successful'}
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link to="/dashboard" className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all">
            View My Orders
          </Link>
          <Link to="/products" className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
            Continue Shopping
          </Link>
        </div>

        {/* Info */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          📧 Order confirmation has been sent to your email
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;