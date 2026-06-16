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
    <div className="bg-cream-paper min-h-screen font-graphik">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading sm:text-heading-lg font-nantes text-ink-black">
                Shopping <span className="relative inline-block">Cart<span className="absolute bottom-1 left-0 w-full h-[2.5px] bg-butter-highlight -z-10" /></span>
              </h1>
              {items.length > 0 && <p className="text-caption text-smoke mt-1">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>}
            </div>
            {items.length > 0 && (
              <button onClick={clearCart}
                className="px-4 py-2 text-caption font-semibold text-smoke hover:text-ink-black hover:bg-pure-white rounded-md border border-ash transition-all">
                Clear All
              </button>
            )}
          </div>
        </motion.div>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-ash rounded-md bg-pure-white">
            <div className="w-20 h-20 rounded-full bg-cream-paper border border-ash flex items-center justify-center mb-5">
              <ShoppingBag className="w-8 h-8 text-smoke" />
            </div>
            <p className="text-subheading font-normal text-charcoal mb-2">Your cart is empty</p>
            <p className="text-caption text-smoke mb-6 max-w-sm">Browse our amazing products and add your favorites to the cart.</p>
            <Link to="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black text-pure-white rounded-md text-caption hover:bg-charcoal transition-all">
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
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15, height: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-pure-white rounded-md border border-ash p-4 sm:p-5 transition-all group"
                    >
                      <div className="flex gap-4">
                        <Link to={`/product/${product.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-cream-paper shrink-0 border border-ash/40">
                          <img src={imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${product.slug}`}
                            className="text-caption font-normal text-charcoal hover:text-ink-black line-clamp-2 transition-colors">
                            {product.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-body font-normal text-ink-black">₹{product.price?.toLocaleString('en-IN')}</span>
                            {product.mrp && product.mrp > product.price && (
                              <>
                                <span className="text-caption text-smoke line-through">₹{product.mrp?.toLocaleString('en-IN')}</span>
                                <span className="px-1.5 py-0.5 bg-butter-highlight text-ink-black border border-ink-black/10 text-[9px] font-semibold rounded-md">{itemDiscount}% off</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-ash rounded-md overflow-hidden bg-pure-white">
                              <button onClick={() => updateQty(product._id, Math.max(1, item.qty - 1))}
                                className="p-2 hover:bg-cream-paper transition-colors active:bg-ash/20">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-caption font-semibold min-w-[28px] text-center bg-pure-white text-ink-black">{item.qty}</span>
                              <button onClick={() => updateQty(product._id, item.qty + 1)}
                                className="p-2 hover:bg-cream-paper transition-colors active:bg-ash/20">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-body font-semibold text-ink-black">₹{(product.price * item.qty).toLocaleString('en-IN')}</span>
                              <button onClick={() => removeItem(product._id)}
                                className="p-2 text-smoke hover:text-ink-black hover:bg-cream-paper rounded-md border border-transparent hover:border-ash transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
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
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-pure-white rounded-md border border-ash overflow-hidden sticky top-24">
                <div className="p-6">
                  <h3 className="font-semibold text-caption uppercase tracking-wider text-ink-black mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-smoke" /> Price Details
                  </h3>
                  <div className="space-y-3 text-caption text-charcoal">
                    <div className="flex justify-between"><span className="text-smoke">Price ({cartCount} items)</span><span className="font-medium text-ink-black">₹{totalMrp.toLocaleString('en-IN')}</span></div>
                    {savings > 0 && (
                      <div className="flex justify-between"><span className="text-smoke">Discount</span><span className="text-green-700 font-semibold">-₹{savings.toLocaleString('en-IN')}</span></div>
                    )}
                    <div className="flex justify-between"><span className="text-smoke">Delivery</span><span className="text-green-700 font-semibold">FREE</span></div>
                  </div>

                  <hr className="border-ash/40 my-4" />

                  <div className="flex justify-between text-body font-semibold text-ink-black">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {savings > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                      className="mt-4 px-3 py-2 bg-butter-highlight border border-ink-black/10 rounded-md text-center">
                      <p className="text-[11px] font-semibold text-ink-black flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 fill-ink-black/10" /> You save ₹{savings.toLocaleString('en-IN')} on this order!
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="px-6 pb-6">
                  <button onClick={() => navigate('/checkout')}
                    className="w-full py-3 bg-ink-black text-pure-white font-semibold rounded-md hover:bg-charcoal transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-caption">
                    Checkout <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-cream-paper px-6 py-2.5 border-t border-ash/40">
                  <div className="flex items-center justify-center gap-4 text-[10px] text-smoke font-medium">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-700" /> Secure</span>
                    <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-charcoal" /> Fast Delivery</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
