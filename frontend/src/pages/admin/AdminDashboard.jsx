import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, MessageSquare, Shield, BarChart3,
  CheckCircle, XCircle, Trash2, Eye, Send, Search, ChevronDown, ChevronUp,
  Plus, RefreshCw, Mail, Calendar, DollarSign, UserPlus, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, categoryService } from '../../services';
import { PageSpinner } from '../../components/ui/Spinner';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#ede9fe', '#4f46e5', '#818cf8'];

const roleBadge = {
  admin: 'bg-red-100 text-red-700',
  seller: 'bg-purple-100 text-purple-700',
  verifier: 'bg-teal-100 text-teal-700',
  customer: 'bg-gray-100 text-gray-600',
};
const statusBadge = {
  pending: 'bg-amber-100 text-amber-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  placed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  open: 'bg-amber-100 text-amber-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

const Badge = ({ children, type = 'default' }) => (
  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${statusBadge[children?.toLowerCase()] || roleBadge[children?.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
    {children}
  </span>
);

const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all";

const sidebarItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'categories', label: 'Categories', icon: Tag },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'verifiers', label: 'Verifiers', icon: Shield },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
];

// ── Stat Card ──
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
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

// ══════════════════════════════════════
//   ADMIN DASHBOARD
// ══════════════════════════════════════
const AdminDashboard = () => {
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Dashboard
  const [stats, setStats] = useState(null);

  // Products
  const [products, setProducts] = useState([]);
  const [prodFilter, setProdFilter] = useState('');
  const [prodTotal, setProdTotal] = useState(0);

  // Orders
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Users
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userTotal, setUserTotal] = useState(0);

  // Categories
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');

  // Messages
  const [contacts, setContacts] = useState([]);
  const [contactFilter, setContactFilter] = useState('');
  const [replyId, setReplyId] = useState(null);
  const [replyMsg, setReplyMsg] = useState('');

  // Verifiers
  const [verForm, setVerForm] = useState({ email: '', name: '', password: '' });
  const [verLoading, setVerLoading] = useState(false);
  const [verifiers, setVerifiers] = useState([]);

  // Analytics
  const [reports, setReports] = useState(null);

  useEffect(() => {
    adminService.getDashboard()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch tab data
  useEffect(() => {
    if (tab === 'products') {
      const params = { limit: 50 };
      if (prodFilter) params.verificationState = prodFilter;
      adminService.getProducts(params).then((res) => { setProducts(res.data.products || []); setProdTotal(res.data.total || 0); }).catch(() => {});
    }
    if (tab === 'orders') {
      const params = { limit: 50 };
      if (orderFilter) params.orderStatus = orderFilter;
      adminService.getOrders(params).then((res) => { setOrders(res.data.orders || []); setOrderTotal(res.data.total || 0); }).catch(() => {});
    }
    if (tab === 'users') {
      const params = { limit: 50 };
      if (userFilter) params.role = userFilter;
      if (userSearch) params.search = userSearch;
      adminService.getUsers(params).then((res) => { setUsers(res.data.users || []); setUserTotal(res.data.total || 0); }).catch(() => {});
    }
    if (tab === 'categories') {
      categoryService.getAll().then((res) => setCategories(res.data.categories || [])).catch(() => {});
    }
    if (tab === 'messages') {
      const params = { limit: 50 };
      if (contactFilter) params.status = contactFilter;
      adminService.getContacts(params).then((res) => setContacts(res.data.queries || [])).catch(() => {});
    }
    if (tab === 'verifiers') {
      adminService.getUsers({ role: 'verifier', limit: 50 }).then((res) => setVerifiers(res.data.users || [])).catch(() => {});
    }
    if (tab === 'analytics') {
      adminService.getReports({ days: 30 }).then((res) => setReports(res.data)).catch(() => {});
    }
  }, [tab, prodFilter, orderFilter, userFilter, userSearch, contactFilter]);

  // Handlers
  const handleVerify = async (id, state) => {
    try {
      await adminService.verifyProduct(id, { verificationState: state });
      setProducts(products.map((p) => p._id === id ? { ...p, verificationState: state, verified: state === 'verified' } : p));
      toast.success(`Product ${state}`);
    } catch (err) { toast.error(err.message); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    try {
      const res = await categoryService.create({ name: newCat.trim() });
      setCategories([...categories, res.data.category]);
      setNewCat('');
      toast.success('Category created');
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoryService.delete(id);
      setCategories(categories.filter((c) => c._id !== id));
      toast.success('Deleted');
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteContact = async (id) => {
    try {
      await adminService.deleteContact(id);
      setContacts(contacts.filter((c) => c._id !== id));
      toast.success('Deleted');
    } catch (err) { toast.error(err.message); }
  };

  const handleReplyContact = async (id) => {
    if (!replyMsg.trim()) return;
    try {
      await adminService.replyToContact(id, { replyMessage: replyMsg });
      setContacts(contacts.map((c) => c._id === id ? { ...c, status: 'resolved' } : c));
      setReplyId(null);
      setReplyMsg('');
      toast.success('Reply sent');
    } catch (err) { toast.error(err.message); }
  };

  const handleUpdateContactStatus = async (id, status) => {
    try {
      await adminService.updateContactStatus(id, { status });
      setContacts(contacts.map((c) => c._id === id ? { ...c, status } : c));
      toast.success('Status updated');
    } catch (err) { toast.error(err.message); }
  };

  const handleUpdateOrderStatus = async (id, orderStatus) => {
    try {
      await adminService.updateOrderStatus(id, { orderStatus });
      setOrders(orders.map((o) => o._id === id ? { ...o, orderStatus } : o));
      toast.success('Order status updated');
    } catch (err) { toast.error(err.message); }
  };

  const handleCreateVerifier = async (e) => {
    e.preventDefault();
    if (!verForm.email || !verForm.password) { toast.error('Email and password required'); return; }
    setVerLoading(true);
    try {
      const res = await adminService.createVerifier(verForm);
      setVerifiers([res.data.user, ...verifiers]);
      setVerForm({ email: '', name: '', password: '' });
      toast.success(res.message || 'Verifier created');
    } catch (err) { toast.error(err.message); }
    finally { setVerLoading(false); }
  };

  if (loading) return <PageSpinner />;

  const s = stats?.stats || {};

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-gray-900 text-white">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">A</div>
            <div>
              <p className="font-bold text-sm">Admin Panel</p>
              <p className="text-xs text-gray-400">CartNest</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === item.key ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
              {item.key === 'products' && s.pendingVerification > 0 && (
                <span className="ml-auto text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">{s.pendingVerification}</span>
              )}
              {item.key === 'messages' && s.openQueries > 0 && (
                <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">{s.openQueries}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile tabs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex overflow-x-auto px-2 py-2 gap-1 shadow-lg">
        {sidebarItems.map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all shrink-0 ${tab === item.key ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}>
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8 bg-gray-50">
        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-extrabold text-gray-900">Dashboard</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={s.totalUsers || 0} color="bg-blue-500" />
              <StatCard icon={Package} label="Products" value={s.totalProducts || 0} color="bg-indigo-500" />
              <StatCard icon={ShoppingBag} label="Orders" value={s.totalOrders || 0} color="bg-purple-500" />
              <StatCard icon={DollarSign} label="Revenue" value={`₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`} color="bg-green-500" />
              <StatCard icon={Users} label="Sellers" value={s.totalSellers || 0} color="bg-amber-500" />
              <StatCard icon={Eye} label="Pending Review" value={s.pendingVerification || 0} color="bg-orange-500" />
              <StatCard icon={MessageSquare} label="Open Queries" value={s.openQueries || 0} color="bg-red-500" />
              <StatCard icon={Shield} label="Verifiers" value={s.totalVerifiers || 0} color="bg-teal-500" />
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 font-semibold">Order ID</th><th className="pb-3 font-semibold">Email</th><th className="pb-3 font-semibold">Amount</th><th className="pb-3 font-semibold">Payment</th><th className="pb-3 font-semibold">Status</th><th className="pb-3 font-semibold">Date</th>
                  </tr></thead>
                  <tbody>
                    {stats?.recentOrders?.length > 0 ? stats.recentOrders.map((o) => (
                      <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 font-mono text-xs text-gray-500">#{o.orderId || o._id.slice(-6)}</td>
                        <td className="py-3 text-gray-700 truncate max-w-[150px]">{o.userEmail}</td>
                        <td className="py-3 font-bold">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                        <td className="py-3"><Badge>{o.paymentStatus}</Badge></td>
                        <td className="py-3"><Badge>{o.orderStatus}</Badge></td>
                        <td className="py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    )) : <tr><td colSpan={6} className="py-8 text-center text-gray-400">No orders yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === 'products' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-2xl font-extrabold text-gray-900">Products <span className="text-sm font-normal text-gray-400">({prodTotal})</span></h2>
              <div className="flex gap-2">
                {['', 'pending', 'verified', 'rejected'].map((f) => (
                  <button key={f} onClick={() => setProdFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${prodFilter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {f || 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />No products
                </div>
              ) : products.map((prod) => (
                <motion.div key={prod._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                  <img src={prod.images?.[0]?.url || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=N'} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{prod.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{prod.sellerId?.shopName || prod.sellerEmail} · ₹{prod.price} · Stock: {prod.stock}</p>
                  </div>
                  <Badge>{prod.verificationState}</Badge>
                  <div className="flex gap-1 shrink-0">
                    {prod.verificationState !== 'verified' && (
                      <button onClick={() => handleVerify(prod._id, 'verified')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {prod.verificationState !== 'rejected' && (
                      <button onClick={() => handleVerify(prod._id, 'rejected')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-2xl font-extrabold text-gray-900">Orders <span className="text-sm font-normal text-gray-400">({orderTotal})</span></h2>
              <div className="flex gap-2 flex-wrap">
                {['', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'].map((f) => (
                  <button key={f} onClick={() => setOrderFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${orderFilter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {f || 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">No orders</div>
              ) : orders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-all">
                  <button onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    className="w-full p-4 flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0"><ShoppingBag className="w-5 h-5 text-indigo-600" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">#{order.orderId || order._id.slice(-8)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.userEmail} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <Badge>{order.paymentStatus}</Badge>
                    <Badge>{order.orderStatus}</Badge>
                    <span className="font-bold text-gray-900">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    {expandedOrder === order._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedOrder === order._id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <img src={item.image || 'https://placehold.co/40x40/e2e8f0/94a3b8?text=P'} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                          <span className="flex-1 truncate">{item.title || 'Product'}</span>
                          <span className="text-gray-500">x{item.qty}</span>
                          <span className="font-bold">₹{(item.price * item.qty)?.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">Update status:</span>
                        {['processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                          <button key={st} onClick={() => handleUpdateOrderStatus(order._id, st)}
                            disabled={order.orderStatus === st}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${order.orderStatus === st ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-2xl font-extrabold text-gray-900">Users <span className="text-sm font-normal text-gray-400">({userTotal})</span></h2>
              <div className="flex gap-2 flex-wrap">
                {['', 'customer', 'seller', 'verifier', 'admin'].map((f) => (
                  <button key={f} onClick={() => setUserFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${userFilter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {f || 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search by name or email..." className={`${inputCls} pl-9`} />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 font-semibold">Name</th><th className="px-5 py-3 font-semibold">Email</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Joined</th><th className="px-5 py-3 font-semibold">Actions</th>
                </tr></thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No users found</td></tr>
                  ) : users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-5 py-3 text-gray-600 truncate max-w-[180px]">{u.email}</td>
                      <td className="px-5 py-3"><Badge>{u.role}</Badge></td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-5 py-3">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {tab === 'categories' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-extrabold text-gray-900">Categories</h2>
            <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
              <input value={newCat} onChange={(e) => setNewCat(e.target.value)} className={inputCls} placeholder="New category name" />
              <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div key={cat._id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-all">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">/{cat.slug}</p>
                  </div>
                  <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {categories.length === 0 && <p className="col-span-full text-center py-8 text-gray-400">No categories yet</p>}
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === 'messages' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-2xl font-extrabold text-gray-900">Contact Messages</h2>
              <div className="flex gap-2">
                {['', 'open', 'in-progress', 'resolved'].map((f) => (
                  <button key={f} onClick={() => setContactFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${contactFilter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {f || 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />No messages
                </div>
              ) : contacts.map((q) => (
                <div key={q._id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-gray-900">{q.fromName}</p>
                        <span className="text-xs text-gray-400">&lt;{q.fromEmail}&gt;</span>
                        <Badge>{q.status}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mt-1">{q.subject}</p>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">{q.message}</p>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(q.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {q.status !== 'resolved' && (
                        <button onClick={() => handleUpdateContactStatus(q._id, 'in-progress')} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Mark In Progress">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => { setReplyId(replyId === q._id ? null : q._id); setReplyMsg(''); }} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg" title="Reply">
                        <Send className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteContact(q._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {replyId === q._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex gap-2 pt-2 border-t border-gray-100">
                      <input value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} className={`${inputCls} flex-1`} placeholder="Type your reply..." />
                      <button onClick={() => handleReplyContact(q._id)} className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all">
                        Send
                      </button>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── VERIFIERS ── */}
        {tab === 'verifiers' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-extrabold text-gray-900">Verifier Accounts</h2>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-indigo-500" />Create New Verifier</h3>
              <form onSubmit={handleCreateVerifier} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={verForm.email} onChange={(e) => setVerForm({ ...verForm, email: e.target.value })} className={inputCls} placeholder="Email *" type="email" required />
                <input value={verForm.name} onChange={(e) => setVerForm({ ...verForm, name: e.target.value })} className={inputCls} placeholder="Name" />
                <input value={verForm.password} onChange={(e) => setVerForm({ ...verForm, password: e.target.value })} className={inputCls} placeholder="Password *" type="password" required />
                <button type="submit" disabled={verLoading} className="sm:col-span-3 w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
                  {verLoading ? 'Creating...' : 'Create Verifier Account'}
                </button>
              </form>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 font-semibold">Name</th><th className="px-5 py-3 font-semibold">Email</th><th className="px-5 py-3 font-semibold">Joined</th><th className="px-5 py-3 font-semibold">Actions</th>
                </tr></thead>
                <tbody>
                  {verifiers.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No verifiers yet</td></tr>
                  ) : verifiers.map((v) => (
                    <tr key={v._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">{v.name}</td>
                      <td className="px-5 py-3 text-gray-600">{v.email}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{new Date(v.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleDeleteUser(v._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-extrabold text-gray-900">Analytics <span className="text-sm font-normal text-gray-400">(Last 30 days)</span></h2>

            {/* Verification Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {reports?.verificationStats?.map((vs) => (
                <div key={vs._id} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{vs.count}</p>
                  <p className="text-xs text-gray-500 capitalize mt-1">{vs._id} Products</p>
                </div>
              ))}
            </div>

            {/* Daily Sales */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-500" />Daily Sales</h3>
              {reports?.dailySales?.length > 0 ? (
                <div className="space-y-2">
                  {reports.dailySales.map((day) => (
                    <div key={day._id} className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500 w-24 shrink-0">{day._id}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full flex items-center px-2"
                          style={{ width: `${Math.min(100, (day.totalSales / Math.max(...reports.dailySales.map(d => d.totalSales))) * 100)}%` }}>
                          <span className="text-[10px] text-white font-bold whitespace-nowrap">₹{day.totalSales.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 w-16 text-right">{day.orderCount} orders</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-400 text-center py-8">No sales data yet</p>}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Top Selling Products</h3>
              <div className="space-y-2">
                {reports?.topProducts?.length > 0 ? reports.topProducts.map((prod, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="text-gray-700 truncate flex-1"><span className="text-indigo-500 font-bold mr-2">#{i + 1}</span>{prod.title}</span>
                    <span className="text-gray-500 mx-3 text-xs">{prod.totalQty} sold</span>
                    <span className="font-bold text-gray-900">₹{prod.totalRevenue?.toLocaleString('en-IN')}</span>
                  </div>
                )) : <p className="text-sm text-gray-400 text-center py-4">No sales data</p>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
