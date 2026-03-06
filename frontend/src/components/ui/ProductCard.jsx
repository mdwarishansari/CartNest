import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const imgUrl = product.images?.[0]?.url || 'https://placehold.co/300x300/e2e8f0/94a3b8?text=Product';
  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-square bg-gray-50">
        <img src={imgUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow-md">
            -{discount}%
          </span>
        )}
        {!product.verified && (
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg">Pending</span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-lg flex items-center gap-2">
            <Eye className="w-4 h-4" /> Quick View
          </span>
        </div>
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
          <button
            onClick={(e) => { e.preventDefault(); addItem(product._id, 1); }}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
