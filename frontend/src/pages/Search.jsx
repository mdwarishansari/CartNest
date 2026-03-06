import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
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
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
  });

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { limit: 20 };
        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.sort) params.sort = filters.sort;
        const res = await productService.getAll(params);
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(filters.search ? { q: filters.search } : {});
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt' });
    setSearchParams({});
  };

  const selectCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all";

  const FilterSidebar = () => (
    <div className="space-y-5">
      <h3 className="font-semibold text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4" /> Filters
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
      {/* Search Bar */}
      <motion.form onSubmit={handleSearch} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search products, categories, sellers..."
            className="w-full pl-12 pr-12 py-3.5 text-base border border-gray-200 rounded-2xl bg-white shadow-md focus:shadow-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
          <button type="button" onClick={() => setShowMobileFilters(true)} className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-100 rounded-full text-indigo-600">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </motion.form>

      <div className="flex gap-8">
        {/* Sidebar — Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-20">
            <FilterSidebar />
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500 font-medium">
              {loading ? <span className="skeleton inline-block w-32 h-4" /> : `${total} product${total !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {loading ? (
            <SkeletonList count={8} />
          ) : products.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="product-grid">
              {products.map((product) => (<ProductCard key={product._id} product={product} />))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in">
              <SearchIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-gray-600 mb-2">No products found</p>
              <p className="text-sm text-gray-400 max-w-sm mb-4">Try adjusting your search or filters.</p>
              <button onClick={clearFilters} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <motion.div initial={{ x: -280 }} animate={{ x: 0 }} className="absolute left-0 top-0 h-full w-72 bg-white p-6 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-1.5 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <FilterSidebar />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Search;
