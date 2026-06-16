import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ShoppingBag, DollarSign, BarChart3, Plus, Trash2, Store, Edit, X, Upload, Save, CheckCircle, Clock, XCircle, Calendar, User, TrendingUp, Percent, Camera, Mail, Phone, ImagePlus, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { sellerService, categoryService, userService, productService } from '../../services';
import { uploadMultipleImages, uploadImage } from '../../services/cloudinary';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/ui/Spinner';

const inputCls = "w-full px-3 py-2 text-caption border border-ash rounded-md bg-pure-white focus:border-ink-black outline-none transition-all font-graphik text-charcoal placeholder:text-smoke";

const verBadge = {
  pending: { cls: 'bg-[#fbf7f4] text-[#8c6d58] border border-[#ebdcd0]', icon: Clock, label: 'Pending Review' },
  verified: { cls: 'bg-[#f4f9f4] text-[#1e4620] border border-[#d0e5d2]', icon: CheckCircle, label: 'Verified & Live' },
  rejected: { cls: 'bg-[#fcf5f5] text-[#7d2d2d] border border-[#f5d5d5]', icon: XCircle, label: 'Rejected' },
};

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="bg-pure-white rounded-md border border-ash p-5 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-cream-paper border border-ash flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-smoke" />
      </div>
      <div>
        <p className="text-subheading font-bold text-ink-black">{value}</p>
        <p className="text-[12px] text-smoke font-semibold uppercase tracking-wider">{label}</p>
        {sub && <p className="text-[10px] text-smoke mt-0.5">{sub}</p>}
      </div>
    </div>
  </motion.div>
);

const SellerDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  // Add product
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ title: '', description: '', price: '', mrp: '', categoryId: '', stock: '', tags: '' });
  const [imageSlots, setImageSlots] = useState([null, null, null, null]);
  const [imagePreviews, setImagePreviews] = useState([null, null, null, null]);
  const [submitting, setSubmitting] = useState(false);

  // Edit product
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImageSlots, setEditImageSlots] = useState([null, null, null, null]);
  const [editImagePreviews, setEditImagePreviews] = useState([null, null, null, null]);
  const [savingEdit, setSavingEdit] = useState(false);

  // Edit shop profile
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ shopName: '', description: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Account profile
  const [accountName, setAccountName] = useState('');
  const [accountPhone, setAccountPhone] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    Promise.all([
      sellerService.getDashboard(),
      sellerService.getProducts({ limit: 50 }),
      categoryService.getAll(),
    ]).then(([dashRes, prodRes, catRes]) => {
      setDashboard(dashRes.data);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
      if (dashRes.data.profile) {
        setProfileForm({ shopName: dashRes.data.profile.shopName || '', description: dashRes.data.profile.description || '' });
      }
      setAccountName(user?.name || '');
      setAccountPhone(user?.phone || '');
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'orders') {
      sellerService.getOrders({ limit: 50 }).then((res) => setOrders(res.data.orders || [])).catch(() => {});
    }
  }, [tab]);

  const handleImageSlot = (index, file, isEdit = false) => {
    if (!file) return;
    const setSlots = isEdit ? setEditImageSlots : setImageSlots;
    const setPreviews = isEdit ? setEditImagePreviews : setImagePreviews;
    setSlots((prev) => { const next = [...prev]; next[index] = file; return next; });
    setPreviews((prev) => { const next = [...prev]; next[index] = URL.createObjectURL(file); return next; });
  };

  const removeImageSlot = (index, isEdit = false) => {
    const setSlots = isEdit ? setEditImageSlots : setImageSlots;
    const setPreviews = isEdit ? setEditImagePreviews : setImagePreviews;
    setSlots((prev) => { const next = [...prev]; next[index] = null; return next; });
    setPreviews((prev) => { const next = [...prev]; if (next[index]) URL.revokeObjectURL(next[index]); next[index] = null; return next; });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!imageSlots[0]) { toast.error('Primary image is required'); return; }
    setSubmitting(true);
    try {
      const filesToUpload = imageSlots.filter(Boolean);
      let images = [];
      if (filesToUpload.length > 0) {
        images = await uploadMultipleImages(filesToUpload, 'product');
      }
      const payload = {
        title: addForm.title,
        description: addForm.description,
        price: Number(addForm.price),
        mrp: Number(addForm.mrp) || Number(addForm.price),
        categoryId: addForm.categoryId || undefined,
        stock: Number(addForm.stock) || 0,
        tags: addForm.tags ? addForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        images,
      };
      const res = await sellerService.createProduct(payload);
      setProducts([res.data.product, ...products]);
      setShowAdd(false);
      setAddForm({ title: '', description: '', price: '', mrp: '', categoryId: '', stock: '', tags: '' });
      setImageSlots([null, null, null, null]);
      setImagePreviews([null, null, null, null]);
      toast.success('Product created! It will be visible after verification.');
    } catch (err) { toast.error(err.message || 'Failed to create product'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await sellerService.deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch (err) { toast.error(err.message); }
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
      tags: (prod.tags || []).join(', '),
      status: prod.status || 'active',
    });
    setEditImageSlots([null, null, null, null]);
    setEditImagePreviews([null, null, null, null]);
  };

  const handleDeleteExistingImage = async (imgIndex) => {
    try {
      const img = editingProduct.images[imgIndex];
      await productService.deleteImage(editingProduct._id, img.public_id);
      const updatedImages = editingProduct.images.filter((_, i) => i !== imgIndex);
      setEditingProduct({ ...editingProduct, images: updatedImages });
      setProducts(products.map((p) => p._id === editingProduct._id ? { ...p, images: updatedImages } : p));
      toast.success('Image removed');
    } catch (err) { toast.error(err.message || 'Failed to remove image'); }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const filesToUpload = editImageSlots.filter(Boolean);
      let newImages = [];
      if (filesToUpload.length > 0) {
        newImages = await uploadMultipleImages(filesToUpload, 'product');
      }
      const payload = {
        title: editForm.title,
        description: editForm.description,
        price: Number(editForm.price),
        mrp: Number(editForm.mrp) || Number(editForm.price),
        categoryId: editForm.categoryId || undefined,
        stock: Number(editForm.stock),
        tags: editForm.tags ? editForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        status: editForm.status,
      };
      if (newImages.length > 0) {
        payload.images = [...(editingProduct.images || []), ...newImages];
      }
      const res = await sellerService.updateProduct(editingProduct._id, payload);
      setProducts(products.map((p) => p._id === editingProduct._id ? res.data.product : p));
      setEditingProduct(null);
      toast.success('Product updated successfully');
    } catch (err) { toast.error(err.message || 'Failed to update product'); }
    finally { setSavingEdit(false); }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      let logoData = undefined;
      if (logoFile) {
        const uploaded = await uploadImage(logoFile, 'seller', profileForm.shopName);
        logoData = { public_id: uploaded.public_id, url: uploaded.url };
      }
      await sellerService.updateProfile({
        ...profileForm,
        ...(logoData ? { logo: logoData } : {}),
      });
      toast.success('Shop profile updated');
      setEditProfile(false);
      setLogoFile(null);
      setLogoPreview(null);
      const res = await sellerService.getDashboard();
      setDashboard(res.data);
    } catch (err) { toast.error(err.message); }
    finally { setSavingProfile(false); }
  };

  const handleSaveAccount = async () => {
    setSavingAccount(true);
    try {
      await userService.updateProfile({ name: accountName, phone: accountPhone });
      await refreshUser();
      toast.success('Account details updated');
    } catch (err) { toast.error(err.message); }
    finally { setSavingAccount(false); }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await sellerService.updateOrderStatus(orderId, status);
      setOrders(orders.map((o) => o._id === orderId ? { ...o, orderStatus: status } : o));
      toast.success('Status updated');
    } catch (err) { toast.error(err.message); }
  };

  if (loading) return <PageSpinner />;

  const stats = dashboard?.stats || {};
  const profile = dashboard?.profile || {};
  const commissionRate = 0.10;
  const netSales = Math.round((stats.totalSales || 0) * (1 - commissionRate));
  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
    { key: 'shop', label: 'Shop', icon: Store },
    { key: 'account', label: 'Account', icon: User },
  ];

  return (
    <div className="bg-cream-paper min-h-screen font-graphik py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 pb-6 border-b border-ash">
          <div className="flex items-center gap-4">
            {profile.logo?.url ? (
              <img src={profile.logo.url} alt="" className="w-14 h-14 rounded-md object-cover border border-ash shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-md bg-ink-black flex items-center justify-center text-pure-white text-lg font-bold shrink-0">
                {profile.shopName?.charAt(0) || 'S'}
              </div>
            )}
            <div>
              <h1 className="text-heading sm:text-heading-lg font-nantes text-ink-black">{profile.shopName || 'My Shop'}</h1>
              <p className="text-caption text-smoke">{user?.email}</p>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-ink-black hover:bg-charcoal text-pure-white text-caption font-semibold rounded-md transition-all cursor-pointer">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-pure-white border border-ash rounded-md p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-caption font-semibold transition-all whitespace-nowrap cursor-pointer ${tab === t.key ? 'bg-ink-black text-pure-white' : 'text-smoke hover:text-charcoal bg-transparent'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Package} label="Products" value={stats.totalProducts || 0} />
              <StatCard icon={ShoppingBag} label="Orders" value={stats.totalOrders || 0} />
              <StatCard icon={TrendingUp} label="Net Earnings" value={`₹${(stats.netEarnings || netSales).toLocaleString('en-IN')}`} sub="After 10% commission" />
              <StatCard icon={DollarSign} label="Balance" value={`₹${(stats.currentBalance || 0).toLocaleString('en-IN')}`} sub="Pending payout" />
            </div>

            {/* Commission Info */}
            <div className="bg-pure-white rounded-md border border-ash p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-cream-paper border border-ash flex items-center justify-center shrink-0">
                  <Percent className="w-4 h-4 text-smoke" />
                </div>
                <h4 className="font-nantes text-heading-sm text-ink-black">Earnings Breakdown</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-cream-paper border border-ash rounded-md p-3">
                  <p className="text-caption font-bold text-ink-black">₹{(stats.totalSales || 0).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-smoke font-semibold uppercase tracking-wider">Gross Sales</p>
                </div>
                <div className="bg-cream-paper border border-ash rounded-md p-3">
                  <p className="text-caption font-bold text-[#7d2d2d]">-₹{(stats.commission || Math.round((stats.totalSales || 0) * commissionRate)).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-smoke font-semibold uppercase tracking-wider">Platform Fee (10%)</p>
                </div>
                <div className="bg-cream-paper border border-ash rounded-md p-3">
                  <p className="text-caption font-bold text-ink-black">₹{(stats.netEarnings || netSales).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-smoke font-semibold uppercase tracking-wider">Your Earnings</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-pure-white rounded-md border border-ash p-6">
              <h3 className="font-nantes text-heading-sm text-ink-black mb-4">Recent Orders</h3>
              {dashboard?.recentOrders?.length > 0 ? (
                <div className="space-y-2">
                  {dashboard.recentOrders.map((o) => (
                    <div key={o._id} className="flex items-center justify-between p-3 rounded-md border border-ash/40 bg-cream-paper/50 hover:bg-cream-paper transition-colors text-caption">
                      <span className="font-mono text-xs text-smoke">#{o.orderId || o._id.slice(-6)}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-3xl uppercase border ${o.orderStatus === 'delivered' ? 'bg-[#f4f9f4] text-[#1e4620] border-[#d0e5d2]' : 'bg-[#fbf7f4] text-[#8c6d58] border-[#ebdcd0]'}`}>{o.orderStatus}</span>
                      <span className="font-bold text-ink-black">₹{o.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-caption text-smoke text-center py-6">No orders yet</p>}
            </div>
          </div>
        )}

      {/* ── Products ── */}
      {tab === 'products' && (
        <div className="space-y-3 animate-fade-in">
          {/* Mobile add button */}
          <button onClick={() => setShowAdd(true)} className="sm:hidden w-full py-3 bg-ink-black text-pure-white text-caption font-semibold rounded-md flex items-center justify-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Add Product
          </button>

          {products.length === 0 ? (
            <div className="bg-pure-white rounded-md border border-ash p-16 text-center">
              <Package className="w-12 h-12 text-smoke mx-auto mb-3" />
              <p className="text-subheading font-normal text-charcoal">No products yet</p>
              <p className="text-caption text-smoke mt-1">Add your first product to start selling!</p>
            </div>
          ) : products.map((prod) => {
            const vb = verBadge[prod.verificationState] || verBadge.pending;
            const VIcon = vb.icon;
            return (
              <motion.div key={prod._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-pure-white rounded-md border border-ash p-4 flex items-center gap-4 hover:border-charcoal transition-all">
                <img src={prod.images?.[0]?.url || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=N'} alt="" className="w-16 h-16 rounded-md object-cover bg-cream-paper shrink-0 border border-ash/40" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-caption text-charcoal truncate">{prod.title}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-caption font-bold text-ink-black">₹{prod.price?.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-smoke font-medium">Stock: {prod.stock}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold uppercase rounded-3xl border ${vb.cls}`}>
                      <VIcon className="w-3 h-3" />{prod.verificationState}
                    </span>
                  </div>
                  {prod.verificationState === 'rejected' && prod.verificationNotes && (
                    <p className="text-xs text-[#7d2d2d] mt-1 font-semibold">Reason: {prod.verificationNotes}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEditProduct(prod)} className="p-2 text-smoke hover:text-ink-black hover:bg-cream-paper rounded-md border border-transparent hover:border-ash transition-all cursor-pointer" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(prod._id)} className="p-2 text-[#7d2d2d] hover:text-[#5c1e1e] hover:bg-[#fcf5f5] border border-transparent hover:border-[#f5d5d5] rounded-md transition-all cursor-pointer" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Orders ── */}
      {tab === 'orders' && (
        <div className="space-y-3 animate-fade-in">
          {orders.length === 0 ? (
            <div className="bg-pure-white rounded-md border border-ash p-16 text-center">
              <ShoppingBag className="w-12 h-12 text-smoke mx-auto mb-3" />
              <p className="text-subheading font-normal text-charcoal">No orders yet</p>
              <p className="text-caption text-smoke mt-1">Orders containing your products will appear here.</p>
            </div>
          ) : orders.map((order) => (
            <div key={order._id} className="bg-pure-white rounded-md border border-ash p-5 space-y-4 hover:border-charcoal transition-all">
              <div className="flex items-center justify-between border-b border-ash pb-3 flex-wrap gap-2">
                <div>
                  <p className="text-caption font-semibold text-charcoal">Order #{order.orderId || order._id.slice(-8)}</p>
                  <p className="text-xs text-smoke flex items-center gap-1 mt-0.5 font-medium"><Calendar className="w-3 h-3" />{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-3xl uppercase border ${order.paymentStatus === 'paid' ? 'bg-[#f4f9f4] text-[#1e4620] border-[#d0e5d2]' : 'bg-[#fbf7f4] text-[#8c6d58] border-[#ebdcd0]'}`}>{order.paymentStatus}</span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-3xl uppercase border ${order.orderStatus === 'delivered' ? 'bg-[#f4f9f4] text-[#1e4620] border-[#d0e5d2]' : 'bg-[#fbf7f4] text-[#8c6d58] border-[#ebdcd0]'}`}>{order.orderStatus}</span>
                  <div className="text-right">
                    <span className="font-bold text-ink-black block text-caption">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-smoke font-medium">Earn: ₹{Math.round(order.totalAmount * 0.9)?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-smoke font-semibold uppercase tracking-wider">Update status:</span>
                {['processing', 'shipped', 'out_for_delivery', 'delivered'].map((st) => (
                  <button key={st} onClick={() => handleUpdateOrderStatus(order._id, st)}
                    disabled={order.orderStatus === st}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${order.orderStatus === st ? 'bg-ink-black text-pure-white border-ink-black' : 'bg-pure-white text-smoke border-ash hover:bg-cream-paper hover:text-ink-black'}`}>
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Shop Profile ── */}
      {tab === 'shop' && (
        <div className="animate-fade-in">
          <div className="bg-pure-white rounded-md border border-ash p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-nantes text-heading-sm text-ink-black flex items-center gap-2"><Store className="w-5 h-5 text-smoke" />Shop Profile</h3>
              <button onClick={() => { setEditProfile(!editProfile); setLogoFile(null); setLogoPreview(null); }}
                className="px-3 py-1.5 text-caption font-semibold text-charcoal hover:text-ink-black border border-ash hover:bg-cream-paper rounded-md transition-all flex items-center gap-1.5 cursor-pointer">
                <Edit className="w-4 h-4" />{editProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editProfile ? (
              <div className="space-y-5">
                {/* Logo upload */}
                <div className="flex flex-col items-center">
                  <label className="relative w-20 h-20 rounded-md bg-pure-white border border-dashed border-ash flex items-center justify-center overflow-hidden cursor-pointer hover:border-ink-black transition-all group">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : profile.logo?.url ? (
                      <img src={profile.logo.url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-smoke group-hover:text-ink-black transition-colors">
                        <Camera className="w-5 h-5 mb-0.5" /><span className="text-[10px] font-semibold">Change</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
                    }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                  <p className="text-xs text-smoke mt-1.5">Click to change shop logo</p>
                </div>
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Shop Name</label>
                  <input value={profileForm.shopName} onChange={(e) => setProfileForm({ ...profileForm, shopName: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Description</label>
                  <textarea value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} className={`${inputCls} min-h-[100px] resize-y`} />
                </div>
                <button onClick={handleSaveProfile} disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black hover:bg-charcoal text-pure-white text-caption font-semibold rounded-md transition-all disabled:opacity-60 cursor-pointer">
                  {savingProfile ? <span className="w-4 h-4 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-5">
                  {profile.logo?.url ? (
                    <img src={profile.logo.url} alt="" className="w-20 h-20 rounded-md object-cover border border-ash" />
                  ) : (
                    <div className="w-20 h-20 rounded-md bg-ink-black flex items-center justify-center text-pure-white text-2xl font-bold">
                      {profile.shopName?.charAt(0) || 'S'}
                    </div>
                  )}
                  <div>
                    <p className="text-subheading font-bold text-ink-black">{profile.shopName}</p>
                    <p className="text-caption text-smoke mt-0.5">/{profile.shopSlug}</p>
                    <p className="text-xs text-smoke mt-1 flex items-center gap-1"><Mail className="w-3 h-3" />{profile.userEmail}</p>
                  </div>
                </div>
                <div className="bg-cream-paper rounded-md p-4 border border-ash">
                  <p className="text-caption font-semibold text-charcoal mb-1">Shop Description</p>
                  <p className="text-caption text-smoke leading-relaxed">{profile.description || 'No description added yet. Click Edit to add one.'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Account ── */}
      {tab === 'account' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-pure-white rounded-md border border-ash p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-cream-paper border border-ash flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-smoke" />
              </div>
              <h3 className="font-nantes text-heading-sm text-ink-black">Personal Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-caption font-semibold text-charcoal mb-2">Name</label>
                <input value={accountName} onChange={(e) => setAccountName(e.target.value)} className={inputCls} placeholder="Your name" />
              </div>
              <div>
                <label className="block text-caption font-semibold text-charcoal mb-2">Phone</label>
                <input value={accountPhone} onChange={(e) => setAccountPhone(e.target.value)} className={inputCls} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-caption font-semibold text-charcoal mb-2">Email</label>
              <p className="px-3 py-2 text-caption text-smoke bg-cream-paper rounded-md border border-ash">{user?.email}</p>
            </div>
            <div className="mb-6">
              <label className="block text-caption font-semibold text-charcoal mb-2">Role</label>
              <div className="px-3 py-2 text-caption text-smoke bg-cream-paper rounded-md border border-ash">
                <span className="px-2 py-0.5 bg-pure-white text-charcoal border border-ash text-[10px] font-semibold rounded-3xl uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>
            <button onClick={handleSaveAccount} disabled={savingAccount}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-black hover:bg-charcoal text-pure-white text-caption font-semibold rounded-md transition-all disabled:opacity-60 cursor-pointer">
              {savingAccount ? <span className="w-4 h-4 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ── Add Product Modal ── */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="bg-pure-white rounded-md border border-ash w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-ash">
                <h2 className="font-nantes text-heading-sm text-ink-black">Add New Product</h2>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-cream-paper rounded-md transition-colors cursor-pointer"><X className="w-5 h-5 text-smoke" /></button>
              </div>
              <form onSubmit={handleAddProduct} className="p-5 space-y-4">
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Title *</label>
                  <input value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} className={inputCls} required autoFocus />
                </div>
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Description</label>
                  <textarea value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} className={`${inputCls} min-h-[80px] resize-y`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">Price (₹) *</label>
                    <input type="number" value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">MRP (₹)</label>
                    <input type="number" value={addForm.mrp} onChange={(e) => setAddForm({ ...addForm, mrp: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">Category</label>
                    <select value={addForm.categoryId} onChange={(e) => setAddForm({ ...addForm, categoryId: e.target.value })} className={inputCls}>
                      <option value="">Select</option>
                      {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">Stock</label>
                    <input type="number" value={addForm.stock} onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Tags (comma separated)</label>
                  <input value={addForm.tags} onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })} className={inputCls} placeholder="electronics, gadget" />
                </div>
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Product Images</label>
                  <p className="text-xs text-smoke mb-3">Upload up to 4 images. First image is primary and required.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <label key={i} className={`upload-slot ${imagePreviews[i] ? 'has-image' : ''} ${i === 0 ? 'primary' : ''}`}>
                        {imagePreviews[i] ? (
                          <>
                            <img src={imagePreviews[i]} alt="" className="w-full h-full object-cover rounded-sm" />
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImageSlot(i); }} className="remove-btn cursor-pointer"><X className="w-3 h-3" /></button>
                          </>
                        ) : (
                          <>
                            <ImagePlus className="w-5 h-5 text-smoke mb-1" />
                            <span className="text-[10px] font-semibold text-smoke">{i === 0 ? 'Primary *' : `Image ${i + 1}`}</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) handleImageSlot(i, e.target.files[0]); e.target.value = ''; }} className="hidden" />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2.5 bg-ink-black text-pure-white font-semibold rounded-md hover:bg-charcoal transition-all disabled:opacity-60 text-caption cursor-pointer">
                    {submitting ? 'Creating...' : 'Create Product'}
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)}
                    className="px-6 py-2.5 border border-ash text-charcoal font-semibold rounded-md hover:bg-cream-paper transition-all text-caption cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
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
                <h2 className="font-nantes text-heading-sm text-ink-black">Edit Product</h2>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-cream-paper rounded-md transition-colors cursor-pointer"><X className="w-5 h-5 text-smoke" /></button>
              </div>
              <form onSubmit={handleEditProduct} className="p-5 space-y-4">
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Title</label>
                  <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={`${inputCls} min-h-[80px] resize-y`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">Price (₹)</label>
                    <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className={inputCls} />
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
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={inputCls}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-caption font-semibold text-charcoal mb-2">Tags (comma separated)</label>
                  <input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} className={inputCls} />
                </div>
                {/* Current images */}
                {editingProduct.images?.length > 0 && (
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">Current Images</label>
                    <div className="grid grid-cols-4 gap-2">
                      {editingProduct.images.map((img, i) => (
                        <div key={i} className="upload-slot has-image">
                          <img src={img.url} alt="" className="w-full h-full object-cover rounded-sm" />
                          {i === 0 && <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-ink-black text-pure-white text-[8px] font-semibold rounded-sm">PRIMARY</span>}
                          <button type="button" onClick={() => handleDeleteExistingImage(img.public_id || img._id || i)} className="remove-btn cursor-pointer" style={{opacity:1}}><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Add new images — remaining slots */}
                {(editingProduct.images?.length || 0) < 4 && (
                  <div>
                    <label className="block text-caption font-semibold text-charcoal mb-2">Add More Images ({4 - (editingProduct.images?.length || 0)} slot{4 - (editingProduct.images?.length || 0) !== 1 ? 's' : ''} available)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 4 - (editingProduct.images?.length || 0) }).map((_, i) => (
                        <label key={i} className={`upload-slot ${editImagePreviews[i] ? 'has-image' : ''}`}>
                          {editImagePreviews[i] ? (
                            <>
                              <img src={editImagePreviews[i]} alt="" className="w-full h-full object-cover rounded-sm" />
                              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImageSlot(i, true); }} className="remove-btn cursor-pointer"><X className="w-3 h-3" /></button>
                            </>
                          ) : (
                            <>
                              <ImagePlus className="w-5 h-5 text-smoke mb-0.5" />
                              <span className="text-[9px] text-smoke">Add</span>
                            </>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) handleImageSlot(i, e.target.files[0], true); e.target.value = ''; }} className="hidden" />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
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
    </div>
  );
};

export default SellerDashboard;
