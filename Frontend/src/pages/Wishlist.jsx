import { useState, useEffect } from 'react';
import { WISHLIST_API, apiRequest } from '../api/config';
import { cartStore, toastStore } from '../store/store';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const data = await apiRequest(WISHLIST_API.GET);
      setItems(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const remove = async (productId) => {
    try {
      await apiRequest(WISHLIST_API.REMOVE(productId), { method: 'DELETE' });
      setItems(items.filter(i => i.productId !== productId));
      toastStore.info('Removed from wishlist');
    } catch (err) { toastStore.error(err.message); }
  };

  const addToCart = (item) => {
    cartStore.addToCart({ id: item.productId, name: item.name, price: item.price, image: item.image }, 1);
    toastStore.success('Added to cart!');
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (items.length === 0) return (
    <div className="text-center py-20">
      <span className="text-8xl">💝</span>
      <h2 className="text-2xl font-bold mt-6 dark:text-white">Your wishlist is empty</h2>
      <Link to="/products" className="inline-block mt-6 btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold dark:text-white mb-8">My Wishlist ({items.length})</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex gap-4 shadow-lg">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl">
              {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-xl" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
            </div>
            <div className="flex-1">
              <Link to={`/product/${item.productId}`} className="font-semibold hover:text-indigo-600">{item.name}</Link>
              <p className="text-indigo-600 font-bold">₹{parseFloat(item.price).toLocaleString()}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => addToCart(item)} className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg">Add to Cart</button>
                <button onClick={() => remove(item.productId)} className="text-sm text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Wishlist;