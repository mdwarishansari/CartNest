import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Store, Sparkles, Package, Truck } from 'lucide-react';
import { productService, categoryService } from '../services';
import ProductCard from '../components/ui/ProductCard';
import { SkeletonList } from '../components/ui/Spinner';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getAll({ limit: 8 }),
          categoryService.getAll(),
        ]);
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-28 lg:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Trusted by 100+ Local Sellers
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              Discover Amazing Products from{' '}
              <span className="text-yellow-300">Local Sellers</span>
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 mb-10 leading-relaxed max-w-lg">
              Browse unique products, pay securely with Razorpay, and support small businesses.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-indigo-700 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all text-base"
              >
                Browse Products <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/seller/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 text-white border border-white/30 font-semibold rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all text-base"
              >
                Become a Seller
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 stagger-children">
            {[
              { icon: Store, label: 'Verified Sellers', value: 'Growing Network', color: 'bg-indigo-100 text-indigo-600' },
              { icon: ShieldCheck, label: 'Secure Payments', value: 'Powered by Razorpay', color: 'bg-green-100 text-green-600' },
              { icon: Truck, label: 'Fast Delivery', value: 'Best Prices Guaranteed', color: 'bg-amber-100 text-amber-600' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-4 p-5 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      {categories.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Shop by Category</h2>
              <p className="text-gray-500 text-sm mb-6">Find products in your favorite categories</p>
            </motion.div>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className="block shrink-0 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm font-semibold text-indigo-700 whitespace-nowrap"
                  >
                    {cat.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Featured Products ─── */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Featured Products</h2>
              <p className="text-gray-500 text-sm mt-1">Hand-picked products just for you</p>
            </div>
            <Link to="/search" className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 inline-flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          {loading ? (
            <SkeletonList count={8} />
          ) : products.length > 0 ? (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in">
              <Package className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-gray-600 mb-2">No products yet</p>
              <p className="text-sm text-gray-400 max-w-sm mb-6">Products will appear here once sellers add them and they get verified.</p>
              <Link to="/seller/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <Store className="w-4 h-4" /> Start Selling
              </Link>
            </div>
          )}
        </div>
      </section>

      
    </div>
  );
};

export default Home;
