import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Store, Eye, CheckCircle, Clock, ArrowLeft, ChevronLeft, ChevronRight, Tag, Shield, Package, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { PageSpinner } from '../components/ui/Spinner';

const ProductDetail = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await productService.getBySlug(slug);
        setProduct(res.data.product);
      } catch {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) return <PageSpinner />;
  if (!product) return <div className="page-container text-center py-20 text-gray-500">Product not found</div>;

  const { title, price, mrp, description, images, stock, verificationState, sellerId, views, tags, categoryId } = product;
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const allImages = images?.length > 0 ? images : [{ url: 'https://placehold.co/600x600/e2e8f0/94a3b8?text=No+Image', alt: 'No Image' }];
  const currentImage = allImages[selectedImage]?.url;

  const handleAdd = () => {
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return; }
    addToCart(product._id, qty);
  };

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length);

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/search" className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to products
        </Link>
        {categoryId && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500">{categoryId.name}</span>
          </>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ═══ Image Gallery ═══ */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          {/* Main Image */}
          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group">
            <div
              ref={imageRef}
              className="aspect-square bg-gray-50 cursor-crosshair overflow-hidden"
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={currentImage}
                  alt={title}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-contain p-4"
                  style={zoomed ? { transform: `scale(2)`, transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transition: 'transform 0.1s' } : {}}
                />
              </AnimatePresence>

              {/* Discount Badge */}
              {discount > 0 && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-xl shadow-lg badge-shine">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {/* Nav Arrows */}
            {allImages.length > 1 && (
              <>
                <button onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all active:scale-95">
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all active:scale-95">
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex gap-2.5 mt-4 justify-center">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 ${i === selectedImage
                    ? 'border-indigo-500 shadow-lg shadow-indigo-200/50 scale-105'
                    : 'border-gray-200 hover:border-gray-300 opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.url} alt={img.alt || title} className="w-full h-full object-cover" />
                </button>
              ))}
            </motion.div>
          )}

          {/* Dot Indicators (mobile) */}
          {allImages.length > 1 && (
            <div className="dot-indicators mt-3 lg:hidden">
              {allImages.map((_, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`dot ${i === selectedImage ? 'active' : ''}`} />
              ))}
            </div>
          )}
        </motion.div>

        {/* ═══ Product Info ═══ */}
        <div className="space-y-0">
          {/* Category & Verification Badges */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}
            className="flex items-center gap-2.5 flex-wrap mb-4">
            {categoryId && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200/60 shadow-sm">
                <Tag className="w-3.5 h-3.5" />
                {categoryId.name}
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full shadow-sm ${verificationState === 'verified'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/60 badge-verified'
              : verificationState === 'rejected'
                ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200/60'
                : 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200/60'}`}>
              {verificationState === 'verified' ? <Shield className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              {verificationState === 'verified' ? 'Verified Product' : verificationState === 'rejected' ? 'Rejected' : 'Pending Review'}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 custom={1} initial="hidden" animate="visible" variants={sectionVariants}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {title}
          </motion.h1>

          {/* Seller Card */}
          {sellerId && (
            <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 rounded-xl border border-purple-100/60 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                {sellerId.shopName?.charAt(0) || 'S'}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Sold by</p>
                <p className="text-sm font-bold text-gray-800">{sellerId.shopName}</p>
              </div>
              <Store className="w-4 h-4 text-indigo-400 ml-auto" />
            </motion.div>
          )}

          <div className="section-divider" />

          {/* Price Block */}
          <motion.div custom={3} initial="hidden" animate="visible" variants={sectionVariants}
            className="flex items-end gap-3 py-3">
            <span className="text-4xl font-extrabold text-gray-900">₹{price?.toLocaleString('en-IN')}</span>
            {mrp && mrp > price && (
              <>
                <span className="text-xl text-gray-400 line-through mb-0.5">₹{mrp?.toLocaleString('en-IN')}</span>
                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-lg shadow-md animate-fade-in">
                  SAVE {discount}%
                </span>
              </>
            )}
          </motion.div>

          {/* Stock Status */}
          <motion.div custom={4} initial="hidden" animate="visible" variants={sectionVariants}
            className="mb-4">
            {stock > 5 ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200/60 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-700 font-semibold text-sm">In Stock</span>
                <span className="text-green-500 text-xs">• Ready to ship</span>
              </div>
            ) : stock > 0 ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200/60 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-700 font-semibold text-sm">Only {stock} left!</span>
                <span className="text-amber-500 text-xs">• Hurry up</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200/60 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-red-700 font-semibold text-sm">Out of Stock</span>
              </div>
            )}
          </motion.div>

          <div className="section-divider" />

          {/* Quantity + Add to Cart */}
          {stock > 0 && (
            <motion.div custom={5} initial="hidden" animate="visible" variants={sectionVariants}
              className="flex items-center gap-4 py-2 mb-2">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors active:bg-gray-200">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-2.5 text-sm font-bold min-w-[48px] text-center bg-gray-50">{qty}</span>
                <button onClick={() => setQty(Math.min(stock, qty + 1))}
                  className="p-3 hover:bg-gray-100 transition-colors active:bg-gray-200">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleAdd}
                className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base">
                <ShoppingCart className="w-5 h-5" />Add to Cart
              </button>
            </motion.div>
          )}

          <div className="section-divider" />

          {/* Description */}
          {description && (
            <motion.div custom={6} initial="hidden" animate="visible" variants={sectionVariants}
              className="py-2">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-3">
                <Package className="w-4 h-4 text-indigo-500" />Product Description
              </h3>
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{description}</p>
              </div>
            </motion.div>
          )}

          {/* Tags */}
          {tags?.length > 0 && (
            <motion.div custom={7} initial="hidden" animate="visible" variants={sectionVariants}
              className="flex flex-wrap gap-2 py-3">
              {tags.map((tag, i) => (
                <span key={i}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 rounded-full text-xs font-semibold border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:from-indigo-50 hover:to-purple-50 transition-all cursor-default">
                  #{tag}
                </span>
              ))}
            </motion.div>
          )}

          {/* Views */}
          {views > 0 && (
            <motion.div custom={8} initial="hidden" animate="visible" variants={sectionVariants}
              className="flex items-center gap-2 text-xs text-gray-400 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-medium">{views.toLocaleString('en-IN')} views</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
