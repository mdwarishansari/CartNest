import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Store, Eye, Clock, ArrowLeft, ChevronLeft, ChevronRight, Tag, Shield, Package, Sparkles } from 'lucide-react';
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
  if (!product) return <div className="min-h-screen bg-cream-paper flex items-center justify-center font-graphik text-smoke py-20 text-caption">Product not found</div>;

  const { title, price, mrp, description, images, stock, verificationState, sellerId, views, tags, categoryId } = product;
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const allImages = images?.length > 0 ? images : [{ url: 'https://placehold.co/600x600/e2e8f0/94a3b8?text=No+Image', alt: 'No Image' }];
  const currentImage = allImages[selectedImage]?.url;

  const handleAdd = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to cart');
      return;
    }
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
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
  };

  return (
    <div className="bg-cream-paper min-h-screen font-graphik">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-caption text-smoke mb-6">
          <Link to="/search" className="inline-flex items-center gap-1 hover:text-ink-black transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to products
          </Link>
          {categoryId && (
            <>
              <span className="text-ash">/</span>
              <span className="text-charcoal font-medium">{categoryId.name}</span>
            </>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* ═══ Image Gallery ═══ */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            {/* Main Image */}
            <div className="relative bg-pure-white rounded-md border border-ash overflow-hidden group">
              <div
                ref={imageRef}
                className="aspect-square bg-cream-paper cursor-crosshair overflow-hidden"
                onMouseEnter={() => setZoomed(true)}
                onMouseLeave={() => setZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={currentImage}
                    alt={title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full object-contain p-4"
                    style={zoomed ? { transform: `scale(2)`, transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transition: 'transform 0.1s' } : {}}
                  />
                </AnimatePresence>

                {/* Discount Badge */}
                {discount > 0 && (
                  <span className="absolute top-4 left-4 px-2.5 py-1 bg-butter-highlight text-ink-black text-[10px] font-semibold border border-ink-black/15 rounded-md">
                    -{discount}% OFF
                  </span>
                )}
              </div>

              {/* Nav Arrows */}
              {allImages.length > 1 && (
                <>
                  <button onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-pure-white rounded-full border border-ash flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-95">
                    <ChevronLeft className="w-4 h-4 text-charcoal" />
                  </button>
                  <button onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-pure-white rounded-full border border-ash flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-95">
                    <ChevronRight className="w-4 h-4 text-charcoal" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="flex gap-2 mt-4 justify-center">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border flex-shrink-0 transition-all duration-200 ${i === selectedImage
                      ? 'border-ink-black scale-102'
                      : 'border-ash hover:border-smoke opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img.url} alt={img.alt || title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </motion.div>
            )}

            {/* Dot Indicators (mobile) */}
            {allImages.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3 lg:hidden">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === selectedImage ? 'bg-ink-black w-3' : 'bg-ash'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* ═══ Product Info ═══ */}
          <div className="space-y-6">
            
            {/* Category & Verification Badges */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={sectionVariants}
              className="flex items-center gap-2 flex-wrap">
              {categoryId && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-pure-white text-charcoal text-[11px] rounded-md border border-ash">
                  <Tag className="w-3.5 h-3.5 text-smoke" />
                  {categoryId.name}
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] rounded-md border ${
                verificationState === 'verified'
                  ? 'bg-[#f2fcf5] text-green-700 border-green-200'
                  : verificationState === 'rejected'
                    ? 'bg-[#fef2f2] text-red-700 border-red-200'
                    : 'bg-[#fffbeb] text-amber-700 border-amber-200'
              }`}>
                {verificationState === 'verified' ? <Shield className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {verificationState === 'verified' ? 'Verified Product' : verificationState === 'rejected' ? 'Rejected' : 'Pending Review'}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1 custom={1} initial="hidden" animate="visible" variants={sectionVariants}
              className="text-2xl sm:text-3xl lg:text-[36px] font-nantes text-ink-black leading-tight">
              {title}
            </motion.h1>

            {/* Seller Card */}
            {sellerId && (
              <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants}
                className="flex items-center gap-3 p-3.5 bg-pure-white rounded-md border border-ash">
                <div className="w-9 h-9 rounded-md bg-ink-black flex items-center justify-center text-pure-white text-sm font-bold">
                  {sellerId.shopName?.charAt(0) || 'S'}
                </div>
                <div>
                  <p className="text-[10px] text-smoke uppercase tracking-wider">Sold by</p>
                  <p className="text-caption font-semibold text-charcoal">{sellerId.shopName}</p>
                </div>
                <Store className="w-4 h-4 text-smoke ml-auto" />
              </motion.div>
            )}

            <hr className="border-ash/40" />

            {/* Price Block */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={sectionVariants}
              className="flex items-baseline gap-3">
              <span className="text-[32px] font-normal text-ink-black">₹{price?.toLocaleString('en-IN')}</span>
              {mrp && mrp > price && (
                <>
                  <span className="text-lg text-smoke line-through">₹{mrp?.toLocaleString('en-IN')}</span>
                  <span className="px-2.5 py-0.5 bg-butter-highlight text-ink-black border border-ink-black/10 text-[10px] font-semibold rounded-md animate-fade-in">
                    SAVE {discount}%
                  </span>
                </>
              )}
            </motion.div>

            {/* Stock Status */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
              {stock > 5 ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f2fcf5] border border-green-200 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-green-700 text-caption">In Stock</span>
                </div>
              ) : stock > 0 ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fffbeb] border border-amber-200 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-amber-700 text-caption">Only {stock} left!</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#fef2f2] border border-red-200 rounded-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-red-700 text-caption">Out of Stock</span>
                </div>
              )}
            </motion.div>

            <hr className="border-ash/40" />

            {/* Quantity + Add to Cart */}
            {stock > 0 && (
              <motion.div custom={5} initial="hidden" animate="visible" variants={sectionVariants}
                className="flex items-center gap-4">
                <div className="flex items-center border border-ash rounded-md overflow-hidden bg-pure-white">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-2.5 hover:bg-cream-paper transition-colors active:bg-ash/20">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 py-2 text-caption font-semibold min-w-[40px] text-center bg-pure-white text-ink-black">{qty}</span>
                  <button onClick={() => setQty(Math.min(stock, qty + 1))}
                    className="p-2.5 hover:bg-cream-paper transition-colors active:bg-ash/20">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button onClick={handleAdd}
                  className="flex-1 py-3 bg-ink-black text-pure-white font-semibold rounded-md hover:bg-charcoal transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-caption">
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </motion.div>
            )}

            <hr className="border-ash/40" />

            {/* Description */}
            {description && (
              <motion.div custom={6} initial="hidden" animate="visible" variants={sectionVariants}
                className="space-y-2.5">
                <h3 className="flex items-center gap-2 text-caption font-semibold text-ink-black uppercase tracking-wider">
                  <Package className="w-4 h-4 text-smoke" /> Product Description
                </h3>
                <div className="bg-pure-white rounded-md p-4 border border-ash">
                  <p className="text-caption text-charcoal leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
              </motion.div>
            )}

            {/* Tags */}
            {tags?.length > 0 && (
              <motion.div custom={7} initial="hidden" animate="visible" variants={sectionVariants}
                className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag, i) => (
                  <span key={i}
                    className="px-3 py-1 bg-pure-white text-smoke rounded-md text-[11px] border border-ash hover:border-charcoal hover:text-ink-black transition-colors cursor-default">
                    #{tag}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Views */}
            {views > 0 && (
              <motion.div custom={8} initial="hidden" animate="visible" variants={sectionVariants}
                className="flex items-center gap-2 text-[11px] text-smoke pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-pure-white rounded-md border border-ash">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="font-medium">{views.toLocaleString('en-IN')} views</span>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
