import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services';
import { PageSpinner } from '../components/ui/Spinner';

const Account = () => {
  const { user: authUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [newAddr, setNewAddr] = useState({ line1: '', line2: '', city: '', state: '', zip: '', country: 'India' });
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getProfile();
        const u = res.data.user;
        setProfile(u);
        setName(u.name || '');
        setPhone(u.phone || '');
      } catch { toast.error('Failed to load profile'); }
      finally { setLoading(false); }
    };
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
    if (!newAddr.line1 || !newAddr.city || !newAddr.state || !newAddr.zip) { toast.error('Fill all required fields'); return; }
    try {
      await userService.addAddress(newAddr);
      const res = await userService.getProfile();
      setProfile(res.data.user);
      setNewAddr({ line1: '', line2: '', city: '', state: '', zip: '', country: 'India' });
      setShowAddrForm(false);
      toast.success('Address added');
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await userService.deleteAddress(id);
      setProfile({ ...profile, addresses: profile.addresses.filter((a) => a._id !== id) });
      toast.success('Address removed');
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <PageSpinner />;

  const inputCls = "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-8">My Account</h1>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><User className="w-5 h-5 text-indigo-600" /></div>
          <h2 className="text-lg font-bold">Profile Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+91 XXXXX XXXXX" />
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <p className="px-4 py-3 text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-200">{authUser?.email || profile?.email}</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </motion.div>

      {/* Addresses */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center"><MapPin className="w-5 h-5 text-green-600" /></div>
            <h2 className="text-lg font-bold">Addresses</h2>
          </div>
          <button onClick={() => setShowAddrForm(!showAddrForm)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {showAddrForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-5 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <input value={newAddr.line1} onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })} className={inputCls} placeholder="Address Line 1 *" />
              <input value={newAddr.line2} onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })} className={inputCls} placeholder="Address Line 2" />
              <input value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} className={inputCls} placeholder="City *" />
              <input value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} className={inputCls} placeholder="State *" />
              <input value={newAddr.zip} onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })} className={inputCls} placeholder="ZIP Code *" />
              <input value={newAddr.country} onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })} className={inputCls} placeholder="Country" />
            </div>
            <button onClick={handleAddAddress} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4" /> Save Address
            </button>
          </motion.div>
        )}

        <div className="space-y-3">
          {profile?.addresses?.length > 0 ? profile.addresses.map((addr) => (
            <div key={addr._id} className="flex items-start justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all">
              <div>
                <p className="text-sm font-medium text-gray-900">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.zip}</p>
                <p className="text-xs text-gray-400 mt-0.5">{addr.country}</p>
              </div>
              <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )) : (
            <p className="text-sm text-gray-400 text-center py-6">No addresses yet. Add one above.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Account;
