import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, CheckCircle, XCircle, Package, AlertTriangle, BarChart3, Clock, ShieldCheck, User, Lock, Eye, EyeOff, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, userService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { PageSpinner } from '../../components/ui/Spinner';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-md`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  </motion.div>
);

const VerifierDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [notesId, setNotesId] = useState(null);
  const [notes, setNotes] = useState('');
  const [tab, setTab] = useState('review');

  // Stats
  const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0 });

  // Account
  const [editName, setEditName] = useState(user?.name || '');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    // Get counts for all states
    Promise.all([
      adminService.getProducts({ verificationState: 'pending', limit: 1 }),
      adminService.getProducts({ verificationState: 'verified', limit: 1 }),
      adminService.getProducts({ verificationState: 'rejected', limit: 1 }),
    ]).then(([pend, ver, rej]) => {
      setStats({
        pending: pend.data.total || 0,
        verified: ver.data.total || 0,
        rejected: rej.data.total || 0,
      });
    }).catch(() => {});
  }, [products]);

  useEffect(() => {
    setLoading(true);
    const params = { limit: 50 };
    if (filter) params.verificationState = filter;
    adminService.getProducts(params)
      .then((res) => setProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const handleVerify = async (id, state, verificationNotes = '') => {
    try {
      await adminService.verifyProduct(id, { verificationState: state, verificationNotes });
      setProducts(products.map((p) => p._id === id ? { ...p, verificationState: state, verified: state === 'verified', verificationNotes } : p));
      setNotesId(null);
      setNotes('');
      toast.success(`Product ${state}`);
    } catch (err) { toast.error(err.message); }
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setSavingProfile(true);
    try {
      await userService.updateProfile({ name: editName.trim() });
      await refreshUser();
      toast.success('Name updated');
    } catch (err) { toast.error(err.message); }
    finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setSavingPass(true);
    try {
      const fbUser = auth.currentUser;
      const credential = EmailAuthProvider.credential(fbUser.email, oldPass);
      await reauthenticateWithCredential(fbUser, credential);
      await updatePassword(fbUser, newPass);
      setOldPass('');
      setNewPass('');
      toast.success('Password updated');
    } catch (err) {
      const msg = err.code === 'auth/wrong-password' ? 'Current password is incorrect' : err.message;
      toast.error(msg);
    } finally { setSavingPass(false); }
  };

  const inputCls = "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all";

  if (loading && tab === 'review') return <PageSpinner />;

  const tabs = [
    { key: 'review', label: 'Review Products', icon: ClipboardCheck },
    { key: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-200">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Verifier Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="bg-amber-500" />
        <StatCard icon={ShieldCheck} label="Verified" value={stats.verified} color="bg-green-500" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="bg-red-500" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white shadow-sm text-teal-600' : 'text-gray-600 hover:text-gray-900'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* REVIEW TAB */}
      {tab === 'review' && (
        <>
          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {['pending', 'verified', 'rejected'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${filter === f ? 'bg-teal-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && stats.pending > 0 && <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{stats.pending}</span>}
              </button>
            ))}
          </div>

          {/* Products */}
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-600">No {filter} products</p>
                <p className="text-sm text-gray-400 mt-1">Products will appear here when sellers submit them.</p>
              </div>
            ) : products.map((prod, idx) => (
              <motion.div key={prod._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="p-5 flex gap-5">
                  <div className="flex gap-2 shrink-0">
                    {(prod.images?.length > 0 ? prod.images.slice(0, 3) : [{ url: 'https://placehold.co/100x100/e2e8f0/94a3b8?text=N' }]).map((img, i) => (
                      <img key={i} src={img.url} alt="" className="w-20 h-20 rounded-xl object-cover bg-gray-100" />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1">{prod.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{prod.description || 'No description'}</p>
                    <div className="flex items-center gap-3 flex-wrap text-sm">
                      <span className="font-bold text-gray-900">₹{prod.price?.toLocaleString('en-IN')}</span>
                      {prod.mrp && prod.mrp > prod.price && <span className="text-gray-400 line-through">₹{prod.mrp?.toLocaleString('en-IN')}</span>}
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">Stock: {prod.stock}</span>
                      <span className="text-xs text-gray-400">{prod.sellerId?.shopName || prod.sellerEmail}</span>
                      <span className="text-xs text-gray-400">{prod.categoryId?.name}</span>
                    </div>
                    {prod.verificationNotes && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{prod.verificationNotes}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg text-center ${
                      prod.verificationState === 'verified' ? 'bg-green-100 text-green-700' :
                      prod.verificationState === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>{prod.verificationState}</span>
                    {prod.verificationState === 'pending' && (
                      <>
                        <button onClick={() => handleVerify(prod._id, 'verified')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-all">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => setNotesId(notesId === prod._id ? null : prod._id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-xs font-semibold rounded-xl hover:bg-red-600 transition-all">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {notesId === prod._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-gray-100 p-4 bg-gray-50 flex gap-2">
                    <input value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} flex-1`} placeholder="Reason for rejection (optional)..." />
                    <button onClick={() => handleVerify(prod._id, 'rejected', notes)}
                      className="px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-all shrink-0">Reject</button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ACCOUNT TAB */}
      {tab === 'account' && (
        <div className="space-y-6 animate-fade-in">
          {/* Profile */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-teal-500" />Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input value={user?.email || ''} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
              </div>
              <button onClick={handleSaveName} disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
                {savingProfile ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save Name
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-teal-500" />Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input type={showOld ? 'text' : 'password'} value={oldPass} onChange={(e) => setOldPass(e.target.value)} className={`${inputCls} pr-11`} required />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={newPass} onChange={(e) => setNewPass(e.target.value)} className={`${inputCls} pr-11`} required minLength={6} />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={savingPass}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
                {savingPass ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifierDashboard;
