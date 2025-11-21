import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartStore, authStore, toastStore } from '../store/store';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(cartStore.getCart());
    const update = () => setCart(cartStore.getCart());
    window.addEventListener('cartUpdated', update);
    return () => window.removeEventListener('cartUpdated', update);
  }, []);

  const updateQty = (id, qty) => { cartStore.updateQuantity(id, qty); toastStore.info('Cart updated'); };
  const remove = (id) => { cartStore.removeFromCart(id); toastStore.info('Item removed'); };
  const total = cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);

  if (cart.length === 0) return (
    <div className="text-center py-20">
      <span className="text-8xl">🛒</span>
      <h2 className="text-2xl font-bold mt-6 dark:text-white">Your cart is empty</h2>
      <p className="text-gray-500 mt-2">Add some products to get started!</p>
      <Link to="/products" className="inline-block mt-6 btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold dark:text-white mb-8">Shopping Cart ({cart.length})</h1>
      <div className="space-y-4">
        {cart.map(item => (
          <div key={item.product.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              {item.product.image ? <img src={item.product.image} alt="" className="w-full h-full object-cover rounded-xl" /> : '📦'}
            </div>
            <div className="flex-1">
              <Link to={`/product/${item.product.id}`} className="font-semibold hover:text-indigo-600">{item.product.name}</Link>
              <p className="text-indigo-600 font-bold mt-1">₹{parseFloat(item.product.price).toLocaleString()}</p>
            </div>
            <div className="flex items-center border rounded-xl">
              <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">-</button>
              <span className="px-3">{item.quantity}</span>
              <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">+</button>
            </div>
            <p className="font-bold w-24 text-right">₹{(item.product.price * item.quantity).toLocaleString()}</p>
            <button onClick={() => remove(item.product.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">🗑️</button>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between text-lg mb-4"><span>Subtotal</span><span className="font-bold">₹{total.toLocaleString()}</span></div>
        <div className="flex justify-between text-sm text-gray-500 mb-4"><span>Shipping</span><span>{total > 999 ? 'FREE' : '₹50'}</span></div>
        <div className="flex justify-between text-xl font-bold border-t pt-4"><span>Total</span><span className="text-indigo-600">₹{(total > 999 ? total : total + 50).toLocaleString()}</span></div>
        <button onClick={() => authStore.isAuthenticated() ? navigate('/checkout') : navigate('/login')} className="w-full btn-primary mt-6">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};
export default Cart;