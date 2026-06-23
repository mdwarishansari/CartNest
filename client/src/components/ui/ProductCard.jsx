import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { calculateDiscountPercent } from '../../utils/discountCalculations';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, isSeller, isAdmin, isVerifier } = useAuth();
  const navigate = useNavigate();
  const showCartButton = !isSeller && !isAdmin && !isVerifier;
  const allImages = product.images?.length > 0 ? product.images : [{ url: 'https://placehold.co/300x300/e2e8f0/94a3b8?text=Product' }];
  const discount = calculateDiscountPercent(product.mrp, product.price);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef(null);
  const displayIdx = isHovering ? currentIdx : 0;

  // Cycle through images on hover
  useEffect(() => {
    if (!isHovering || allImages.length <= 1) {
      clearInterval(intervalRef.current);
      return undefined;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % allImages.length);
    }, 800);

    return () => clearInterval(intervalRef.current);
  }, [isHovering, allImages.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="bg-pure-white rounded-md border border-ash transition-all duration-300 overflow-hidden group relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-square bg-cream-paper border-b border-ash/40">
        <img
          src={allImages[displayIdx]?.url}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          style={{ opacity: 1 }}
          loading="lazy"
        />

        {discount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-butter-highlight text-ink-black text-[10px] font-semibold border border-ink-black/10 rounded-md">
            -{discount}%
          </span>
        )}
        {!product.verified && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-cream-paper text-smoke text-[10px] font-semibold border border-ash rounded-md">Pending</span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ink-black/0 group-hover:bg-ink-black/5 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-pure-white px-3 py-1.5 rounded-3xl text-[12px] font-graphik text-charcoal border border-ash flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-smoke" /> Quick View
          </span>
        </div>

        {/* Image dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {allImages.map((_, i) => (
              <span key={i} className={`w-1 h-1 rounded-full transition-all duration-300 ${i === displayIdx ? 'bg-ink-black w-2' : 'bg-ash'}`} />
            ))}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 font-graphik">
        {product.sellerId?.shopName && (
          <p className="text-[10px] font-normal text-smoke mb-1.5 truncate uppercase tracking-widest">{product.sellerId.shopName}</p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-caption font-normal text-charcoal line-clamp-2 hover:text-ink-black transition-colors leading-snug mb-3">{product.title}</h3>
        </Link>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-body font-normal text-ink-black">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-caption text-smoke line-through ml-2">₹{product.mrp?.toLocaleString('en-IN')}</span>
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
              className="p-2 bg-ink-black hover:bg-charcoal text-pure-white rounded-md transition-all active:scale-95"
              title="Add to Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
