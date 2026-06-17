import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, MessageSquare, Shield, BarChart3,
  CheckCircle, XCircle, Trash2, Eye, Send, Search, ChevronDown, ChevronUp,
  Plus, RefreshCw, Mail, Calendar, DollarSign, UserPlus, AlertTriangle, Edit, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, categoryService } from '../../services';
import { DashboardSkeleton } from '../../components/ui/Skeletons';


const Badge = ({ children }) => {
  const text = children?.toLowerCase() || '';
  let cls = 'bg-cream-paper text-smoke border border-ash';
  if (['pending', 'placed', 'open', 'in-progress', 'processing'].includes(text)) {
    cls = 'bg-[#fbf7f4] text-[#8c6d58] border border-[#ebdcd0]';
  } else if (['verified', 'paid', 'delivered', 'resolved'].includes(text)) {
    cls = 'bg-[#f4f9f4] text-[#1e4620] border border-[#d0e5d2]';
  } else if (['rejected', 'cancelled', 'failed'].includes(text)) {
    cls = 'bg-[#fcf5f5] text-[#7d2d2d] border border-[#f5d5d5]';
  } else if (text === 'admin') {
    cls = 'bg-[#fcf5f5] text-[#7d2d2d] border border-[#f5d5d5]';
  } else if (text === 'seller') {
    cls = 'bg-[#fbf7f4] text-[#8c6d58] border border-[#ebdcd0]';
  } else if (text === 'verifier') {
    cls = 'bg-[#f4f9f4] text-[#1e4620] border border-[#d0e5d2]';
  }
  return (
    <span className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-3xl inline-block ${cls}`}>
      {children}
    </span>
  );
};

const inputCls = "w-full px-3 py-2 text-caption border border-ash rounded-md bg-pure-white focus:border-ink-black outline-none transition-all font-graphik text-charcoal placeholder:text-smoke";

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

const SectionHeader = ({ label }) => (
  <div className="mb-6">
    <h2 className="text-heading font-normal text-ink-black font-nantes">{label}</h2>
    <div className="w-12 h-[3px] bg-butter-highlight mt-1" />
  </div>
);

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

  // Category edit states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  // Product edit/view states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', mrp: '', categoryId: '', stock: '', status: '', tags: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

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

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    if (!editCatName.trim()) return;
    setSavingCat(true);
    try {
      const res = await categoryService.update(editingCategory._id, { name: editCatName.trim() });
      setCategories(categories.map((c) => c._id === editingCategory._id ? res.data.category : c));
      setEditingCategory(null);
      setEditCatName('');
      toast.success('Category updated');
    } catch (err) { toast.error(err.message); }
    finally { setSavingCat(false); }
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setEditForm({
      title: prod.title || '',
      description: prod.description || '',
      price: prod.price || '',
      mrp: prod.mrp || '',
      categoryId: prod.categoryId?._id || prod.categoryId || '',
      stock: prod.stock || 0,
      status: prod.status || 'active',
      tags: (prod.tags || []).join(', '),
    });
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        price: Number(editForm.price),
        mrp: Number(editForm.mrp) || Number(editForm.price),
        categoryId: editForm.categoryId || undefined,
        stock: Number(editForm.stock),
        status: editForm.status,
        tags: editForm.tags ? editForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      const res = await adminService.updateProduct(editingProduct._id, payload);
      setProducts(products.map((p) => p._id === editingProduct._id ? res.data.product : p));
      setEditingProduct(null);
      toast.success('Product updated successfully');
    } catch (err) { toast.error(err.message || 'Failed to update product'); }
    finally { setSavingEdit(false); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminService.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Product deleted successfully');
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

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] bg-cream-paper font-graphik text-charcoal">
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-pure-white border-r border-ash text-charcoal animate-pulse">
          <div className="p-5 border-b border-ash bg-cream-paper">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md skeleton shrink-0" />
              <div className="space-y-1">
                <div className="skeleton w-24 h-4" />
                <div className="skeleton w-16 h-3" />
              </div>
            </div>
          </div>
          <div className="flex-1 py-4 space-y-4 px-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="skeleton w-full h-10 rounded-md" />
            ))}
          </div>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-cream-paper">
          <div className="mb-6">
            <div className="skeleton w-36 h-8 rounded-md" />
          </div>
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  const s = stats?.stats || {};

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-cream-paper font-graphik text-charcoal">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-pure-white border-r border-ash text-charcoal">
        <div className="p-5 border-b border-ash bg-cream-paper">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-ink-black flex items-center justify-center text-sm font-bold text-pure-white">A</div>
            <div>
              <p className="font-bold text-sm text-ink-black font-nantes uppercase tracking-wide">Admin Panel</p>
              <p className="text-[10px] text-smoke font-semibold uppercase tracking-wider">CartNest</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                tab === item.key
                  ? 'bg-ink-black text-pure-white'
                  : 'text-smoke hover:text-ink-black hover:bg-cream-paper'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.key === 'products' && s.pendingVerification > 0 && (
                <span className="ml-auto text-[10px] bg-[#fbf7f4] text-[#8c6d58] border border-[#ebdcd0] px-1.5 py-0.5 rounded-3xl font-bold">{s.pendingVerification}</span>
              )}
              {item.key === 'messages' && s.openQueries > 0 && (
                <span className="ml-auto text-[10px] bg-[#fcf5f5] text-[#7d2d2d] border border-[#f5d5d5] px-1.5 py-0.5 rounded-3xl font-bold">{s.openQueries}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile tabs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-pure-white border-t border-ash flex overflow-x-auto px-2 py-2 gap-1">
        {sidebarItems.map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all shrink-0 ${
              tab === item.key ? 'bg-ink-black text-pure-white' : 'text-smoke'
            }`}>
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8 bg-cream-paper">
        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <SectionHeader label="Dashboard" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={s.totalUsers || 0} />
              <StatCard icon={Package} label="Products" value={s.totalProducts || 0} />
              <StatCard icon={ShoppingBag} label="Orders" value={s.totalOrders || 0} />
              <StatCard icon={DollarSign} label="Revenue" value={`₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`} />
              <StatCard icon={Users} label="Sellers" value={s.totalSellers || 0} />
              <StatCard icon={Eye} label="Pending Review" value={s.pendingVerification || 0} />
              <StatCard icon={MessageSquare} label="Open Queries" value={s.openQueries || 0} />
              <StatCard icon={Shield} label="Verifiers" value={s.totalVerifiers || 0} />
            </div>

            {/* Recent Orders */}
            <div className="bg-pure-white rounded-md border border-ash p-6">
              <h3 className="font-nantes text-heading-sm font-normal text-ink-black mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-smoke text-[11px] uppercase tracking-wider border-b border-ash bg-cream-paper">
                      <th className="px-4 py-3 font-semibold">Order ID</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Payment</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentOrders?.length > 0 ? stats.recentOrders.map((o) => (
                      <tr key={o._id} className="border-b border-cream-paper hover:bg-cream-paper transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-smoke">#{o.orderId || o._id.slice(-6)}</td>
                        <td className="px-4 py-3 text-charcoal truncate max-w-[150px]">{o.userEmail}</td>
                        <td className="px-4 py-3 font-bold text-ink-black">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3"><Badge>{o.paymentStatus}</Badge></td>
                        <td className="px-4 py-3"><Badge>{o.orderStatus}</Badge></td>
                        <td className="px-4 py-3 text-smoke text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    )) : <tr><td colSpan={6} className="py-8 text-center text-smoke">No orders yet</td></tr>}
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
              <div className="mb-2">
                <h2 className="text-heading font-normal text-ink-black font-nantes">
                  Products <span className="text-sm font-normal text-smoke">({prodTotal})</span>
                </h2>
                <div className="w-12 h-[3px] bg-butter-highlight mt-1" />
              </div>
              <div className="flex gap-2">
                {['', 'pending', 'verified', 'rejected'].map((f) => (
                  <button key={f} onClick={() => setProdFilter(f)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-3xl transition-all ${
                      prodFilter === f
                        ? 'bg-ink-black text-pure-white border border-ink-black'
                        : 'bg-pure-white text-smoke border border-ash hover:text-ink-black hover:border-charcoal'
                    }`}>
                    {f || 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {products.length === 0 ? (
                <div className="bg-pure-white rounded-md border border-ash p-12 text-center text-smoke">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />No products
                </div>
              ) : products.map((prod) => (
                <motion.div key={prod._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-pure-white rounded-md border border-ash p-4 flex items-center gap-4 hover:border-charcoal transition-all">
                  <img src={prod.images?.[0]?.url || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=N'} alt="" className="w-14 h-14 rounded-md object-cover bg-cream-paper border border-ash shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-black truncate font-graphik">{prod.title}</p>
                    <p className="text-xs text-smoke mt-0.5">{prod.sellerId?.shopName || prod.sellerEmail} · ₹{prod.price} · Stock: {prod.stock}</p>
                  </div>
                  <Badge>{prod.verificationState}</Badge>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setViewingProduct(prod)} className="p-2 text-smoke hover:text-ink-black hover:bg-cream-paper rounded-md transition-colors border border-transparent hover:border-ash" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEditProduct(prod)} className="p-2 text-smoke hover:text-ink-black hover:bg-cream-paper rounded-md transition-colors border border-transparent hover:border-ash" title="Edit Product">
                      <Edit className="w-4 h-4" />
                    </button>
                    {prod.verificationState !== 'verified' && (
                      <button onClick={() => handleVerify(prod._id, 'verified')} className="p-2 text-green-700 hover:bg-[#f4f9f4] rounded-md transition-colors border border-transparent hover:border-[#d0e5d2]" title="Approve">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {prod.verificationState !== 'rejected' && (
                      <button onClick={() => handleVerify(prod._id, 'rejected')} className="p-2 text-[#8c6d58] hover:bg-[#fbf7f4] rounded-md transition-colors border border-transparent hover:border-[#ebdcd0]" title="Reject">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDeleteProduct(prod._id)} className="p-2 text-[#7d2d2d] hover:bg-[#fcf5f5] rounded-md transition-colors border border-transparent hover:border-[#f5d5d5]" title="Delete Product">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
              <div className="mb-2">
                <h2 className="text-heading font-normal text-ink-black font-nantes">
                  Orders <span className="text-sm font-normal text-smoke">({orderTotal})</span>
                </h2>
                <div className="w-12 h-[3px] bg-butter-highlight mt-1" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'].map((f) => (
                  <button key={f} onClick={() => setOrderFilter(f)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-3xl transition-all ${
                      orderFilter === f
                        ? 'bg-ink-black text-pure-white border border-ink-black'
                        : 'bg-pure-white text-smoke border border-ash hover:text-ink-black hover:border-charcoal'
                    }`}>
                    {f || 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {orders.length === 0 ? (
                <div className="bg-pure-white rounded-md border border-ash p-12 text-center text-smoke">No orders</div>
              ) : orders.map((order) => (
                <div key={order._id} className="bg-pure-white rounded-md border border-ash overflow-hidden hover:border-charcoal transition-all">
                  <button onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    className="w-full p-4 flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-full bg-cream-paper border border-ash flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-smoke" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-black font-graphik">#{order.orderId || order._id.slice(-8)}</p>
                      <p className="text-xs text-smoke mt-0.5">{order.userEmail} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <Badge>{order.paymentStatus}</Badge>
                    <Badge>{order.orderStatus}</Badge>
                    <span className="font-bold text-ink-black">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    {expandedOrder === order._id ? <ChevronUp className="w-4 h-4 text-smoke" /> : <ChevronDown className="w-4 h-4 text-smoke" />}
                  </button>
                  {expandedOrder === order._id && (
                    <div className="border-t border-ash p-4 bg-cream-paper space-y-3 rounded-b-md">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <img src={item.image || 'https://placehold.co/40x40/e2e8f0/94a3b8?text=P'} alt="" className="w-10 h-10 rounded-md object-cover bg-pure-white border border-ash" />
                          <span className="flex-1 truncate text-charcoal">{item.title || 'Product'}</span>
                          <span className="text-smoke">x{item.qty}</span>
                          <span className="font-bold text-ink-black">₹{(item.price * item.qty)?.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-3 border-t border-ash flex-wrap">
                        <span className="text-xs text-smoke uppercase tracking-wider font-semibold">Update status:</span>
                        {['processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                          <button key={st} onClick={() => handleUpdateOrderStatus(order._id, st)}
                            disabled={order.orderStatus === st}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-3xl transition-all ${
                              order.orderStatus === st
                                ? 'bg-ink-black text-pure-white border border-ink-black'
                                : 'bg-pure-white text-smoke border border-ash hover:text-ink-black hover:border-charcoal disabled:opacity-50'
                            }`}>
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
              <div className="mb-2">
                <h2 className="text-heading font-normal text-ink-black font-nantes">
                  Users <span className="text-sm font-normal text-smoke">({userTotal})</span>
                </h2>
                <div className="w-12 h-[3px] bg-butter-highlight mt-1" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['', 'customer', 'seller', 'verifier', 'admin'].map((f) => (
                  <button key={f} onClick={() => setUserFilter(f)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-3xl transition-all ${
                      userFilter === f
                        ? 'bg-ink-black text-pure-white border border-ink-black'
                        : 'bg-pure-white text-smoke border border-ash hover:text-ink-black hover:border-charcoal'
                    }`}>
                    {f || 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke" />
              <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search by name or email..." className={`${inputCls} pl-9`} />
            </div>
            <div className="bg-pure-white rounded-md border border-ash overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-smoke text-[11px] uppercase tracking-wider border-b border-ash bg-cream-paper">
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-smoke">No users found</td></tr>
                  ) : users.map((u) => (
                    <tr key={u._id} className="border-b border-cream-paper hover:bg-cream-paper transition-colors">
                      <td className="px-5 py-3 font-medium text-ink-black">{u.name}</td>
                      <td className="px-5 py-3 text-charcoal truncate max-w-[180px]">{u.email}</td>
                      <td className="px-5 py-3"><Badge>{u.role}</Badge></td>
                      <td className="px-5 py-3 text-smoke text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-5 py-3">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u._id)} className="p-1.5 text-[#7d2d2d] hover:bg-[#fcf5f5] rounded-md transition-all border border-transparent hover:border-[#f5d5d5]">
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
            <SectionHeader label="Categories" />
            <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
              <input value={newCat} onChange={(e) => setNewCat(e.target.value)} className={inputCls} placeholder="New category name" />
              <button type="submit" className="px-5 py-2.5 bg-ink-black text-pure-white text-sm font-semibold rounded-md hover:bg-charcoal transition-all shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div key={cat._id} className="bg-pure-white rounded-md border border-ash p-4 flex items-center justify-between hover:border-charcoal transition-all">
                  <div>
                    <p className="font-semibold text-sm text-ink-black font-graphik">{cat.name}</p>
                    <p className="text-xs text-smoke mt-0.5 font-graphik">/{cat.slug}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditCategory(cat)} className="p-2 text-smoke hover:text-ink-black hover:bg-cream-paper rounded-md transition-all border border-transparent hover:border-ash" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 text-[#7d2d2d] hover:bg-[#fcf5f5] rounded-md transition-all border border-transparent hover:border-[#f5d5d5]" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <p className="col-span-full text-center py-8 text-smoke">No categories yet</p>}
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === 'messages' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="mb-2">
                <h2 className="text-heading font-normal text-ink-black font-nantes">Contact Messages</h2>
                <div className="w-12 h-[3px] bg-butter-highlight mt-1" />
              </div>
              <div className="flex gap-2">
                {['', 'open', 'in-progress', 'resolved'].map((f) => (
                  <button key={f} onClick={() => setContactFilter(f)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-3xl transition-all ${
                      contactFilter === f
                        ? 'bg-ink-black text-pure-white border border-ink-black'
                        : 'bg-pure-white text-smoke border border-ash hover:text-ink-black hover:border-charcoal'
                    }`}>
                    {f || 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <div className="bg-pure-white rounded-md border border-ash p-12 text-center text-smoke">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />No messages
                </div>
              ) : contacts.map((q) => (
                <div key={q._id} className="bg-pure-white rounded-md border border-ash p-5 space-y-3 hover:border-charcoal transition-all">
                  <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-ink-black font-graphik">{q.fromName}</p>
                        <span className="text-xs text-smoke font-graphik">&lt;{q.fromEmail}&gt;</span>
                        <Badge>{q.status}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-charcoal mt-1 font-graphik">{q.subject}</p>
                      <p className="text-sm text-smoke mt-1 leading-relaxed font-graphik">{q.message}</p>
                      <p className="text-xs text-smoke mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(q.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {q.status !== 'resolved' && (
                        <button onClick={() => handleUpdateContactStatus(q._id, 'in-progress')} className="p-2 text-[#8c6d58] hover:bg-[#fbf7f4] rounded-md transition-colors border border-transparent hover:border-[#ebdcd0]" title="Mark In Progress">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => { setReplyId(replyId === q._id ? null : q._id); setReplyMsg(''); }} className="p-2 text-ink-black hover:bg-cream-paper rounded-md border border-transparent hover:border-ash" title="Reply">
                        <Send className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteContact(q._id)} className="p-2 text-[#7d2d2d] hover:bg-[#fcf5f5] rounded-md border border-transparent hover:border-[#f5d5d5]" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {replyId === q._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex gap-2 pt-2 border-t border-ash">
                      <input value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} className={`${inputCls} flex-1`} placeholder="Type your reply..." />
                      <button onClick={() => handleReplyContact(q._id)} className="px-4 py-2.5 bg-ink-black text-pure-white text-sm font-semibold rounded-md hover:bg-charcoal transition-all">
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
            <SectionHeader label="Verifier Accounts" />
            <div className="bg-pure-white rounded-md border border-ash p-6">
              <h3 className="font-nantes text-heading-sm font-normal text-ink-black mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-smoke" />Create New Verifier
              </h3>
              <form onSubmit={handleCreateVerifier} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={verForm.email} onChange={(e) => setVerForm({ ...verForm, email: e.target.value })} className={inputCls} placeholder="Email *" type="email" required />
                <input value={verForm.name} onChange={(e) => setVerForm({ ...verForm, name: e.target.value })} className={inputCls} placeholder="Name" />
                <input value={verForm.password} onChange={(e) => setVerForm({ ...verForm, password: e.target.value })} className={inputCls} placeholder="Password *" type="password" required />
                <button type="submit" disabled={verLoading} className="sm:col-span-3 w-full sm:w-auto px-6 py-2.5 bg-ink-black text-pure-white text-sm font-semibold rounded-md hover:bg-charcoal transition-all disabled:opacity-60">
                  {verLoading ? 'Creating...' : 'Create Verifier Account'}
                </button>
              </form>
            </div>
            <div className="bg-pure-white rounded-md border border-ash overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-smoke text-[11px] uppercase tracking-wider border-b border-ash bg-cream-paper">
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiers.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-smoke">No verifiers yet</td></tr>
                  ) : verifiers.map((v) => (
                    <tr key={v._id} className="border-b border-cream-paper hover:bg-cream-paper transition-colors">
                      <td className="px-5 py-3 font-medium text-ink-black">{v.name}</td>
                      <td className="px-5 py-3 text-charcoal">{v.email}</td>
                      <td className="px-5 py-3 text-smoke text-xs">{new Date(v.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleDeleteUser(v._id)} className="p-1.5 text-[#7d2d2d] hover:bg-[#fcf5f5] rounded-md transition-all border border-transparent hover:border-[#f5d5d5]">
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
            <div className="mb-2">
              <h2 className="text-heading font-normal text-ink-black font-nantes">
                Analytics <span className="text-sm font-normal text-smoke">(Last 30 days)</span>
              </h2>
              <div className="w-12 h-[3px] bg-butter-highlight mt-1" />
            </div>

            {/* Verification Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {reports?.verificationStats?.map((vs) => (
                <div key={vs._id} className="bg-pure-white rounded-md border border-ash p-4 text-center">
                  <p className="text-2xl font-bold text-ink-black font-graphik">{vs.count}</p>
                  <p className="text-xs text-smoke capitalize mt-1 font-graphik">{vs._id} Products</p>
                </div>
              ))}
            </div>

            {/* Daily Sales */}
            <div className="bg-pure-white rounded-md border border-ash p-6">
              <h3 className="font-nantes text-heading-sm font-normal text-ink-black mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-smoke" />Daily Sales
              </h3>
              {reports?.dailySales?.length > 0 ? (
                <div className="space-y-2">
                  {reports.dailySales.map((day) => (
                    <div key={day._id} className="flex items-center gap-3 text-sm">
                      <span className="text-smoke w-24 shrink-0 font-graphik">{day._id}</span>
                      <div className="flex-1 bg-cream-paper border border-ash rounded-md h-6 overflow-hidden">
                        <div className="bg-ink-black h-full rounded-md flex items-center px-2"
                          style={{ width: `${Math.min(100, (day.totalSales / Math.max(...reports.dailySales.map(d => d.totalSales))) * 100)}%` }}>
                          <span className="text-[10px] text-pure-white font-medium whitespace-nowrap">₹{day.totalSales.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <span className="text-xs text-smoke w-16 text-right font-graphik">{day.orderCount} orders</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-smoke text-center py-8">No sales data yet</p>}
            </div>

            {/* Top Products */}
            <div className="bg-pure-white rounded-md border border-ash p-6">
              <h3 className="font-nantes text-heading-sm font-normal text-ink-black mb-4">Top Selling Products</h3>
              <div className="space-y-2">
                {reports?.topProducts?.length > 0 ? reports.topProducts.map((prod, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-3 rounded-md hover:bg-cream-paper transition-colors">
                    <span className="text-charcoal truncate flex-1 font-graphik">
                      <span className="text-ink-black font-bold mr-2">#{i + 1}</span>{prod.title}
                    </span>
                    <span className="text-smoke mx-3 text-xs font-graphik">{prod.totalQty} sold</span>
                    <span className="font-bold text-ink-black font-graphik">₹{prod.totalRevenue?.toLocaleString('en-IN')}</span>
                  </div>
                )) : <p className="text-sm text-smoke text-center py-4">No sales data</p>}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Edit Category Modal ── */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="bg-pure-white rounded-md border border-ash w-full max-w-md">
              <div className="flex items-center justify-between p-5 border-b border-ash">
                <h2 className="font-nantes text-heading-sm text-ink-black">Edit Category</h2>
                <button onClick={() => setEditingCategory(null)} className="p-2 hover:bg-cream-paper rounded-md transition-colors"><X className="w-5 h-5 text-smoke" /></button>
              </div>
              <form onSubmit={handleEditCategory} className="p-5 space-y-4">
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Category Name *</label>
                  <input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} className={inputCls} required autoFocus />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={savingCat}
                    className="flex-1 py-2.5 bg-ink-black text-pure-white font-semibold rounded-md hover:bg-charcoal transition-all disabled:opacity-60 text-caption cursor-pointer">
                    {savingCat ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditingCategory(null)}
                    className="px-6 py-2.5 border border-ash text-charcoal font-semibold rounded-md hover:bg-cream-paper transition-all text-caption cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── View Product Details Modal ── */}
      <AnimatePresence>
        {viewingProduct && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="bg-pure-white rounded-md border border-ash w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-ash pb-3">
                <h2 className="font-nantes text-heading-sm text-ink-black">Product Details</h2>
                <button onClick={() => setViewingProduct(null)} className="p-2 hover:bg-cream-paper rounded-md transition-colors"><X className="w-5 h-5 text-smoke" /></button>
              </div>

              {viewingProduct.images?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {viewingProduct.images.map((img, i) => (
                    <img key={i} src={img.url} alt="" className="w-full h-40 object-cover rounded-md border border-ash" />
                  ))}
                </div>
              )}

              <div className="space-y-3 font-graphik text-charcoal text-caption">
                <p><strong>Title:</strong> {viewingProduct.title}</p>
                <p><strong>Description:</strong> {viewingProduct.description || 'No description'}</p>
                <p><strong>Price:</strong> ₹{viewingProduct.price?.toLocaleString('en-IN')}</p>
                <p><strong>MRP:</strong> ₹{viewingProduct.mrp?.toLocaleString('en-IN')}</p>
                <p><strong>Stock:</strong> {viewingProduct.stock}</p>
                <p><strong>Category:</strong> {viewingProduct.categoryId?.name || 'Unassigned'}</p>
                <p><strong>Seller:</strong> {viewingProduct.sellerId?.shopName || viewingProduct.sellerEmail}</p>
                <p><strong>Verification State:</strong> <Badge>{viewingProduct.verificationState}</Badge></p>
                <p><strong>Status:</strong> <Badge>{viewingProduct.status}</Badge></p>
                <p><strong>Tags:</strong> {(viewingProduct.tags || []).join(', ') || 'None'}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Product Modal ── */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="bg-pure-white rounded-md border border-ash w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-ash">
                <h2 className="font-nantes text-heading-sm text-ink-black">Edit Product (Admin)</h2>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-cream-paper rounded-md transition-colors"><X className="w-5 h-5 text-smoke" /></button>
              </div>
              <form onSubmit={handleEditProduct} className="p-5 space-y-4">
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Title *</label>
                  <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={inputCls} required />
                </div>
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={`${inputCls} min-h-[80px] resize-y`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">Price (₹) *</label>
                    <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">MRP (₹)</label>
                    <input type="number" value={editForm.mrp} onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">Category</label>
                    <select value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })} className={inputCls}>
                      <option value="">Select</option>
                      {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">Stock</label>
                    <input type="number" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">Status</label>
                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={inputCls}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="deleted">Deleted</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">Tags (comma separated)</label>
                    <input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={savingEdit}
                    className="flex-1 py-2.5 bg-ink-black text-pure-white font-semibold rounded-md hover:bg-charcoal transition-all disabled:opacity-60 text-caption cursor-pointer">
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditingProduct(null)}
                    className="px-6 py-2.5 border border-ash text-charcoal font-semibold rounded-md hover:bg-cream-paper transition-all text-caption cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
