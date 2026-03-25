import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, isSeller, isAdmin, isVerifier } = useAuth();
  const navigate = useNavigate();
  const showCartButton = !isSeller && !isAdmin && !isVerifier;
  const allImages = product.images?.length > 0 ? product.images : [{ url: 'https://placehold.co/300x300/e2e8f0/94a3b8?text=Product' }];
  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef(null);

  // Cycle through images on hover
  useEffect(() => {
    if (isHovering && allImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIdx((prev) => (prev + 1) % allImages.length);
      }, 800);
    } else {
      clearInterval(intervalRef.current);
      setCurrentIdx(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [isHovering, allImages.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-square bg-gray-50">
        {/* Show current image with fade */}
        <img
          src={allImages[currentIdx]?.url}
          alt={product.title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          style={{ opacity: 1 }}
          loading="lazy"
        />

        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-lg shadow-md">
            -{discount}%
          </span>
        )}
        {!product.verified && (
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg">Pending</span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-lg flex items-center gap-2">
            <Eye className="w-4 h-4" /> Quick View
          </span>
        </div>

        {/* Image dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {allImages.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIdx ? 'bg-indigo-500 w-3' : 'bg-white/80'}`} />
            ))}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        {product.sellerId?.shopName && (
          <p className="text-xs font-medium text-indigo-600 mb-1.5 truncate">{product.sellerId.shopName}</p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors leading-snug mb-3">{product.title}</h3>
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-sm text-gray-400 line-through ml-2">₹{product.mrp?.toLocaleString('en-IN')}</span>
            )}
          </div>
          {showCartButton && (
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!isAuthenticated) {
                  navigate('/auth/login');
                  return;
                }
                addToCart(product._id, 1);
              }}
              className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
              title="Add to Cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
