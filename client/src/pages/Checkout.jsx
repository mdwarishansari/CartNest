import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, MapPin, Plus, CheckCircle, Truck, ShieldCheck, Home, Building, ChevronDown, Package, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService, paymentService, userService } from '../services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import { CheckoutSkeleton } from '../components/ui/Skeletons';


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
        theme: { color: '#000000' },
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

  const inputCls = "w-full px-3 py-2 text-caption border border-ash rounded-md bg-pure-white focus:border-ink-black outline-none transition-all font-graphik text-charcoal placeholder:text-smoke";

  if (profileLoading) {
    return (
      <div className="bg-cream-paper min-h-screen font-graphik">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <div className="skeleton w-36 h-10 rounded-md animate-pulse" />
            <div className="skeleton w-52 h-4 rounded mt-2 animate-pulse" />
          </div>
          <div className="skeleton w-full h-14 rounded-md mb-8 animate-pulse" />
          <CheckoutSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-paper min-h-screen font-graphik">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-heading sm:text-heading-lg font-nantes text-ink-black">
            Checkout
          </h1>
          <p className="text-caption text-smoke mt-1">Complete your purchase securely</p>
        </motion.div>

        {/* Step Indicator */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center justify-center mb-8 bg-pure-white border border-ash p-4 rounded-md">
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border ${step > 1 ? 'bg-ink-black text-pure-white border-ink-black' : step === 1 ? 'bg-ink-black text-pure-white border-ink-black' : 'bg-pure-white text-smoke border-ash'}`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="font-graphik">Shipping</span>
            </div>
            <div className={`step-line ${step > 1 ? 'active' : ''}`} />
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border ${step === 2 ? 'bg-ink-black text-pure-white border-ink-black' : 'bg-pure-white text-smoke border-ash'}`}>
                2
              </div>
              <span className="font-graphik">Payment</span>
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
                    <h2 className="flex items-center gap-2 font-nantes text-heading-sm text-ink-black">
                      <MapPin className="w-5 h-5 text-smoke" />Saved Addresses
                    </h2>
                    <button onClick={() => { setShowNewForm(!showNewForm); if (!showNewForm) setSelectedAddressId(null); }}
                      className="inline-flex items-center gap-1.5 text-caption font-semibold text-charcoal hover:text-ink-black border-b border-charcoal transition-colors">
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
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedAddressId === addr._id ? 'bg-ink-black text-pure-white' : 'bg-cream-paper text-smoke'} border border-ash transition-colors`}>
                              {addr.label === 'Work' || addr.label === 'Office' ? <Building className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-caption font-semibold text-charcoal">{addr.name}</p>
                                {addr.label && (
                                  <span className="px-2 py-0.5 bg-cream-paper border border-ash text-[10px] font-semibold uppercase rounded-md text-smoke">{addr.label}</span>
                                )}
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 bg-butter-highlight border border-ink-black/10 text-[10px] font-semibold uppercase rounded-md text-ink-black">Default</span>
                                )}
                              </div>
                              <p className="text-caption text-charcoal">{addr.house}</p>
                              <p className="text-caption text-smoke">{addr.city}, {addr.state} — {addr.pincode}</p>
                              <p className="text-[12px] text-smoke mt-1">{addr.phone}</p>
                            </div>
                          </div>
                          <div className={`check-circle ${selectedAddressId === addr._id ? 'flex items-center justify-center border-ink-black bg-ink-black' : ''}`}>
                            {selectedAddressId === addr._id && <span className="w-1.5 h-1.5 rounded-full bg-pure-white" />}
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
                  className="bg-pure-white rounded-md border border-ash p-6 mb-6">
                  <h2 className="font-nantes text-heading-sm mb-5 flex items-center gap-2 text-ink-black">
                    <MapPin className="w-5 h-5 text-smoke" />
                    {savedAddresses.length > 0 ? 'New Address' : 'Shipping Address'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-caption font-semibold text-charcoal mb-1.5">Full Name</label>
                      <input name="name" value={address.name} onChange={handleChange} className={inputCls} required placeholder="Recipient name" />
                    </div>
                    <div>
                      <label className="block text-caption font-semibold text-charcoal mb-1.5">Phone</label>
                      <input name="phone" value={address.phone} onChange={handleChange} className={inputCls} required placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div>
                      <label className="block text-caption font-semibold text-charcoal mb-1.5">Pincode</label>
                      <input name="pincode" value={address.pincode} onChange={handleChange} className={inputCls} required placeholder="110001" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-caption font-semibold text-charcoal mb-1.5">House / Street / Area</label>
                      <input name="house" value={address.house} onChange={handleChange} className={inputCls} required placeholder="123, Main Street, Area" />
                    </div>
                    <div>
                      <label className="block text-caption font-semibold text-charcoal mb-1.5">City</label>
                      <input name="city" value={address.city} onChange={handleChange} className={inputCls} required placeholder="City" />
                    </div>
                    <div>
                      <label className="block text-caption font-semibold text-charcoal mb-1.5">State</label>
                      <input name="state" value={address.state} onChange={handleChange} className={inputCls} required placeholder="State" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Continue Button */}
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                onClick={proceedToPayment}
                className="w-full py-3 bg-ink-black text-pure-white font-semibold text-caption rounded-md hover:bg-charcoal transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer">
                Continue to Payment <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
              </motion.button>
            </motion.div>
          )}

          {/* ═══ Step 2: Payment ═══ */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Selected Address Summary */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-pure-white rounded-md border border-ash p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="flex items-center gap-2 font-nantes text-heading-sm text-ink-black">
                    <Truck className="w-5 h-5 text-smoke" />Delivering to
                  </h3>
                  <button onClick={() => setStep(1)} className="text-caption font-semibold text-charcoal hover:text-ink-black border-b border-charcoal transition-colors">Change</button>
                </div>
                {(() => {
                  const addr = getShippingAddress();
                  return (
                    <div className="bg-cream-paper rounded-md p-4 border border-ash">
                      <p className="text-caption font-semibold text-charcoal">{addr.name}</p>
                      <p className="text-caption text-charcoal">{addr.house}, {addr.city}</p>
                      <p className="text-caption text-smoke">{addr.state} — {addr.pincode}</p>
                      <p className="text-xs text-smoke mt-1">{addr.phone}</p>
                    </div>
                  );
                })()}
              </motion.div>

              {/* Order Summary */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-pure-white rounded-md border border-ash overflow-hidden mb-6">
                <div className="p-6">
                  <h2 className="flex items-center gap-2 font-nantes text-heading-sm text-ink-black mb-5">
                    <Package className="w-5 h-5 text-smoke" />Order Summary
                  </h2>
                  <div className="space-y-3 mb-4 font-graphik">
                    <div className="flex justify-between text-caption"><span className="text-smoke">Items ({cartCount})</span><span className="font-semibold text-ink-black">₹{cartTotal.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between text-caption"><span className="text-smoke">Delivery</span><span className="text-ink-black font-semibold">FREE</span></div>
                  </div>
                  <div className="section-divider" />
                  <div className="flex justify-between text-subheading font-bold pt-1 text-ink-black">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Security badges */}
                <div className="bg-cream-paper px-6 py-4 border-t border-ash">
                  <div className="flex items-center gap-4 justify-center text-[10px] text-smoke font-medium">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-charcoal" />Secure Payment</span>
                    <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-charcoal" />Fast Delivery</span>
                    <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-charcoal" />Easy Returns</span>
                  </div>
                </div>
              </motion.div>

              {/* Pay Button */}
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                onClick={handleCheckout} disabled={loading}
                className="w-full py-3 bg-ink-black text-pure-white font-semibold text-caption rounded-md hover:bg-charcoal transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer">
                {loading ? <Spinner size="sm" /> : <><CreditCard className="w-4 h-4" />Pay ₹{cartTotal.toLocaleString('en-IN')}</>}
              </motion.button>

              {/* Back button */}
              <button onClick={() => setStep(1)}
                className="w-full mt-3 py-2 text-caption font-semibold text-smoke hover:text-ink-black transition-colors text-center cursor-pointer">
                ← Back to Address
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Checkout;
