import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCT_API, CATEGORY_API, apiRequest } from '../api/config';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        apiRequest(PRODUCT_API.GET_ALL),
        apiRequest(CATEGORY_API.GET_ALL),
      ]);
      setFeaturedProducts(productsRes.filter(p => p.featured && p.active).slice(0, 8));
      setNewArrivals(productsRes.filter(p => p.active).slice(0, 8));
      setCategories(categoriesRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 md:p-16">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
            ✨ New Collection 2025
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Your <br />
            <span className="text-yellow-300">Perfect Style</span>
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-lg">
            Shop the latest trends with amazing deals. Get up to 50% off on selected items.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/products" className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Shop Now →
            </Link>
            <Link to="/products?featured=true" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
              View Offers
            </Link>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-72 h-72 bg-white/20 backdrop-blur-xl rounded-3xl rotate-12 animate-pulse" />
            <div className="absolute top-8 -left-8 w-64 h-64 bg-white/30 backdrop-blur-xl rounded-3xl -rotate-6" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Shop by Category</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Browse our popular categories</p>
          </div>
          <Link to="/products" className="text-indigo-600 font-semibold hover:underline">View All →</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 text-center card-hover"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-10 h-10 object-contain" />
                ) : '📦'}
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Featured Products</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Our handpicked selections for you</p>
          </div>
          <Link to="/products?featured=true" className="text-indigo-600 font-semibold hover:underline">View All →</Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No featured products available</div>
        )}
      </section>

      {/* Banner */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full" />
          <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Limited Time</span>
          <h3 className="text-3xl font-bold mt-4">Summer Sale</h3>
          <p className="mt-2 opacity-90">Up to 50% off on selected items</p>
          <Link to="/products" className="inline-block mt-6 bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition">
            Shop Now
          </Link>
        </div>
        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full" />
          <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">Free Shipping</span>
          <h3 className="text-3xl font-bold mt-4">New Arrivals</h3>
          <p className="mt-2 opacity-90">Free delivery on orders above ₹999</p>
          <Link to="/products" className="inline-block mt-6 bg-white text-teal-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition">
            Explore
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">New Arrivals</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Check out our latest products</p>
          </div>
          <Link to="/products" className="text-indigo-600 font-semibold hover:underline">View All →</Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹999' },
          { icon: '🔄', title: 'Easy Returns', desc: '7-day return policy' },
          { icon: '🔒', title: 'Secure Payment', desc: '100% secure checkout' },
          { icon: '💬', title: '24/7 Support', desc: 'Dedicated support' },
        ].map((feature, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center card-hover">
            <span className="text-4xl">{feature.icon}</span>
            <h4 className="font-semibold text-gray-800 dark:text-white mt-3">{feature.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;