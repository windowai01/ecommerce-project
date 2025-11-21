import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { DASHBOARD_API, PRODUCT_API, ORDER_API, CATEGORY_API, COUPON_API, AUTH_API, apiRequest } from '../api/config';
import { toastStore } from '../store/store';

// Dashboard Component
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, chartRes, topRes, ordersRes] = await Promise.all([
        apiRequest(DASHBOARD_API.STATS),
        apiRequest(DASHBOARD_API.SALES_CHART),
        apiRequest(DASHBOARD_API.TOP_PRODUCTS),
        apiRequest(DASHBOARD_API.RECENT_ORDERS),
      ]);
      setStats(statsRes);
      setChartData(chartRes);
      setTopProducts(topRes);
      setRecentOrders(ordersRes);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'from-green-500 to-emerald-600' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦', color: 'from-blue-500 to-indigo-600' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: '🛍️', color: 'from-purple-500 to-pink-600' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'from-orange-500 to-red-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <span className="text-4xl opacity-80">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Sales (Last 30 Days)</h3>
          <div className="h-64 flex items-end gap-1">
            {chartData.slice(-30).map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${Math.max(4, (day.sales / Math.max(...chartData.map(d => d.sales || 1))) * 200)}px` }}
                  title={`${day.date}: ₹${day.sales}`}
                />
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">Daily Sales Trend</p>
        </div>

        {/* Order Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
          <div className="space-y-4">
            {Object.entries(stats?.ordersByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium">{status}</div>
                <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      status === 'DELIVERED' ? 'bg-green-500' :
                      status === 'PENDING' ? 'bg-yellow-500' :
                      status === 'CANCELLED' ? 'bg-red-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.max(5, (count / stats.totalOrders) * 100)}%` }}
                  />
                </div>
                <div className="w-12 text-right font-semibold">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{product.productName}</p>
                  <p className="text-sm text-gray-500">{product.totalQuantity} sold</p>
                </div>
                <p className="font-bold text-green-600">₹{parseFloat(product.totalRevenue).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.slice(0, 5).map((order, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{parseFloat(order.totalAmount).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats?.lowStockProducts || 0}</p>
          <p className="text-sm text-yellow-700">Low Stock Items</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats?.recentOrders || 0}</p>
          <p className="text-sm text-blue-700">Orders (7 days)</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">₹{(stats?.weekRevenue || 0).toLocaleString()}</p>
          <p className="text-sm text-green-700">Week Revenue</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats?.totalCategories || 0}</p>
          <p className="text-sm text-purple-700">Categories</p>
        </div>
      </div>
    </div>
  );
};

// Products Management
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProducts(); }, []);
  const fetchProducts = async () => { try { setProducts(await apiRequest(PRODUCT_API.GET_ALL)); } catch (e) {} setLoading(false); };
  const deleteProduct = async (id) => { if (!confirm('Delete?')) return; try { await apiRequest(PRODUCT_API.DELETE(id), { method: 'DELETE' }); toastStore.success('Deleted'); fetchProducts(); } catch (e) { toastStore.error(e.message); } };

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products ({products.length})</h2>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="p-4 text-left">Product</th><th className="p-4 text-left">Price</th><th className="p-4 text-left">Stock</th><th className="p-4 text-left">Rating</th><th className="p-4 text-left">Actions</th></tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {products.map(p => (
              <tr key={p.id}>
                <td className="p-4"><div className="flex items-center gap-3"><div className="w-12 h-12 bg-gray-100 rounded-lg">{p.image && <img src={p.image} className="w-full h-full object-cover rounded-lg" />}</div><span className="font-medium">{p.name}</span></div></td>
                <td className="p-4">₹{parseFloat(p.price).toLocaleString()}</td>
                <td className="p-4"><span className={p.quantity < 10 ? 'text-red-600 font-bold' : ''}>{p.quantity}</span></td>
                <td className="p-4">⭐ {p.averageRating || 0}</td>
                <td className="p-4"><button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:underline">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Orders Management
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);
  const fetchOrders = async () => { try { const data = await apiRequest(ORDER_API.GET_ALL); setOrders(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))); } catch (e) {} setLoading(false); };
  const updateStatus = async (id, status) => { try { await apiRequest(ORDER_API.UPDATE_STATUS(id), { method: 'PUT', body: JSON.stringify({ status }) }); toastStore.success('Updated'); fetchOrders(); } catch (e) { toastStore.error(e.message); } };

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders ({orders.length})</h2>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="p-4 text-left">Order</th><th className="p-4 text-left">Customer</th><th className="p-4 text-left">Amount</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Action</th></tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {orders.map(o => (
              <tr key={o.id}>
                <td className="p-4"><span className="font-medium">{o.orderNumber || `#${o.id}`}</span><br/><span className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</span></td>
                <td className="p-4">{o.userName || `User #${o.userId}`}</td>
                <td className="p-4 font-bold">₹{parseFloat(o.totalAmount).toLocaleString()}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-semibold ${o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.status}</span></td>
                <td className="p-4">
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600">
                    {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main Admin Panel
const AdminPanel = () => {
  const location = useLocation();
  const tabs = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '🛍️' },
    { path: '/admin/orders', label: 'Orders', icon: '📦' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold dark:text-white mb-6">Admin Panel</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <Link key={tab.path} to={tab.path}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition ${
              location.pathname === tab.path ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}>
            <span>{tab.icon}</span>{tab.label}
          </Link>
        ))}
      </div>

      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/products" element={<AdminProducts />} />
        <Route path="/orders" element={<AdminOrders />} />
      </Routes>
    </div>
  );
};

export default AdminPanel;