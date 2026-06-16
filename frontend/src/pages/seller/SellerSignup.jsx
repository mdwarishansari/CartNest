import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Upload, ArrowRight, CheckCircle, Mail, Lock, User, Eye, EyeOff, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from '../../config/firebase';
import { updateProfile } from 'firebase/auth';
import { uploadImage } from '../../services/cloudinary';

const SellerSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', shopName: '', description: '' });
  const [showPass, setShowPass] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputCls = "w-full px-3 py-2 text-caption border border-ash rounded-md bg-pure-white focus:border-ink-black outline-none transition-all font-graphik text-charcoal placeholder:text-smoke";

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
      // 1. Upload logo to Cloudinary if provided
      let logo = null;
      if (logoFile) {
        try {
          const uploaded = await uploadImage(logoFile, 'seller', form.shopName);
          logo = { public_id: uploaded.public_id, url: uploaded.url };
        } catch (uploadErr) {
          console.warn('Logo upload failed, continuing without logo:', uploadErr);
        }
      }

      // 2. Create Firebase user
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(fbUser, { displayName: form.name });
      await sendEmailVerification(fbUser);

      // 3. Save seller registration data to localStorage so after login it auto-registers
      const pendingData = {
        shopName: form.shopName,
        description: form.description,
      };
      if (logo) pendingData.logo = logo;

      localStorage.setItem('pendingSellerRegistration', JSON.stringify(pendingData));

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
    <div className="bg-cream-paper min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 font-graphik">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
            <img src="/logo.png" alt="CartNest" className="w-12 h-12 object-contain mx-auto mb-4" />
          </motion.div>
          <h1 className="text-heading font-nantes text-ink-black mb-1">Seller Registration</h1>
          <p className="text-caption text-smoke">Create your seller account on CartNest</p>
          {/* Steps */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className={`flex items-center gap-1.5 text-caption font-semibold ${step >= 1 ? 'text-ink-black' : 'text-smoke'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 1 ? 'bg-ink-black text-pure-white border border-ink-black' : 'bg-pure-white text-smoke border border-ash'}`}>1</span>
              Account
            </div>
            <div className="w-8 h-px bg-ash" />
            <div className={`flex items-center gap-1.5 text-caption font-semibold ${step >= 2 ? 'text-ink-black' : 'text-smoke'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= 2 ? 'bg-ink-black text-pure-white border border-ink-black' : 'bg-pure-white text-smoke border border-ash'}`}>2</span>
              Shop Details
            </div>
          </div>
        </div>

        {/* Benefits */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6 p-4 bg-pure-white rounded-md border border-ash">
          <ul className="grid grid-cols-2 gap-2">
            {['Free to start', 'Secure payments', 'Image uploads', 'Analytics dashboard'].map((b, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-charcoal font-medium"><CheckCircle className="w-3.5 h-3.5 text-smoke shrink-0" />{b}</li>
            ))}
          </ul>
        </motion.div>

        {/* Card */}
        <div className="bg-pure-white rounded-md border border-ash p-7 sm:p-8">
          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5">
              <p className="text-caption font-bold text-ink-black mb-1 border-b border-ash pb-2">Account Details</p>
              <div>
                <label className="block text-caption font-semibold text-charcoal mb-2">Your Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke" />
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${inputCls} pl-11`} placeholder="John Doe" required autoFocus />
                </div>
              </div>
              <div>
                <label className="block text-caption font-semibold text-charcoal mb-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inputCls} pl-11`} placeholder="seller@example.com" required />
                </div>
              </div>
              <div>
                <label className="block text-caption font-semibold text-charcoal mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`${inputCls} pl-11 pr-11`}
                    placeholder="Minimum 6 characters" required minLength={6}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-smoke hover:text-charcoal transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-smoke mt-1.5">Minimum 6 characters</p>
              </div>
              <button type="submit" className="w-full py-2.5 px-6 bg-ink-black text-pure-white font-semibold rounded-md hover:bg-charcoal transition-all text-caption cursor-pointer">
                <span className="flex items-center justify-center gap-2">Next: Shop Details <ArrowRight className="w-4 h-4" /></span>
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-ash pb-2">
                <p className="text-caption font-bold text-ink-black">Shop Details</p>
                <button type="button" onClick={() => setStep(1)} className="text-xs font-semibold text-smoke hover:text-ink-black border-b border-transparent hover:border-ink-black transition-colors">← Back</button>
              </div>
              <div className="flex flex-col items-center">
                <label className="relative w-20 h-20 rounded-md bg-pure-white border border-dashed border-ash flex items-center justify-center overflow-hidden cursor-pointer hover:border-ink-black transition-all group">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-smoke group-hover:text-ink-black transition-colors">
                      <Upload className="w-5 h-5 mb-0.5" /><span className="text-[10px] font-semibold">Logo</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
                <p className="text-xs text-smoke mt-1.5">Optional</p>
              </div>
              <div>
                <label className="block text-caption font-semibold text-charcoal mb-2">Shop Name *</label>
                <input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} className={inputCls} placeholder="e.g. My Awesome Shop" required autoFocus />
              </div>
              <div>
                <label className="block text-caption font-semibold text-charcoal mb-2">Shop Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} min-h-[80px] resize-y`} placeholder="Tell buyers about your shop..." />
              </div>

              {/* Commission notice */}
              <div className="flex items-start gap-2 p-3 bg-cream-paper border border-ash rounded-md text-xs text-smoke">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-smoke" />
                <span>A 10% platform commission applies on each sale to cover payment processing, hosting, and support services.</span>
              </div>

              <button type="submit" disabled={loading} className="w-full py-2.5 px-6 bg-ink-black text-pure-white font-semibold rounded-md hover:bg-charcoal transition-all disabled:opacity-60 text-caption cursor-pointer">
                {loading ? (
                  <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin" />Creating your shop...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">Create Seller Account <ArrowRight className="w-4 h-4" /></span>
                )}
              </button>
              <p className="text-xs text-center text-smoke mt-2">📧 A verification email will be sent. Verify, then log in.</p>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-ash text-center space-y-2 text-caption">
            <p className="text-smoke">Already have an account? <Link to="/auth/login" className="text-charcoal font-semibold hover:text-ink-black hover:underline">Login</Link></p>
            <p className="text-xs text-smoke">Looking to shop? <Link to="/auth/signup" className="text-charcoal font-semibold hover:text-ink-black hover:underline">Customer Sign Up</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SellerSignup;
