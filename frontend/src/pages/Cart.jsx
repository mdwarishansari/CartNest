import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, Truck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PageSpinner } from '../components/ui/Spinner';

const Cart = () => {
  const { cart, loading, cartCount, cartTotal, updateQty, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) return <PageSpinner />;
  const items = cart?.items || [];

  // Calculate savings
  const totalMrp = items.reduce((sum, item) => {
    const product = item.productId;
    if (!product) return sum;
    return sum + (product.mrp || product.price) * item.qty;
  }, 0);
  const savings = totalMrp - cartTotal;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Shopping <span className="gradient-text">Cart</span>
            </h1>
            {items.length > 0 && <p className="text-sm text-gray-500 mt-1">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>}
          </div>
          {items.length > 0 && (
            <button onClick={clearCart}
              className="px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200">
              Clear All
            </button>
          )}
        </div>
      </motion.div>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-center py-20">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-5">
            <ShoppingBag className="w-12 h-12 text-indigo-300" />
          </div>
          <p className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</p>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">Browse our amazing products and add your favorites to the cart.</p>
          <Link to="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <ArrowLeft className="w-4 h-4" /> Browse Products
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item, idx) => {
                const product = item.productId;
                if (!product) return null;
                const imageUrl = product.images?.[0]?.url || 'https://placehold.co/100x100/e2e8f0/94a3b8?text=N';
                const itemDiscount = product.mrp && product.mrp > product.price
                  ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
                return (
                  <motion.div
                    key={item._id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md p-4 sm:p-5 transition-all group"
                  >
                    <div className="flex gap-4">
                      <Link to={`/product/${product.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                        <img src={imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${product.slug}`}
                          className="text-sm font-semibold text-gray-900 hover:text-indigo-600 line-clamp-2 transition-colors">
                          {product.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-base font-bold text-gray-900">₹{product.price?.toLocaleString('en-IN')}</span>
                          {product.mrp && product.mrp > product.price && (
                            <>
                              <span className="text-xs text-gray-400 line-through">₹{product.mrp?.toLocaleString('en-IN')}</span>
                              <span className="text-xs font-bold text-green-600">{itemDiscount}% off</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                            <button onClick={() => updateQty(product._id, Math.max(1, item.qty - 1))}
                              className="p-2 hover:bg-gray-100 transition-colors active:bg-gray-200">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3.5 text-sm font-bold min-w-[32px] text-center">{item.qty}</span>
                            <button onClick={() => updateQty(product._id, item.qty + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors active:bg-gray-200">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-extrabold text-gray-900">₹{(product.price * item.qty).toLocaleString('en-IN')}</span>
                            <button onClick={() => removeItem(product._id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-20">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-500" />Price Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Price ({cartCount} items)</span><span className="font-medium">₹{totalMrp.toLocaleString('en-IN')}</span></div>
                  {savings > 0 && (
                    <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-600 font-semibold">-₹{savings.toLocaleString('en-IN')}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="text-green-600 font-semibold">FREE</span></div>
                </div>

                <div className="section-divider" />

                <div className="flex justify-between text-lg font-extrabold">
                  <span>Total</span>
                  <span className="gradient-text">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                {savings > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="mt-3 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 text-center">
                    <p className="text-xs font-bold text-green-700 flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />You save ₹{savings.toLocaleString('en-IN')} on this order!
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="px-6 pb-6">
                <button onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.99] flex items-center justify-center gap-2">
                  Checkout <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 px-6 py-3 border-t border-indigo-100/40">
                <div className="flex items-center justify-center gap-4 text-[10px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-500" />Secure</span>
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-blue-500" />Fast Delivery</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
