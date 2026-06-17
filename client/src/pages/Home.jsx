import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Store, Sparkles, Package, Truck } from 'lucide-react';
import { productService, categoryService } from '../services';
import ProductCard from '../components/ui/ProductCard';
import { SkeletonList } from '../components/ui/Spinner';
import { HeroSkeleton, CategoryChipsSkeleton } from '../components/ui/Skeletons';
import ErrorState from '../components/ui/ErrorState';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [productsTotal, setProductsTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getAll({ limit: 8 }),
        categoryService.getAll(),
      ]);
      setProducts(prodRes.data.products || []);
      setProductsTotal(prodRes.data.total || 0);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch home data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="bg-cream-paper min-h-screen py-16">
        <ErrorState
          title="Failed to Load Marketplace"
          message="We encountered an error loading the marketplace data. Please check your connection and try again."
          onRetry={fetchData}
        />
      </div>
    );
  }

  return (
    <div className="bg-cream-paper min-h-screen">
      {/* ─── Hero Section ─── */}
      {loading ? (
        <HeroSkeleton />
      ) : (
        <section className="relative overflow-hidden bg-cream-paper border-b border-ash py-16 sm:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-pure-white border border-ash rounded-3xl text-caption font-graphik text-charcoal mb-6"
            >
              <Sparkles className="w-4 h-4 text-ink-black fill-butter-highlight" />
              <span className="tracking-wide">Direct from Verified Local Sellers</span>
            </motion.div>

            <h1 className="text-display sm:text-[42px] lg:text-[52px] font-nantes text-ink-black leading-[1.2] mb-6">
              Discover Unique Products from{' '}
              <span className="relative inline-block">
                Local Artisans
                <span className="absolute bottom-1.5 left-0 w-full h-[3px] bg-butter-highlight -z-10" />
              </span>
            </h1>
            
            <p className="text-body font-graphik text-charcoal mb-10 leading-relaxed max-w-lg">
              Browse unique wholesale catalog styles, pay securely with Razorpay, and support active local marketplaces.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ink-black text-pure-white font-graphik rounded-md hover:bg-charcoal transition-all text-caption"
              >
                Browse Products <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/seller/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-pure-white text-ink-black border border-ash font-graphik rounded-md hover:bg-cream-paper transition-all text-caption"
              >
                Become a Seller
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Layered Custom UI Cards Composition (Interactive, No Photography) */}
          <div className="hidden lg:col-span-6 lg:flex relative justify-center items-center h-[420px]">
            {/* Background decorative shape */}
            <div className="absolute w-72 h-72 rounded-full border border-ash/60 bg-cream-paper/40 -z-10" />

            {/* 1. Featured Product Card */}
            {products.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="absolute w-60 bg-pure-white border border-ash rounded-md p-3 z-10"
                style={{ transform: 'rotate(-2deg)' }}
              >
                <Link to={`/product/${products[0].slug}`} className="block">
                  <div className="aspect-square bg-cream-paper rounded-md overflow-hidden relative mb-2.5">
                    {products[0].images?.[0]?.url ? (
                      <img
                        src={products[0].images[0].url}
                        alt={products[0].title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#e3ded9] to-[#c7c0b7] p-8">
                        <svg viewBox="0 0 100 100" className="w-24 h-24 text-charcoal/30">
                          <path d="M50,15 C45,15 40,25 40,40 C40,55 30,60 30,75 C30,85 70,85 70,75 C70,60 60,55 60,40 C60,25 55,15 50,15 Z" fill="#eae6e1" stroke="#333" strokeWidth="1" />
                          <line x1="30" y1="75" x2="70" y2="75" stroke="#333" strokeWidth="1" />
                          <ellipse cx="50" cy="15" rx="10" ry="3" fill="#ffffff" stroke="#333" strokeWidth="1" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-butter-highlight text-[8px] font-semibold border border-ink-black/10 rounded-md">Featured</span>
                  </div>
                  <div className="font-graphik text-[10px] text-smoke uppercase tracking-wider mb-0.5">
                    {products[0].sellerId?.shopName || 'Local Seller'}
                  </div>
                  <h3 className="font-graphik text-caption font-normal text-charcoal truncate mb-2">
                    {products[0].title}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-caption font-semibold text-ink-black">
                      ₹{products[0].price?.toLocaleString('en-IN')}
                    </span>
                    <span className="p-1 px-2 border border-ash rounded-md text-[10px] font-graphik font-semibold">View</span>
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="absolute w-60 bg-pure-white border border-ash rounded-md p-3 z-10"
                style={{ transform: 'rotate(-2deg)' }}
              >
                <div className="aspect-square bg-cream-paper rounded-md overflow-hidden relative mb-2.5">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#e3ded9] to-[#c7c0b7] p-8">
                    <svg viewBox="0 0 100 100" className="w-24 h-24 text-charcoal/30">
                      <path d="M50,15 C45,15 40,25 40,40 C40,55 30,60 30,75 C30,85 70,85 70,75 C70,60 60,55 60,40 C60,25 55,15 50,15 Z" fill="#eae6e1" stroke="#333" strokeWidth="1" />
                      <line x1="30" y1="75" x2="70" y2="75" stroke="#333" strokeWidth="1" />
                      <ellipse cx="50" cy="15" rx="10" ry="3" fill="#ffffff" stroke="#333" strokeWidth="1" />
                    </svg>
                  </div>
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-butter-highlight text-[8px] font-semibold border border-ink-black/10 rounded-md">Featured</span>
                </div>
                <div className="font-graphik text-[10px] text-smoke uppercase tracking-wider mb-0.5">Studio Clay</div>
                <h3 className="font-graphik text-caption font-normal text-charcoal truncate mb-2">Artisan Ceramic Vase</h3>
                <div className="flex justify-between items-center">
                  <span className="text-caption font-semibold text-ink-black">₹2,400</span>
                  <span className="p-1 px-2 border border-ash rounded-md text-[10px] font-graphik font-semibold">View</span>
                </div>
              </motion.div>
            )}

            {/* 3. Products Statistics Card */}
            <motion.div
              initial={{ opacity: 0, x: -50, y: 40 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              whileHover={{ scale: 1.03 }}
              className="absolute bottom-12 left-2 w-44 bg-pure-white border border-ash rounded-md p-3.5 z-20"
              style={{ transform: 'rotate(-5deg)' }}
            >
              <div className="text-[10px] font-graphik text-smoke uppercase tracking-wider mb-0.5">Marketplace Stats</div>
              <div className="text-heading font-nantes text-ink-black mb-1">
                {productsTotal > 0 ? `${productsTotal}` : '...'}
              </div>
              <div className="text-[9px] font-graphik text-smoke leading-tight">
                Verified artisan product{productsTotal !== 1 ? 's' : ''} currently listed for discovery
              </div>
            </motion.div>

            {/* 4. Category Chips & Secure Payment Tag */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-6 right-12 flex flex-col items-end gap-2 z-20"
            >
              <div className="px-3 py-1 bg-pure-white border border-ash rounded-md text-[10px] font-graphik text-charcoal">
                🛡️ Secure Razorpay Checkout
              </div>
              <div className="flex gap-1.5">
                {categories.slice(0, 2).map((cat) => (
                  <span key={cat._id} className="px-2.5 py-1 bg-[#f0f0f0] border border-ash rounded-md text-[9px] font-graphik text-charcoal">
                    {cat.name}
                  </span>
                ))}
                {categories.length === 0 && (
                  <>
                    <span className="px-2.5 py-1 bg-[#f0f0f0] border border-ash rounded-md text-[9px] font-graphik text-charcoal">Ceramics</span>
                    <span className="px-2.5 py-1 bg-[#f0f0f0] border border-ash rounded-md text-[9px] font-graphik text-charcoal">Decors</span>
                  </>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>
      )}

      {/* ─── Inverted Dark Trust Section ─── */}
      <section className="bg-ink-black text-pure-white py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-3xl mb-12">
            <div className="w-12 h-[3px] bg-butter-highlight mb-4" />
            <h2 className="text-heading sm:text-heading-lg lg:text-[38px] font-nantes text-pure-white leading-[1.27] mb-4">
              Get your products in front of buyers or find verified local suppliers.
            </h2>
            <p className="text-body font-graphik text-ash leading-relaxed">
              CartNest provides a quiet, editorial digital catalog for merchants to transact safely, build relationships, and scale local communities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Store, title: 'Verified Artisan Networks', desc: 'Every seller is verified by our inspection team to guarantee quality wholesale production.' },
              { icon: ShieldCheck, title: 'Secure Razorpay Payments', desc: 'All transactions are secure and backed by our merchant trade protection policy.' },
              { icon: Truck, title: 'Optimized Trade Logistics', desc: 'Get direct-from-artisan pricing with direct billing, clear shipping tracking, and support.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border-t border-ash/20 pt-6">
                <Icon className="w-6 h-6 text-butter-highlight mb-4" />
                <h3 className="text-subheading font-nantes text-pure-white mb-2">{title}</h3>
                <p className="text-caption font-graphik text-ash leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mb-8"
          >
            <div className="w-12 h-[3px] bg-butter-highlight mb-2" />
            <h2 className="text-heading sm:text-heading-lg font-nantes text-ink-black">Shop by Category</h2>
            <p className="text-smoke text-caption mt-1">Find products in your favorite categories</p>
          </motion.div>
          {loading ? (
            <CategoryChipsSkeleton />
          ) : categories.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/search?category=${encodeURIComponent(cat.slug)}`}
                    className="block shrink-0 px-6 py-3 rounded-3xl bg-pure-white border border-charcoal text-caption font-graphik text-ink-black hover:bg-ink-black hover:text-pure-white transition-all whitespace-nowrap"
                  >
                    {cat.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-caption text-smoke">No categories available.</p>
          )}
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="py-16 bg-pure-white border-t border-ash">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <div className="w-12 h-[3px] bg-butter-highlight mb-2" />
              <h2 className="text-heading sm:text-heading-lg font-nantes text-ink-black">Featured Products</h2>
              <p className="text-smoke text-caption mt-1">Hand-picked products just for you</p>
            </div>
            <Link to="/search" className="text-charcoal text-caption font-graphik hover:text-ink-black hover:underline inline-flex items-center gap-1 transition-colors">
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
            <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in font-graphik border border-dashed border-ash rounded-md bg-cream-paper">
              <Package className="w-12 h-12 text-smoke mb-4" />
              <p className="text-subheading font-normal text-charcoal mb-2">No products yet</p>
              <p className="text-caption text-smoke max-w-sm mb-6">Products will appear here once sellers add them and they get verified.</p>
              <Link to="/seller/signup" className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black text-pure-white font-semibold rounded-md hover:bg-charcoal transition-all text-caption">
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
