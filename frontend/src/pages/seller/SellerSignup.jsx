import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Upload, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { sellerService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { uploadImage } from '../../services/cloudinary';

const SellerSignup = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ shopName: '', description: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shopName.trim()) { toast.error('Shop name is required'); return; }
    setLoading(true);
    try {
      let logo = {};
      if (logoFile) logo = await uploadImage(logoFile, 'seller', `${form.shopName} logo`);
      await sellerService.register({ ...form, logo });
      await refreshUser();
      toast.success('Seller registration successful!');
      navigate('/seller/dashboard');
    } catch (err) { toast.error(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all";

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-200">
            <Store className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-extrabold gradient-text mb-2">Become a Seller</h1>
          <p className="text-gray-500 text-sm">Create your shop and start selling on CartNest</p>
        </div>

        {/* Benefits */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
          <p className="text-sm font-semibold text-indigo-700 mb-3">✨ Seller Benefits</p>
          <ul className="space-y-2">
            {['Free to get started', 'Direct Cloudinary image uploads', 'Secure Razorpay payments', 'Built-in analytics dashboard'].map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-indigo-600"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{b}</li>
            ))}
          </ul>
        </motion.div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo */}
            <div className="flex flex-col items-center">
              <label className="relative w-28 h-28 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300 group">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400 group-hover:text-indigo-500 transition-colors">
                    <Upload className="w-7 h-7 mb-1" /><span className="text-xs font-medium">Upload Logo</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
              <p className="text-xs text-gray-400 mt-2">Shop logo (optional)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Name *</label>
              <input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} className={inputCls} placeholder="e.g. My Awesome Shop" required autoFocus />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} min-h-[100px] resize-y`} placeholder="Tell buyers what makes your shop special..." />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60">
              {loading ? (
                <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Setting up your shop...</span>
              ) : (
                <span className="flex items-center justify-center gap-2">Register as Seller <ArrowRight className="w-4 h-4" /></span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SellerSignup;
