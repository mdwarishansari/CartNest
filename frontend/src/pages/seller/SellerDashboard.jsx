import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ShoppingBag, DollarSign, BarChart3, Plus, Trash2, Store, Edit, X, Upload, Save, CheckCircle, Clock, XCircle, Calendar, User, TrendingUp, Percent, Camera, Mail, Phone, ImagePlus, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { sellerService, categoryService, userService } from '../../services';
import { uploadMultipleImages, uploadImage } from '../../services/cloudinary';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/ui/Spinner';

const inputCls = "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all";

const verBadge = {
  pending: { cls: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending Review' },
  verified: { cls: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Verified & Live' },
  rejected: { cls: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' },
};

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
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {profile.logo?.url ? (
            <img src={profile.logo.url} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-200 shadow-sm" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
              {profile.shopName?.charAt(0) || 'S'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{profile.shopName || 'My Shop'}</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tab === t.key ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Package} label="Products" value={stats.totalProducts || 0} color="bg-indigo-500" />
            <StatCard icon={ShoppingBag} label="Orders" value={stats.totalOrders || 0} color="bg-blue-500" />
            <StatCard icon={TrendingUp} label="Net Earnings" value={`₹${(stats.netEarnings || netSales).toLocaleString('en-IN')}`} color="bg-green-500" sub="After 10% commission" />
            <StatCard icon={DollarSign} label="Balance" value={`₹${(stats.currentBalance || 0).toLocaleString('en-IN')}`} color="bg-amber-500" sub="Pending payout" />
          </div>

          {/* Commission Info */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Percent className="w-4 h-4 text-indigo-600" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">Earnings Breakdown</h4>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-lg font-bold text-gray-900">₹{(stats.totalSales || 0).toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-gray-500 font-medium">Gross Sales</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-lg font-bold text-red-500">-₹{(stats.commission || Math.round((stats.totalSales || 0) * commissionRate)).toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-gray-500 font-medium">Platform Fee (10%)</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3">
                <p className="text-lg font-bold text-green-600">₹{(stats.netEarnings || netSales).toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-gray-500 font-medium">Your Earnings</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
            {dashboard?.recentOrders?.length > 0 ? (
              <div className="space-y-2">
                {dashboard.recentOrders.map((o) => (
                  <div key={o._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                    <span className="font-mono text-xs text-gray-400">#{o.orderId || o._id.slice(-6)}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${o.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{o.orderStatus}</span>
                    <span className="font-bold">₹{o.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>}
          </div>
        </div>
      )}

      {/* ── Products ── */}
      {tab === 'products' && (
        <div className="space-y-3 animate-fade-in">
          {/* Mobile add button */}
          <button onClick={() => setShowAdd(true)} className="sm:hidden w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </button>

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <Package className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-600">No products yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first product to start selling!</p>
            </div>
          ) : products.map((prod) => {
            const vb = verBadge[prod.verificationState] || verBadge.pending;
            const VIcon = vb.icon;
            return (
              <motion.div key={prod._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                <img src={prod.images?.[0]?.url || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=N'} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{prod.title}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-sm font-bold text-gray-900">₹{prod.price?.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-gray-400">Stock: {prod.stock}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${vb.cls}`}>
                      <VIcon className="w-3 h-3" />{prod.verificationState}
                    </span>
                  </div>
                  {prod.verificationState === 'rejected' && prod.verificationNotes && (
                    <p className="text-xs text-red-500 mt-1">Reason: {prod.verificationNotes}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEditProduct(prod)} className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(prod._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete">
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
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-600">No orders yet</p>
              <p className="text-sm text-gray-400 mt-1">Orders containing your products will appear here.</p>
            </div>
          ) : orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order #{order.orderId || order._id.slice(-8)}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3" />{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.paymentStatus}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{order.orderStatus}</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900 block">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-green-600">You earn: ₹{Math.round(order.totalAmount * 0.9)?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Update:</span>
                {['processing', 'shipped', 'out_for_delivery', 'delivered'].map((st) => (
                  <button key={st} onClick={() => handleUpdateOrderStatus(order._id, st)}
                    disabled={order.orderStatus === st}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${order.orderStatus === st ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Store className="w-5 h-5 text-indigo-500" />Shop Profile</h3>
              <button onClick={() => { setEditProfile(!editProfile); setLogoFile(null); setLogoPreview(null); }}
                className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-1.5">
                <Edit className="w-4 h-4" />{editProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editProfile ? (
              <div className="space-y-5">
                {/* Logo upload */}
                <div className="flex flex-col items-center">
                  <label className="relative w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : profile.logo?.url ? (
                      <img src={profile.logo.url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400 group-hover:text-indigo-500 transition-colors">
                        <Camera className="w-6 h-6 mb-0.5" /><span className="text-[10px] font-medium">Change</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
                    }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                  <p className="text-xs text-gray-400 mt-1.5">Click to change shop logo</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Name</label>
                  <input value={profileForm.shopName} onChange={(e) => setProfileForm({ ...profileForm, shopName: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} className={`${inputCls} min-h-[100px] resize-y`} />
                </div>
                <button onClick={handleSaveProfile} disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
                  {savingProfile ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-5">
                  {profile.logo?.url ? (
                    <img src={profile.logo.url} alt="" className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200 shadow-sm" />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {profile.shopName?.charAt(0) || 'S'}
                    </div>
                  )}
                  <div>
                    <p className="text-xl font-bold text-gray-900">{profile.shopName}</p>
                    <p className="text-sm text-gray-400 mt-0.5">/{profile.shopSlug}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Mail className="w-3 h-3" />{profile.userEmail}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Shop Description</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{profile.description || 'No description added yet. Click Edit to add one.'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Account ── */}
      {tab === 'account' && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Personal Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input value={accountName} onChange={(e) => setAccountName(e.target.value)} className={inputCls} placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input value={accountPhone} onChange={(e) => setAccountPhone(e.target.value)} className={inputCls} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <p className="px-4 py-3 text-sm text-gray-500 bg-gray-50 rounded-xl border border-gray-200">{user?.email}</p>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <p className="px-4 py-3 text-sm bg-gray-50 rounded-xl border border-gray-200">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-md uppercase">{user?.role}</span>
              </p>
            </div>
            <button onClick={handleSaveAccount} disabled={savingAccount}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
              {savingAccount ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ── Add Product Modal ── */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddProduct} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} className={inputCls} required autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} className={`${inputCls} min-h-[80px] resize-y`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                    <input type="number" value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">MRP (₹)</label>
                    <input type="number" value={addForm.mrp} onChange={(e) => setAddForm({ ...addForm, mrp: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select value={addForm.categoryId} onChange={(e) => setAddForm({ ...addForm, categoryId: e.target.value })} className={inputCls}>
                      <option value="">Select</option>
                      {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                    <input type="number" value={addForm.stock} onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
                  <input value={addForm.tags} onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })} className={inputCls} placeholder="electronics, gadget" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images</label>
                  <p className="text-xs text-gray-400 mb-3">Upload up to 4 images. First image is primary and required.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <label key={i} className={`upload-slot ${imagePreviews[i] ? 'has-image' : ''} ${i === 0 ? 'primary' : ''}`}>
                        {imagePreviews[i] ? (
                          <>
                            <img src={imagePreviews[i]} alt="" className="w-full h-full object-cover rounded-[0.85rem]" />
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImageSlot(i); }} className="remove-btn"><X className="w-3 h-3" /></button>
                          </>
                        ) : (
                          <>
                            <ImagePlus className="w-6 h-6 text-gray-300 mb-1" />
                            <span className="text-[10px] font-semibold text-gray-400">{i === 0 ? 'Primary *' : `Image ${i + 1}`}</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) handleImageSlot(i, e.target.files[0]); e.target.value = ''; }} className="hidden" />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
                    {submitting ? 'Creating...' : 'Create Product'}
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)}
                    className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleEditProduct} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={`${inputCls} min-h-[80px] resize-y`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                    <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">MRP (₹)</label>
                    <input type="number" value={editForm.mrp} onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select value={editForm.categoryId} onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })} className={inputCls}>
                      <option value="">Select</option>
                      {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                    <input type="number" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={inputCls}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
                  <input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} className={inputCls} />
                </div>
                {/* Current images */}
                {editingProduct.images?.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Images</label>
                    <div className="grid grid-cols-4 gap-2">
                      {editingProduct.images.map((img, i) => (
                        <div key={i} className="upload-slot has-image">
                          <img src={img.url} alt="" className="w-full h-full object-cover rounded-[0.85rem]" />
                          {i === 0 && <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-bold rounded-md">PRIMARY</span>}
                          <button type="button" onClick={() => handleDeleteExistingImage(i)} className="remove-btn" style={{opacity:1}}><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Add new images — remaining slots */}
                {(editingProduct.images?.length || 0) < 4 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Add More Images ({4 - (editingProduct.images?.length || 0)} slot{4 - (editingProduct.images?.length || 0) !== 1 ? 's' : ''} available)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 4 - (editingProduct.images?.length || 0) }).map((_, i) => (
                        <label key={i} className={`upload-slot ${editImagePreviews[i] ? 'has-image' : ''}`}>
                          {editImagePreviews[i] ? (
                            <>
                              <img src={editImagePreviews[i]} alt="" className="w-full h-full object-cover rounded-[0.85rem]" />
                              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImageSlot(i, true); }} className="remove-btn"><X className="w-3 h-3" /></button>
                            </>
                          ) : (
                            <>
                              <ImagePlus className="w-5 h-5 text-gray-300 mb-0.5" />
                              <span className="text-[9px] text-gray-400">Add</span>
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
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditingProduct(null)}
                    className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all">
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

export default SellerDashboard;
