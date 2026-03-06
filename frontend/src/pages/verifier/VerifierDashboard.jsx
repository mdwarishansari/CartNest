import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, CheckCircle, XCircle, Package, Eye, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services';
import { PageSpinner } from '../../components/ui/Spinner';

const VerifierDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [notesId, setNotesId] = useState(null);
  const [notes, setNotes] = useState('');

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

  const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all";

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-200">
            <ClipboardCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Verifier Dashboard</h1>
            <p className="text-sm text-gray-500">Review and verify product submissions</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['pending', 'verified', 'rejected'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
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
              {/* Images */}
              <div className="flex gap-2 shrink-0">
                {(prod.images?.length > 0 ? prod.images.slice(0, 3) : [{ url: 'https://placehold.co/100x100/e2e8f0/94a3b8?text=N' }]).map((img, i) => (
                  <img key={i} src={img.url} alt="" className="w-20 h-20 rounded-xl object-cover bg-gray-100" />
                ))}
              </div>

              {/* Details */}
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
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {prod.verificationNotes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg text-center ${
                  prod.verificationState === 'verified' ? 'bg-green-100 text-green-700' :
                  prod.verificationState === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
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

            {/* Rejection notes */}
            {notesId === prod._id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-gray-100 p-4 bg-gray-50 flex gap-2">
                <input value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} flex-1`} placeholder="Reason for rejection (optional)..." />
                <button onClick={() => handleVerify(prod._id, 'rejected', notes)}
                  className="px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-all shrink-0">
                  Reject
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VerifierDashboard;
