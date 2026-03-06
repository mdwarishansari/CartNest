import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PageSpinner } from '../components/ui/Spinner';

const Cart = () => {
  const { cart, loading, cartCount, cartTotal, updateQty, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) return <PageSpinner />;
  const items = cart?.items || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Shopping Cart</h1>
          {items.length > 0 && <p className="text-sm text-gray-500 mt-1">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>}
        </div>
        {items.length > 0 && (
          <button onClick={clearCart} className="px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all">Clear All</button>
        )}
      </motion.div>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center py-20">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-lg font-semibold text-gray-600 mb-2">Your cart is empty</p>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">Browse our products and add your favorites to the cart.</p>
          <Link to="/search" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
            <ArrowLeft className="w-4 h-4" /> Browse Products
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {items.map((item, idx) => {
              const product = item.productId;
              if (!product) return null;
              const imageUrl = product.images?.[0]?.url || 'https://placehold.co/100x100/e2e8f0/94a3b8?text=N';
              return (
                <motion.div
                  key={item._id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md p-5 transition-all"
                >
                  <div className="flex gap-5">
                    <Link to={`/product/${product.slug}`} className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      <img src={imageUrl} alt={product.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${product.slug}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600 line-clamp-2 transition-colors">{product.title}</Link>
                      <p className="text-sm text-gray-500 mt-1">₹{product.price?.toLocaleString('en-IN')} each</p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                          <button onClick={() => updateQty(product._id, Math.max(1, item.qty - 1))} className="p-2.5 hover:bg-gray-100 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="px-4 text-sm font-semibold min-w-[36px] text-center">{item.qty}</span>
                          <button onClick={() => updateQty(product._id, item.qty + 1)} className="p-2.5 hover:bg-gray-100 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-gray-900">₹{(product.price * item.qty).toLocaleString('en-IN')}</span>
                          <button onClick={() => removeItem(product._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50 p-6 mt-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Items ({cartCount})</span>
              <span className="font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-600">Delivery</span>
              <span className="text-green-600 font-medium text-sm">Free</span>
            </div>
            <div className="flex items-center justify-between text-xl font-bold border-t border-indigo-200/50 pt-4 mt-4">
              <span>Total</span>
              <span className="gradient-text">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="w-full mt-5 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cart;
