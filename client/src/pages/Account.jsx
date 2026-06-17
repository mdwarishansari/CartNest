import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Plus, Trash2, Save, Shield, Phone, Mail, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services';
import { ProfileSkeleton, AddressSkeleton } from '../components/ui/Skeletons';
import ErrorState from '../components/ui/ErrorState';

const Account = () => {
  const { user: authUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', house: '', city: '', state: '', pincode: '', country: 'India' });
  const [showAddrForm, setShowAddrForm] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await userService.getProfile();
      const u = res.data.user;
      setProfile(u);
      setName(u.name || '');
      setPhone(u.phone || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({ name, phone });
      await refreshUser();
      toast.success('Profile updated');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleAddAddress = async () => {
    if (!newAddr.name || !newAddr.phone || !newAddr.house || !newAddr.city || !newAddr.state || !newAddr.pincode) {
      toast.error('Please fill all required fields'); return;
    }
    try {
      await userService.addAddress(newAddr);
      const res = await userService.getProfile();
      setProfile(res.data.user);
      setNewAddr({ name: '', phone: '', house: '', city: '', state: '', pincode: '', country: 'India' });
      setShowAddrForm(false);
      toast.success('Address added');
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await userService.deleteAddress(id);
      setProfile({ ...profile, addressBook: profile.addressBook.filter((a) => a._id !== id) });
      toast.success('Address removed');
    } catch (err) { toast.error(err.message); }
  };

  if (loading) {
    return (
      <div className="bg-cream-paper min-h-screen font-graphik py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <div className="skeleton w-44 h-10 rounded-md" />
          </div>
          <div className="space-y-6">
            <ProfileSkeleton />
            <div className="bg-pure-white border border-ash rounded-md p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 border-b border-ash pb-4">
                <div className="skeleton w-32 h-6" />
                <div className="skeleton w-28 h-9 rounded-md" />
              </div>
              <AddressSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-cream-paper min-h-screen font-graphik py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <ErrorState
            title="Failed to Load Profile"
            message="We couldn't retrieve your account and profile details. Please try again."
            onRetry={fetchProfile}
          />
        </div>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2 text-caption border border-ash rounded-md bg-pure-white focus:border-ink-black outline-none transition-all font-graphik text-charcoal placeholder:text-smoke";

  return (
    <div className="bg-cream-paper min-h-screen font-graphik py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-heading sm:text-heading-lg font-nantes text-ink-black">My Account</h1>
        </motion.div>

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-pure-white rounded-md border border-ash p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-cream-paper border border-ash flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-smoke" />
            </div>
            <h2 className="font-nantes text-heading-sm text-ink-black">Profile Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-caption font-semibold text-charcoal mb-2">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-caption font-semibold text-charcoal mb-2">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-caption font-semibold text-charcoal mb-2">Email</label>
            <p className="px-3 py-2 text-caption text-smoke bg-cream-paper rounded-md border border-ash">{authUser?.email || profile?.email}</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black hover:bg-charcoal text-pure-white text-caption font-semibold rounded-md transition-all disabled:opacity-60 cursor-pointer">
            {saving ? <span className="w-4 h-4 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </motion.div>

        {/* Addresses */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-pure-white rounded-md border border-ash p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 border-b border-ash pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cream-paper border border-ash flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-smoke" />
              </div>
              <h2 className="font-nantes text-heading-sm text-ink-black">Addresses</h2>
            </div>
            <button onClick={() => setShowAddrForm(!showAddrForm)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-caption font-semibold text-charcoal hover:text-ink-black border border-ash hover:bg-cream-paper rounded-md transition-all cursor-pointer">
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>

          {showAddrForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-5 bg-cream-paper rounded-md border border-ash overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-smoke mb-1">Full Name *</label>
                  <input value={newAddr.name} onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })} className={inputCls} placeholder="Recipient name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-smoke mb-1">Phone *</label>
                  <input value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} className={inputCls} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-smoke mb-1">House / Street / Area *</label>
                  <input value={newAddr.house} onChange={(e) => setNewAddr({ ...newAddr, house: e.target.value })} className={inputCls} placeholder="123, Main Street, Area" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-smoke mb-1">City *</label>
                  <input value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className={inputCls} placeholder="City" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-smoke mb-1">State *</label>
                  <input value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} className={inputCls} placeholder="State" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-smoke mb-1">Pincode *</label>
                  <input value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} className={inputCls} placeholder="110001" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-smoke mb-1">Country</label>
                  <input value={newAddr.country} onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })} className={inputCls} placeholder="India" />
                </div>
              </div>
              <button onClick={handleAddAddress} className="inline-flex items-center gap-2 px-4 py-2 bg-ink-black text-pure-white text-caption font-semibold rounded-md hover:bg-charcoal transition-all cursor-pointer">
                <Plus className="w-4 h-4" /> Save Address
              </button>
            </motion.div>
          )}

          <div className="space-y-3">
            {profile?.addressBook?.length > 0 ? profile.addressBook.map((addr) => (
              <div key={addr._id} className="flex items-start justify-between p-4 rounded-md bg-pure-white border border-ash hover:border-charcoal transition-all">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cream-paper border border-ash flex items-center justify-center shrink-0 mt-0.5">
                    <Home className="w-4 h-4 text-smoke" />
                  </div>
                  <div>
                    <p className="text-caption font-semibold text-charcoal">{addr.name}</p>
                    <p className="text-caption text-charcoal mt-0.5">{addr.house}</p>
                    <p className="text-caption text-smoke">{addr.city}, {addr.state} — {addr.pincode}</p>
                    {addr.phone && <p className="text-xs text-smoke mt-1 flex items-center gap-1"><Phone className="w-3 h-3" />{addr.phone}</p>}
                  </div>
                </div>
                <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 text-smoke hover:text-ink-black hover:bg-cream-paper rounded-md border border-transparent hover:border-ash transition-all shrink-0 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )) : (
              <p className="text-caption text-smoke text-center py-6">No addresses yet. Add one above.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Account;
