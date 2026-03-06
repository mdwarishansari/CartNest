import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { orderService } from '../services';
import { PageSpinner } from '../components/ui/Spinner';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    orderService.getMyOrders().then((res) => setOrders(res.data.orders || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-8">My Orders</h1>
      </motion.div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-lg font-semibold text-gray-600 mb-2">No orders yet</p>
          <p className="text-sm text-gray-400">Your orders will appear here once you make a purchase.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <button
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                className="w-full p-5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Order #{order.orderId || order._id.slice(-8)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>{order.orderStatus}</span>
                  <span className="text-lg font-bold text-gray-900">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                  {expanded === order._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {expanded === order._id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-gray-100 px-5 pb-5 overflow-hidden">
                  <div className="space-y-3 pt-4">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                        <img src={item.productId?.images?.[0]?.url || 'https://placehold.co/48x48/e2e8f0/94a3b8?text=P'} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.productId?.title || 'Product'}</p>
                          <p className="text-xs text-gray-500">Qty: {item.qty} × ₹{item.price?.toLocaleString('en-IN')}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">₹{(item.qty * item.price)?.toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${statusColors[order.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>Payment: {order.paymentStatus}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
