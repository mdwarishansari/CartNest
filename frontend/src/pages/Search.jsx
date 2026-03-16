import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, SlidersHorizontal, X, Sparkles, Filter } from 'lucide-react';
import { productService, categoryService } from '../services';
import ProductCard from '../components/ui/ProductCard';
import { SkeletonList } from '../components/ui/Spinner';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Separate UI state from debounced fetch state
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data.categories || [])).catch(() => {});
  }, []);

  // Debounce text/number inputs (search, minPrice, maxPrice) — 500ms
  // Dropdown changes (category, sort) — apply immediately
  useEffect(() => {
    const textChanged =
      filters.search !== debouncedFilters.search ||
      filters.minPrice !== debouncedFilters.minPrice ||
      filters.maxPrice !== debouncedFilters.maxPrice;

    const dropdownChanged =
      filters.category !== debouncedFilters.category ||
      filters.sort !== debouncedFilters.sort;

    if (dropdownChanged) {
      // Apply immediately for dropdown/select changes
      clearTimeout(debounceTimerRef.current);
      setDebouncedFilters({ ...filters });
      return;
    }

    if (textChanged) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedFilters({ ...filters });
      }, 500);
    }

    return () => clearTimeout(debounceTimerRef.current);
  }, [filters]);

  // Fetch products when debouncedFilters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { limit: 20 };
        if (debouncedFilters.search) params.search = debouncedFilters.search;
        if (debouncedFilters.category) params.category = debouncedFilters.category;
        if (debouncedFilters.minPrice) params.minPrice = debouncedFilters.minPrice;
        if (debouncedFilters.maxPrice) params.maxPrice = debouncedFilters.maxPrice;
        if (debouncedFilters.sort) params.sort = debouncedFilters.sort;
        const res = await productService.getAll(params);
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [debouncedFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Force immediate apply on Enter
    clearTimeout(debounceTimerRef.current);
    setDebouncedFilters({ ...filters });
    setSearchParams(filters.search ? { q: filters.search } : {});
  };

  const clearFilters = () => {
    const cleared = { search: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt' };
    setFilters(cleared);
    setDebouncedFilters(cleared);
    setSearchParams({});
  };

  const activeFilterCount = [filters.category, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  const selectCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all";

  const FilterSidebar = () => (
    <div className="space-y-5">
      <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4" /> Filters
        {activeFilterCount > 0 && (
          <span className="ml-auto px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">{activeFilterCount}</span>
        )}
      </h3>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className={selectCls}>
          <option value="">All Categories</option>
          {categories.map((cat) => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range (₹)</label>
        <div className="flex gap-2">
          <input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} placeholder="Min" className={selectCls} />
          <input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} placeholder="Max" className={selectCls} />
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 italic">Prices apply after you stop typing</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className={selectCls}>
          <option value="-createdAt">Newest First</option>
          <option value="price">Price: Low → High</option>
          <option value="-price">Price: High → Low</option>
          <option value="-views">Most Viewed</option>
        </select>
      </div>
      <button onClick={clearFilters} className="w-full py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Gradient Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          Discover <span className="gradient-text">Products</span>
        </h1>
        <p className="text-gray-500 text-sm">Find exactly what you're looking for</p>
      </motion.div>

      {/* Search Bar */}
      <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search products, categories, sellers..."
            className="w-full pl-12 pr-12 py-3.5 text-base border border-gray-200 rounded-2xl bg-white shadow-md focus:shadow-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
          <button type="button" onClick={() => setShowMobileFilters(true)}
            className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-100 rounded-full text-indigo-600 hover:bg-indigo-200 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </motion.form>

      <div className="flex gap-8">
        {/* Sidebar — Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-20">
            <FilterSidebar />
          </motion.div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
              {loading ? <span className="skeleton inline-block w-32 h-4" /> : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span><strong className="text-gray-800">{total}</strong> product{total !== 1 ? 's' : ''} found</span>
                </>
              )}
            </p>
          </motion.div>

          {loading ? (
            <SkeletonList count={8} />
          ) : products.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="product-grid">
              {products.map((product, idx) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-5">
                <SearchIcon className="w-10 h-10 text-indigo-300" />
              </div>
              <p className="text-lg font-semibold text-gray-600 mb-2">No products found</p>
              <p className="text-sm text-gray-400 max-w-sm mb-5">Try adjusting your search or filters to find what you're looking for.</p>
              <button onClick={clearFilters} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 top-0 h-full w-72 bg-white p-6 shadow-xl overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2"><Filter className="w-5 h-5 text-indigo-500" />Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <FilterSidebar />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
