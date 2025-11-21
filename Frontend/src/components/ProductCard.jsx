import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cartStore, authStore, toastStore } from '../store/store';
import { WISHLIST_API, apiRequest } from '../api/config';
import { StarRating } from './Rating';

const ProductCard = ({ product, onWishlistChange }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    cartStore.addToCart(product, 1);
    toastStore.success('Added to cart!');
    setTimeout(() => setAdding(false), 1000);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authStore.isAuthenticated()) {
      toastStore.warning('Please login to add to wishlist');
      return;
    }
    try {
      if (isWishlisted) {
        await apiRequest(WISHLIST_API.REMOVE(product.id), { method: 'DELETE' });
        setIsWishlisted(false);
        toastStore.info('Removed from wishlist');
      } else {
        await apiRequest(WISHLIST_API.ADD(product.id), { method: 'POST' });
        setIsWishlisted(true);
        toastStore.success('Added to wishlist!');
      }
      onWishlistChange?.();
    } catch (err) {
      toastStore.error(err.message);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg card-hover relative">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:scale-110 transition-transform"
        >
          <svg
            className={`w-5 h-5 transition-colors ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'}`}
            fill={isWishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Image */}
        <div className="h-56 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover img-zoom"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
              📦
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase tracking-wide">
              {product.category.name}
            </span>
          )}

          {/* Name */}
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={Math.round(product.averageRating || 0)} size="sm" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              ₹{parseFloat(product.price).toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                ₹{parseFloat(product.originalPrice).toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-2">
            {product.quantity > 0 ? (
              <span className="text-sm text-green-600 dark:text-green-400">
                {product.quantity > 10 ? 'In Stock' : `Only ${product.quantity} left`}
              </span>
            ) : (
              <span className="text-sm text-red-500">Out of Stock</span>
            )}
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.quantity <= 0 || adding}
            className={`w-full mt-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
              product.quantity <= 0
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : adding
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transform hover:scale-[1.02]'
            }`}
          >
            {adding ? '✓ Added!' : product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;