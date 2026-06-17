import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { orderService } from '../services';
import { OrdersSkeleton } from '../components/ui/Skeletons';
import ErrorState from '../components/ui/ErrorState';

const statusColors = {
  pending: 'bg-[#fbf7f4] text-[#8c6d58] border border-[#ebdcd0]',
  confirmed: 'bg-[#fbf7f4] text-[#8c6d58] border border-[#ebdcd0]',
  shipped: 'bg-[#fbf7f4] text-[#8c6d58] border border-[#ebdcd0]',
  delivered: 'bg-[#f4f9f4] text-[#1e4620] border border-[#d0e5d2]',
  cancelled: 'bg-[#fcf5f5] text-[#7d2d2d] border border-[#f5d5d5]',
  paid: 'bg-[#f4f9f4] text-[#1e4620] border border-[#d0e5d2]',
  failed: 'bg-[#fcf5f5] text-[#7d2d2d] border border-[#f5d5d5]',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await orderService.getMyOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="bg-cream-paper min-h-screen font-graphik py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <div className="skeleton w-40 h-10 rounded-md" />
          </div>
          <OrdersSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-cream-paper min-h-screen font-graphik py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <ErrorState
            title="Failed to Load Orders"
            message="We couldn't retrieve your order history. Please try again."
            onRetry={fetchOrders}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-paper min-h-screen font-graphik py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-heading sm:text-heading-lg font-nantes text-ink-black">My Orders</h1>
        </motion.div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-pure-white border border-ash rounded-md">
            <Package className="w-12 h-12 text-smoke mb-4" />
            <p className="text-subheading font-normal text-charcoal mb-2">No orders yet</p>
            <p className="text-caption text-smoke">Your orders will appear here once you make a purchase.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-pure-white rounded-md border border-ash overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-cream-paper/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-cream-paper border border-ash flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-smoke" />
                    </div>
                    <div>
                      <p className="text-caption font-semibold text-charcoal">Order #{order.orderId || order._id.slice(-8)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-smoke" />
                        <span className="text-xs text-smoke">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-3xl uppercase tracking-wider ${statusColors[order.orderStatus] || 'bg-cream-paper text-smoke border border-ash'}`}>{order.orderStatus}</span>
                    <span className="text-caption font-bold text-ink-black">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    {expanded === order._id ? <ChevronUp className="w-4 h-4 text-smoke" /> : <ChevronDown className="w-4 h-4 text-smoke" />}
                  </div>
                </button>

                {expanded === order._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-ash px-5 pb-5 overflow-hidden">
                    <div className="space-y-3 pt-4">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-md bg-cream-paper border border-ash/40">
                          <img src={item.productId?.images?.[0]?.url || 'https://placehold.co/48x48/e2e8f0/94a3b8?text=P'} alt="" className="w-12 h-12 rounded-md object-cover bg-pure-white border border-ash/50" />
                          <div className="flex-1 min-w-0">
                            <p className="text-caption font-semibold text-charcoal truncate">{item.productId?.title || 'Product'}</p>
                            <p className="text-xs text-smoke">Qty: {item.qty} × ₹{item.price?.toLocaleString('en-IN')}</p>
                          </div>
                          <p className="text-caption font-bold text-ink-black">₹{(item.qty * item.price)?.toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-ash">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-3xl uppercase tracking-wider ${statusColors[order.paymentStatus] || 'bg-cream-paper text-smoke border border-ash'}`}>Payment: {order.paymentStatus}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
