import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService, paymentService } from '../services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

const Checkout = () => {
  const { cartTotal, cartCount, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    house: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.house || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill all address fields');
      return;
    }

    setLoading(true);
    try {
      // 1. Create order + reserve stock
      const orderRes = await orderService.checkout(address);
      const { order, razorpay } = orderRes.data;

      if (!razorpay) {
        toast.success('Order placed (payment gateway not configured)');
        await fetchCart();
        navigate(`/orders`);
        return;
      }

      // 2. Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment SDK failed to load'); setLoading(false); return; }

      // 3. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: 'CartNest',
        description: `Order ${order.orderId}`,
        order_id: razorpay.order_id,
        handler: async (response) => {
          try {
            await paymentService.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });
            toast.success('Payment successful! Order placed.');
            await fetchCart();
            navigate('/orders');
          } catch (err) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
        prefill: { name: address.name, email: user?.email },
        theme: { color: '#4f46e5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => toast.error('Payment failed'));
      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="page-title mb-6">Checkout</h1>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleCheckout}>
        {/* Shipping Address */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-indigo-500" />Shipping Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input name="name" value={address.name} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input name="phone" value={address.phone} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input name="pincode" value={address.pincode} onChange={handleChange} className="input" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">House / Street / Area</label>
              <input name="house" value={address.house} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input name="city" value={address.city} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input name="state" value={address.state} onChange={handleChange} className="input" required />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-500" />Order Summary</h2>
          <div className="flex justify-between mb-2 text-sm"><span>Items ({cartCount})</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between text-lg font-bold border-t pt-3 mt-2"><span>Total</span><span className="gradient-text">₹{cartTotal.toLocaleString('en-IN')}</span></div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg mt-4">
            {loading ? <Spinner size="sm" /> : <><CreditCard className="w-5 h-5" />Pay ₹{cartTotal.toLocaleString('en-IN')}</>}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default Checkout;
