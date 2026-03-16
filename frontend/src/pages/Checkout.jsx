import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, MapPin, Plus, CheckCircle, Truck, ShieldCheck, Home, Building, ChevronDown, Package, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService, paymentService, userService } from '../services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

const Checkout = () => {
  const { cartTotal, cartCount, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [step, setStep] = useState(1); // 1 = address, 2 = payment
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    house: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await userService.getProfile();
        const addrs = res.data?.user?.addressBook || [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          setSelectedAddressId(defaultAddr._id);
        } else {
          setShowNewForm(true);
        }
      } catch (err) {
        console.error(err);
        setShowNewForm(true);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const getShippingAddress = () => {
    if (selectedAddressId && !showNewForm) {
      const saved = savedAddresses.find((a) => a._id === selectedAddressId);
      if (saved) return { name: saved.name, phone: saved.phone, house: saved.house, city: saved.city, state: saved.state, pincode: saved.pincode, country: saved.country };
    }
    return address;
  };

  const proceedToPayment = () => {
    const addr = getShippingAddress();
    if (!addr.name || !addr.phone || !addr.house || !addr.city || !addr.state || !addr.pincode) {
      toast.error('Please fill all address fields');
      return;
    }
    setStep(2);
  };

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

  const handleCheckout = async () => {
    setLoading(true);
    const shippingAddress = getShippingAddress();
    try {
      const orderRes = await orderService.checkout(shippingAddress);
      const { order, razorpay } = orderRes.data;

      if (!razorpay) {
        toast.success('Order placed (payment gateway not configured)');
        await fetchCart();
        navigate('/orders');
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment SDK failed to load'); setLoading(false); return; }

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
        prefill: { name: shippingAddress.name, email: user?.email },
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

  const inputCls = "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          <span className="gradient-text">Checkout</span>
        </h1>
        <p className="text-gray-500 text-sm">Complete your purchase securely</p>
      </motion.div>

      {/* Step Indicator */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex items-center justify-center mb-8">
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${step > 1 ? 'bg-green-500 text-white' : step === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
            </div>
            <span>Address</span>
          </div>
          <div className={`step-line ${step > 1 ? 'active' : ''}`} />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <span>Payment</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ═══ Step 1: Address ═══ */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {/* Saved Addresses */}
            {!profileLoading && savedAddresses.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 font-bold text-gray-900">
                    <MapPin className="w-5 h-5 text-indigo-500" />Saved Addresses
                  </h2>
                  <button onClick={() => { setShowNewForm(!showNewForm); if (!showNewForm) setSelectedAddressId(null); }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                    <Plus className="w-4 h-4" />{showNewForm ? 'Select Saved' : 'Add New'}
                  </button>
                </div>

                {!showNewForm && (
                  <div className="grid gap-3">
                    {savedAddresses.map((addr) => (
                      <motion.div key={addr._id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`address-card ${selectedAddressId === addr._id ? 'selected' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedAddressId === addr._id ? 'bg-indigo-100' : 'bg-gray-100'} transition-colors`}>
                            {addr.label === 'Work' || addr.label === 'Office' ? <Building className="w-5 h-5 text-gray-500" /> : <Home className="w-5 h-5 text-gray-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-bold text-gray-900">{addr.name}</p>
                              {addr.label && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-md">{addr.label}</span>
                              )}
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold uppercase rounded-md">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{addr.house}</p>
                            <p className="text-sm text-gray-500">{addr.city}, {addr.state} — {addr.pincode}</p>
                            <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                          </div>
                        </div>
                        <div className={`check-circle ${selectedAddressId === addr._id ? 'flex items-center justify-center' : ''}`}>
                          {selectedAddressId === addr._id && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* New Address Form */}
            {(showNewForm || savedAddresses.length === 0) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  {savedAddresses.length > 0 ? 'New Address' : 'Shipping Address'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <input name="name" value={address.name} onChange={handleChange} className={inputCls} required placeholder="Recipient name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                    <input name="phone" value={address.phone} onChange={handleChange} className={inputCls} required placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode</label>
                    <input name="pincode" value={address.pincode} onChange={handleChange} className={inputCls} required placeholder="110001" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">House / Street / Area</label>
                    <input name="house" value={address.house} onChange={handleChange} className={inputCls} required placeholder="123, Main Street, Area" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                    <input name="city" value={address.city} onChange={handleChange} className={inputCls} required placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                    <input name="state" value={address.state} onChange={handleChange} className={inputCls} required placeholder="State" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Continue Button */}
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              onClick={proceedToPayment}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.99] flex items-center justify-center gap-2">
              Continue to Payment <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
            </motion.button>
          </motion.div>
        )}

        {/* ═══ Step 2: Payment ═══ */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Selected Address Summary */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center gap-2 font-bold text-gray-900">
                  <Truck className="w-5 h-5 text-green-500" />Delivering to
                </h3>
                <button onClick={() => setStep(1)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Change</button>
              </div>
              {(() => {
                const addr = getShippingAddress();
                return (
                  <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-xl p-4 border border-green-100/60">
                    <p className="text-sm font-bold text-gray-800">{addr.name}</p>
                    <p className="text-sm text-gray-600">{addr.house}, {addr.city}</p>
                    <p className="text-sm text-gray-500">{addr.state} — {addr.pincode}</p>
                    <p className="text-xs text-gray-400 mt-1">{addr.phone}</p>
                  </div>
                );
              })()}
            </motion.div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="flex items-center gap-2 font-bold text-lg text-gray-900 mb-5">
                  <Package className="w-5 h-5 text-indigo-500" />Order Summary
                </h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Items ({cartCount})</span><span className="font-medium">₹{cartTotal.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery</span><span className="text-green-600 font-semibold">FREE</span></div>
                </div>
                <div className="section-divider" />
                <div className="flex justify-between text-xl font-extrabold pt-1">
                  <span>Total</span>
                  <span className="gradient-text">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Security badges */}
              <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 px-6 py-4 border-t border-indigo-100/40">
                <div className="flex items-center gap-4 justify-center text-xs text-gray-500">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-500" />Secure Payment</span>
                  <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-blue-500" />Fast Delivery</span>
                  <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-purple-500" />Easy Returns</span>
                </div>
              </div>
            </motion.div>

            {/* Pay Button */}
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              onClick={handleCheckout} disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Spinner size="sm" /> : <><CreditCard className="w-5 h-5" />Pay ₹{cartTotal.toLocaleString('en-IN')}</>}
            </motion.button>

            {/* Back button */}
            <button onClick={() => setStep(1)}
              className="w-full mt-3 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              ← Back to Address
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
