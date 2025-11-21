import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ORDER_API, apiRequest } from '../api/config';
import { authStore, toastStore } from '../store/store';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const user = authStore.getUser();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try { const data = await apiRequest(ORDER_API.GET_BY_USER(user.id)); setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); }
    catch (err) { console.error(err); }
    setLoading(false);
  };

  const cancelOrder = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try { await apiRequest(ORDER_API.CANCEL(id), { method: 'PUT' }); toastStore.success('Order cancelled'); fetchOrders(); }
    catch (err) { toastStore.error(err.message); }
  };

  const statusColor = { PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700', SHIPPED: 'bg-purple-100 text-purple-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700' };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold dark:text-white mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
          <span className="text-8xl">📦</span>
          <h2 className="text-2xl font-bold mt-6 dark:text-white">No orders yet</h2>
          <Link to="/products" className="inline-block mt-6 btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{order.orderNumber || `Order #${order.id}`}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[order.status] || 'bg-gray-100'}`}>{order.status}</span>
                    <p className="text-xl font-bold text-indigo-600 mt-2">₹{parseFloat(order.totalAmount).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              {expanded === order.id && (
                <div className="border-t dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/30">
                  <h4 className="font-semibold mb-3">Items:</h4>
                  {order.orderItems?.map((item, i) => (
                    <div key={i} className="flex justify-between py-2 border-b dark:border-gray-600 last:border-0">
                      <span>{item.productName || `Product #${item.productId}`} × {item.quantity}</span>
                      <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {order.status === 'PENDING' && (
                    <button onClick={() => cancelOrder(order.id)} className="mt-4 text-red-600 font-semibold hover:underline">Cancel Order</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Dashboard;