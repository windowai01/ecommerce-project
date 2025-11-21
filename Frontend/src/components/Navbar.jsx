import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authStore, cartStore } from '../store/store';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(authStore.isAuthenticated());
  const [user, setUser] = useState(authStore.getUser());
  const [cartCount, setCartCount] = useState(cartStore.getItemCount());
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(authStore.isAuthenticated());
      setUser(authStore.getUser());
    };

    const updateCart = () => setCartCount(cartStore.getItemCount());

    window.addEventListener('storage', checkAuth);
    window.addEventListener('authChange', checkAuth);
    window.addEventListener('cartUpdated', updateCart);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('cartUpdated', updateCart);
    };
  }, []);

  const handleLogout = () => {
    authStore.logout();
    setIsLoggedIn(false);
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            🛒 ShopEase
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 transition">Home</Link>
            
            <Link to="/cart" className="relative text-gray-700 hover:text-indigo-600 transition">
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 transition">My Orders</Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="text-gray-700 hover:text-indigo-600 transition">Admin</Link>
                )}
                <span className="text-gray-600">Hi, {user?.firstName || 'User'}</span>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-indigo-600 hover:text-indigo-800 transition">Login</Link>
                <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link to="/" className="block text-gray-700 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/cart" className="block text-gray-700 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="block text-gray-700 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>My Orders</Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="block text-gray-700 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Admin</Link>
                )}
                <button onClick={handleLogout} className="block text-red-500 hover:text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-indigo-600" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="block text-indigo-600" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;