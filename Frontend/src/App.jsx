import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authStore, themeStore } from './store/store';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Wishlist from './pages/Wishlist';
import Addresses from './pages/Addresses';
import AdminPanel from './pages/AdminPanel';

// Protected Route - Requires Login
const ProtectedRoute = ({ children }) => {
  if (!authStore.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin Route - Requires Admin Role
const AdminRoute = ({ children }) => {
  const user = authStore.getUser();
  if (!authStore.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    // Initialize theme on load
    themeStore.initTheme();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar />
        <Toast />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/checkout" element={
              <ProtectedRoute><Checkout /></ProtectedRoute>
            } />
            <Route path="/order-success" element={
              <ProtectedRoute><OrderSuccess /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute><Wishlist /></ProtectedRoute>
            } />
            <Route path="/addresses" element={
              <ProtectedRoute><Addresses /></ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <AdminRoute><AdminPanel /></AdminRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 dark:bg-gray-950 text-white py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 gradient-text">ShopEase</h3>
                <p className="text-gray-400">Your one-stop destination for quality products at great prices.</p>
                <div className="flex gap-4 mt-4">
                  <a href="#" className="text-gray-400 hover:text-white transition">📘</a>
                  <a href="#" className="text-gray-400 hover:text-white transition">📸</a>
                  <a href="#" className="text-gray-400 hover:text-white transition">🐦</a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/products" className="hover:text-white transition">Products</a></li>
                  <li><a href="/cart" className="hover:text-white transition">Cart</a></li>
                  <li><a href="/dashboard" className="hover:text-white transition">My Orders</a></li>
                  <li><a href="/wishlist" className="hover:text-white transition">Wishlist</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Contact Us</li>
                  <li>FAQ</li>
                  <li>Shipping Info</li>
                  <li>Returns & Refunds</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>📧 support@shopease.com</li>
                  <li>📞 +91 98765 43210</li>
                  <li>📍 Mumbai, India</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>© 2025 ShopEase. All rights reserved.</p>
              <p className="text-sm mt-2">Made with ❤️ for your shopping needs</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;