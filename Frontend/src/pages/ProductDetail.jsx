import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PRODUCT_API, REVIEW_API, WISHLIST_API, apiRequest } from '../api/config';
import { cartStore, authStore, toastStore } from '../store/store';
import ImageGallery from '../components/ImageGallery';
import ProductCard from '../components/ProductCard';
import { StarRating, StarRatingInput, RatingDistribution } from '../components/Rating';
import { ProductDetailSkeleton } from '../components/Skeleton';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState({ reviews: [], averageRating: 0, totalReviews: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    if (authStore.isAuthenticated()) checkWishlist();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const [productData, relatedData] = await Promise.all([
        apiRequest(PRODUCT_API.GET_BY_ID(id)),
        apiRequest(PRODUCT_API.GET_RELATED(id)).catch(() => []),
      ]);
      setProduct(productData);
      setRelatedProducts(relatedData.slice(0, 4));
    } catch (err) {
      toastStore.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await apiRequest(REVIEW_API.GET_BY_PRODUCT(id));
      setReviews(data);
    } catch (err) { console.error(err); }
  };

  const checkWishlist = async () => {
    try {
      const data = await apiRequest(WISHLIST_API.CHECK(id));
      setIsWishlisted(data.inWishlist);
    } catch (err) { console.error(err); }
  };

  const handleAddToCart = () => {
    cartStore.addToCart(product, quantity);
    toastStore.success(`Added ${quantity} item(s) to cart!`);
  };

  const handleBuyNow = () => {
    cartStore.addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleWishlist = async () => {
    if (!authStore.isAuthenticated()) { toastStore.warning('Please login'); return; }
    try {
      if (isWishlisted) {
        await apiRequest(WISHLIST_API.REMOVE(id), { method: 'DELETE' });
        setIsWishlisted(false);
        toastStore.info('Removed from wishlist');
      } else {
        await apiRequest(WISHLIST_API.ADD(id), { method: 'POST' });
        setIsWishlisted(true);
        toastStore.success('Added to wishlist!');
      }
    } catch (err) { toastStore.error(err.message); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!authStore.isAuthenticated()) { toastStore.warning('Please login to review'); return; }
    setSubmitting(true);
    try {
      await apiRequest(REVIEW_API.ADD, {
        method: 'POST',
        body: JSON.stringify({ productId: id, ...reviewForm }),
      });
      toastStore.success('Review submitted!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      fetchReviews();
      fetchProduct();
    } catch (err) { toastStore.error(err.message); }
    setSubmitting(false);
  };

  if (loading) return <ProductDetailSkeleton />;
  if (!product) return null;

  const images = product.images ? product.images.split(',') : (product.image ? [product.image] : []);
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-indigo-600">Products</Link>
        <span>/</span>
        <span className="text-gray-800 dark:text-gray-200">{product.name}</span>
      </nav>

      {/* Product Info */}
      <div className="grid lg:grid-cols-2 gap-12">
        <ImageGallery images={images} productName={product.name} />

        <div className="space-y-6">
          {product.brand && <span className="text-sm text-indigo-600 font-medium uppercase">{product.brand}</span>}
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{product.name}</h1>

          <div className="flex items-center gap-4">
            <StarRating rating={Math.round(reviews.averageRating)} size="md" />
            <span className="text-gray-500">({reviews.totalReviews} reviews)</span>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-bold text-indigo-600">₹{parseFloat(product.price).toLocaleString()}</span>
            {discount > 0 && (
              <>
                <span className="text-xl text-gray-400 line-through">₹{parseFloat(product.originalPrice).toLocaleString()}</span>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${product.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-2 h-2 rounded-full ${product.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {product.quantity > 0 ? (product.quantity > 10 ? 'In Stock' : `Only ${product.quantity} left`) : 'Out of Stock'}
          </div>

          {product.quantity > 0 && (
            <>
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition">-</button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition">+</button>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={handleAddToCart} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Add to Cart
                </button>
                <button onClick={handleBuyNow} className="flex-1 btn-primary">Buy Now</button>
              </div>
            </>
          )}

          <button onClick={handleWishlist} className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition ${isWishlisted ? 'border-red-300 text-red-600 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}>
            <svg className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Customer Reviews</h2>
          {authStore.isAuthenticated() && (
            <button onClick={() => setShowReviewForm(!showReviewForm)} className="text-indigo-600 font-semibold hover:underline">
              Write a Review
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800 dark:text-white">{reviews.averageRating?.toFixed(1) || '0.0'}</div>
              <StarRating rating={Math.round(reviews.averageRating)} size="lg" />
              <p className="text-gray-500 mt-2">{reviews.totalReviews} reviews</p>
            </div>
            <RatingDistribution distribution={reviews.distribution} total={reviews.totalReviews} />
          </div>

          <div className="md:col-span-2 space-y-6">
            {showReviewForm && (
              <form onSubmit={submitReview} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 space-y-4">
                <StarRatingInput value={reviewForm.rating} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                <input type="text" placeholder="Review title" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800" />
                <textarea placeholder="Your review..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={4} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800" />
                <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Submitting...' : 'Submit Review'}</button>
              </form>
            )}

            {reviews.reviews?.length > 0 ? (
              reviews.reviews.map((review) => (
                <div key={review.id} className="border-b dark:border-gray-700 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-semibold text-indigo-600">
                      {review.userName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">{review.userName}</p>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    {review.verified && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Verified</span>}
                  </div>
                  {review.title && <h4 className="font-semibold mt-2">{review.title}</h4>}
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;