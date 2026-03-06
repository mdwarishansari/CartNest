import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Store, Eye, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
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
  const currentImage = images?.[selectedImage]?.url || 'https://placehold.co/600x600/e2e8f0/94a3b8?text=No+Image';

  const handleAdd = () => {
    if (!isAuthenticated) { toast.error('Please login to add to cart'); return; }
    addToCart(product._id, qty);
  };

  return (
    <div className="page-container">
      <Link to="/search" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
        <ArrowLeft className="w-4 h-4" />Back to products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="card overflow-hidden">
            <div className="aspect-square bg-gray-50">
              <img src={currentImage} alt={title} className="w-full h-full object-contain p-4" />
            </div>
          </div>
          {images?.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${i === selectedImage ? 'border-indigo-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src={img.url} alt={img.alt || title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          {/* Category & Verification */}
          <div className="flex items-center gap-2 flex-wrap">
            {categoryId && <span className="badge badge-info">{categoryId.name}</span>}
            <span className={`badge ${verificationState === 'verified' ? 'badge-success' : verificationState === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
              {verificationState === 'verified' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {verificationState}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>

          {/* Seller */}
          {sellerId && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Store className="w-4 h-4" />
              <span>Sold by <strong className="text-gray-700">{sellerId.shopName}</strong></span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-900">₹{price?.toLocaleString('en-IN')}</span>
            {mrp && mrp > price && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{mrp?.toLocaleString('en-IN')}</span>
                <span className="badge bg-green-100 text-green-700">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="text-sm">
            {stock > 5 ? (
              <span className="text-green-600 font-medium">✓ In Stock</span>
            ) : stock > 0 ? (
              <span className="text-amber-600 font-medium">Only {stock} left in stock</span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-gray-100 rounded-l-lg">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty(Math.min(stock, qty + 1))} className="p-2 hover:bg-gray-100 rounded-r-lg">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleAdd} className="btn btn-primary btn-lg flex-1">
                <ShoppingCart className="w-5 h-5" />Add to Cart
              </button>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>
          )}

          {/* Tags */}
          {tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          )}

          {views > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-400 pt-2">
              <Eye className="w-3.5 h-3.5" />{views} views
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
