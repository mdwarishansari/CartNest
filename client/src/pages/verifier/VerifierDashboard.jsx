import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, CheckCircle, XCircle, Package, AlertTriangle, Clock, ShieldCheck, User, Lock, Eye, EyeOff, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, userService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { DashboardSkeleton } from '../../components/ui/Skeletons';

const StatCard = ({ icon: Icon, label, value }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="bg-pure-white rounded-md border border-ash p-5 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-cream-paper border border-ash flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-smoke" />
      </div>
      <div>
        <p className="text-subheading font-bold text-ink-black font-graphik">{value}</p>
        <p className="text-[12px] text-smoke font-semibold uppercase tracking-wider font-graphik">{label}</p>
      </div>
    </div>
  </motion.div>
);

const StatusBadge = ({ state }) => {
  let cls = 'bg-cream-paper text-smoke border border-ash';
  if (state === 'pending') {
    cls = 'bg-[#fbf7f4] text-[#8c6d58] border border-[#ebdcd0]';
  } else if (state === 'verified') {
    cls = 'bg-[#f4f9f4] text-[#1e4620] border border-[#d0e5d2]';
  } else if (state === 'rejected') {
    cls = 'bg-[#fcf5f5] text-[#7d2d2d] border border-[#f5d5d5]';
  }
  return (
    <span className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-3xl inline-block text-center ${cls}`}>
      {state}
    </span>
  );
};

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

  const inputCls = "w-full px-3 py-2 text-caption border border-ash rounded-md bg-pure-white focus:border-ink-black outline-none transition-all font-graphik text-charcoal placeholder:text-smoke";

  if (loading && tab === 'review') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 font-graphik text-charcoal min-h-[calc(100vh-80px)]">
        <DashboardSkeleton />
      </div>
    );
  }

  const tabs = [
    { key: 'review', label: 'Review Products', icon: ClipboardCheck },
    { key: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 font-graphik text-charcoal min-h-[calc(100vh-80px)]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-cream-paper border border-ash flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5 text-smoke" />
          </div>
          <div>
            <h1 className="text-heading font-normal text-ink-black font-nantes">Verifier Dashboard</h1>
            <p className="text-xs text-smoke font-medium">Welcome, {user?.name}</p>
          </div>
        </div>
        <div className="w-12 h-[3px] bg-butter-highlight mt-2" />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Clock} label="Pending Review" value={stats.pending} />
        <StatCard icon={ShieldCheck} label="Verified" value={stats.verified} />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-ash mb-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-all ${
              tab === t.key
                ? 'font-semibold border-b-2 border-ink-black text-ink-black'
                : 'font-medium text-smoke hover:text-ink-black'
            }`}>
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
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-3xl transition-all ${
                  filter === f
                    ? 'bg-ink-black text-pure-white border border-ink-black'
                    : 'bg-pure-white text-smoke border border-ash hover:text-ink-black hover:border-charcoal'
                }`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && stats.pending > 0 && (
                  <span className="ml-1.5 text-[10px] bg-[#fbf7f4] text-[#8c6d58] border border-[#ebdcd0] px-1.5 py-0.5 rounded-3xl font-bold">
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Products */}
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="bg-pure-white rounded-md border border-ash p-16 text-center">
                <Package className="w-14 h-14 text-smoke mx-auto mb-3 opacity-40" />
                <p className="text-lg font-semibold text-charcoal font-graphik">No {filter} products</p>
                <p className="text-sm text-smoke mt-1 font-graphik">Products will appear here when sellers submit them.</p>
              </div>
            ) : products.map((prod, idx) => (
              <motion.div key={prod._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                className="bg-pure-white rounded-md border border-ash overflow-hidden hover:border-charcoal transition-all">
                <div className="p-5 flex gap-5 flex-wrap md:flex-nowrap">
                  <div className="flex gap-2 shrink-0">
                    {(prod.images?.length > 0 ? prod.images.slice(0, 3) : [{ url: 'https://placehold.co/100x100/e2e8f0/94a3b8?text=N' }]).map((img, i) => (
                      <img key={i} src={img.url} alt="" className="w-20 h-20 rounded-md object-cover bg-cream-paper border border-ash" />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink-black text-sm mb-1 font-graphik">{prod.title}</h3>
                    <p className="text-xs text-smoke line-clamp-2 mb-2 font-graphik">{prod.description || 'No description'}</p>
                    <div className="flex items-center gap-3 flex-wrap text-xs font-graphik">
                      <span className="font-bold text-ink-black">₹{prod.price?.toLocaleString('en-IN')}</span>
                      {prod.mrp && prod.mrp > prod.price && <span className="text-smoke line-through">₹{prod.mrp?.toLocaleString('en-IN')}</span>}
                      <span className="bg-cream-paper border border-ash text-smoke px-2 py-0.5 rounded-3xl">Stock: {prod.stock}</span>
                      <span className="text-smoke">{prod.sellerId?.shopName || prod.sellerEmail}</span>
                      <span className="text-smoke">{prod.categoryId?.name}</span>
                    </div>
                    {prod.verificationNotes && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-[#7d2d2d] bg-[#fcf5f5] p-2 border border-[#f5d5d5] rounded-md font-graphik">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{prod.verificationNotes}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                    <StatusBadge state={prod.verificationState} />
                    {prod.verificationState === 'pending' && (
                      <>
                        <button onClick={() => handleVerify(prod._id, 'verified')}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-ink-black text-pure-white text-xs font-semibold rounded-md hover:bg-charcoal transition-all">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => setNotesId(notesId === prod._id ? null : prod._id)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-pure-white text-[#7d2d2d] border border-[#f5d5d5] hover:bg-[#fcf5f5] text-xs font-semibold rounded-md transition-all">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {notesId === prod._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-ash p-4 bg-cream-paper flex gap-2 rounded-b-md">
                    <input value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} flex-1`} placeholder="Reason for rejection (optional)..." />
                    <button onClick={() => handleVerify(prod._id, 'rejected', notes)}
                      className="px-4 py-2.5 bg-[#7d2d2d] text-pure-white text-sm font-semibold rounded-md hover:bg-[#632323] transition-all shrink-0">Reject</button>
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
          <div className="bg-pure-white rounded-md border border-ash p-6">
            <h3 className="font-nantes text-heading-sm font-normal text-ink-black mb-4 flex items-center gap-2"><User className="w-5 h-5 text-smoke" />Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] text-smoke font-semibold uppercase tracking-wider mb-2">Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[12px] text-smoke font-semibold uppercase tracking-wider mb-2">Email</label>
                <input value={user?.email || ''} disabled className={`${inputCls} opacity-60 cursor-not-allowed`} />
              </div>
              <button onClick={handleSaveName} disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black text-pure-white text-sm font-semibold rounded-md hover:bg-charcoal transition-all disabled:opacity-60">
                {savingProfile ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save Name
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-pure-white rounded-md border border-ash p-6">
            <h3 className="font-nantes text-heading-sm font-normal text-ink-black mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-smoke" />Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[12px] text-smoke font-semibold uppercase tracking-wider mb-2">Current Password</label>
                <div className="relative">
                  <input type={showOld ? 'text' : 'password'} value={oldPass} onChange={(e) => setOldPass(e.target.value)} className={`${inputCls} pr-11`} required />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-smoke">
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-smoke font-semibold uppercase tracking-wider mb-2">New Password</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={newPass} onChange={(e) => setNewPass(e.target.value)} className={`${inputCls} pr-11`} required minLength={6} />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-smoke">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={savingPass}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black text-pure-white text-sm font-semibold rounded-md hover:bg-charcoal transition-all disabled:opacity-60">
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
