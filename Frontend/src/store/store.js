// ============================================
// AUTH STORE
// ============================================
export const authStore = {
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  getToken: () => localStorage.getItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token'),
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event('authChange'));
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('authChange'));
  },
  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event('authChange'));
  },
};

// ============================================
// CART STORE
// ============================================
export const cartStore = {
  getCart: () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },
  addToCart: (product, quantity = 1) => {
    const cart = cartStore.getCart();
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    return cart;
  },
  updateQuantity: (productId, quantity) => {
    const cart = cartStore.getCart();
    const index = cart.findIndex(item => item.product.id === productId);
    if (index >= 0) {
      if (quantity <= 0) cart.splice(index, 1);
      else cart[index].quantity = quantity;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    return cart;
  },
  removeFromCart: (productId) => {
    const cart = cartStore.getCart().filter(item => item.product.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    return cart;
  },
  clearCart: () => {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
  },
  getTotal: () => cartStore.getCart().reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0),
  getItemCount: () => cartStore.getCart().reduce((sum, item) => sum + item.quantity, 0),
};

// ============================================
// THEME STORE (Dark Mode)
// ============================================
export const themeStore = {
  getTheme: () => localStorage.getItem('theme') || 'light',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.dispatchEvent(new Event('themeChange'));
  },
  toggleTheme: () => {
    const current = themeStore.getTheme();
    themeStore.setTheme(current === 'dark' ? 'light' : 'dark');
  },
  initTheme: () => {
    const theme = themeStore.getTheme();
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================
let toastListeners = [];

export const toastStore = {
  subscribe: (listener) => {
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter(l => l !== listener); };
  },
  show: (message, type = 'success', duration = 3000) => {
    const toast = { id: Date.now(), message, type, duration };
    toastListeners.forEach(listener => listener(toast));
    return toast.id;
  },
  success: (message) => toastStore.show(message, 'success'),
  error: (message) => toastStore.show(message, 'error'),
  warning: (message) => toastStore.show(message, 'warning'),
  info: (message) => toastStore.show(message, 'info'),
};