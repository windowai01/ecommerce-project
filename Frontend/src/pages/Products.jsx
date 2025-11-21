import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCT_API, CATEGORY_API, apiRequest } from '../api/config';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortDir: searchParams.get('sortDir') || 'desc',
    search: searchParams.get('search') || '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [filters]);

  const fetchCategories = async () => {
    try {
      const data = await apiRequest(CATEGORY_API.GET_ALL);
      setCategories(data);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let data;
      if (filters.search) {
        data = await apiRequest(`${PRODUCT_API.SEARCH}?keyword=${filters.search}`);
      } else {
        const params = new URLSearchParams();
        if (filters.category) params.append('categoryId', filters.category);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.minRating) params.append('minRating', filters.minRating);
        params.append('sortBy', filters.sortBy);
        params.append('sortDir', filters.sortDir);
        params.append('size', '50');
        const response = await apiRequest(`${PRODUCT_API.FILTER}?${params}`);
        data = response.products || response;
      }
      setProducts(Array.isArray(data) ? data.filter(p => p.active) : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', minRating: '', sortBy: 'createdAt', sortDir: 'desc', search: '' });
    setSearchParams({});
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg sticky top-24 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Filters</h3>
            <button onClick={clearFilters} className="text-sm text-indigo-600 hover:underline">Clear All</button>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="w-1/2 p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-1/2 p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Minimum Rating</label>
            <select
              value={filters.minRating}
              onChange={(e) => updateFilter('minRating', e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="">Any Rating</option>
              <option value="4">4★ & above</option>
              <option value="3">3★ & above</option>
              <option value="2">2★ & above</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
            <select
              value={`${filters.sortBy}-${filters.sortDir}`}
              onChange={(e) => {
                const [sortBy, sortDir] = e.target.value.split('-');
                updateFilter('sortBy', sortBy);
                setTimeout(() => updateFilter('sortDir', sortDir), 0);
              }}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="averageRating-desc">Top Rated</option>
              <option value="name-asc">Name: A-Z</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Products Grid */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {filters.search ? `Search: "${filters.search}"` : 'All Products'}
            </h1>
            <p className="text-gray-500">{products.length} products found</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        {/* Active Filters */}
        {(filters.category || filters.minPrice || filters.maxPrice || filters.minRating) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.category && (
              <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                {categories.find(c => c.id == filters.category)?.name}
                <button onClick={() => updateFilter('category', '')} className="ml-1 hover:text-red-500">×</button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                <button onClick={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); }} className="ml-1 hover:text-red-500">×</button>
              </span>
            )}
            {filters.minRating && (
              <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                {filters.minRating}★ & above
                <button onClick={() => updateFilter('minRating', '')} className="ml-1 hover:text-red-500">×</button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-6xl">🔍</span>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-4">No products found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            <button onClick={clearFilters} className="mt-4 text-indigo-600 font-semibold hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;