import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Upload, ArrowRight, CheckCircle, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from '../../config/firebase';
import { updateProfile } from 'firebase/auth';

const SellerSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', shopName: '', description: '' });
  const [showPass, setShowPass] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputCls = "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all";

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email are required'); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shopName.trim()) { toast.error('Shop name is required'); return; }
    setLoading(true);
    try {
      // 1. Create Firebase user
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(fbUser, { displayName: form.name });
      await sendEmailVerification(fbUser);

      // 2. Save seller registration data to localStorage so after login it auto-registers
      localStorage.setItem('pendingSellerRegistration', JSON.stringify({
        shopName: form.shopName,
        description: form.description,
      }));

      toast.success('Account created! Check email for verification then login.', { duration: 5000 });

      // Sign out so they verify email first, then login
      await auth.signOut();

      setTimeout(() => navigate('/auth/login'), 1500);
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'This email is already registered. Login first, then contact support to convert to seller.'
        : err.message;
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
            <img src="/logo.png" alt="CartNest" className="w-16 h-16 rounded-2xl object-contain mx-auto mb-5 shadow-lg" />
          </motion.div>
          <h1 className="text-3xl font-extrabold gradient-text mb-2">Seller Registration</h1>
          <p className="text-gray-500 text-sm">Create your seller account on CartNest</p>
          {/* Steps */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
              Account
            </div>
            <div className="w-8 h-px bg-gray-300" />
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
              Shop Details
            </div>
          </div>
        </div>

        {/* Benefits */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
          <ul className="grid grid-cols-2 gap-2">
            {['Free to start', 'Secure payments', 'Image uploads', 'Analytics dashboard'].map((b, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium"><CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />{b}</li>
            ))}
          </ul>
        </motion.div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-7 sm:p-8">
          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5">
              <p className="text-sm font-bold text-gray-700 mb-1">Account Details</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputCls} pl-11`} placeholder="John Doe" required autoFocus />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputCls} pl-11`} placeholder="seller@example.com" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`${inputCls} pl-11 pr-11`}
                    placeholder="Minimum 6 characters" required minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Minimum 6 characters</p>
              </div>
              <button type="submit" className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <span className="flex items-center justify-center gap-2">Next: Shop Details <ArrowRight className="w-4 h-4" /></span>
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-700">Shop Details</p>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-indigo-600 hover:underline">← Back</button>
              </div>
              <div className="flex flex-col items-center">
                <label className="relative w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-indigo-500 transition-colors">
                      <Upload className="w-6 h-6 mb-0.5" /><span className="text-[10px] font-medium">Logo</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
                <p className="text-xs text-gray-400 mt-1.5">Optional</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Name *</label>
                <input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} className={inputCls} placeholder="e.g. My Awesome Shop" required autoFocus />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} min-h-[80px] resize-y`} placeholder="Tell buyers about your shop..." />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60">
                {loading ? (
                  <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating your shop...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">Create Seller Account <ArrowRight className="w-4 h-4" /></span>
                )}
              </button>
              <p className="text-xs text-center text-gray-400 mt-2">📧 A verification email will be sent. Verify, then log in.</p>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-2">
            <p className="text-sm text-gray-500">Already have an account? <Link to="/auth/login" className="text-indigo-600 font-semibold hover:underline">Login</Link></p>
            <p className="text-xs text-gray-400">Looking to shop? <Link to="/auth/signup" className="text-gray-600 hover:underline">Customer Sign Up</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SellerSignup;
