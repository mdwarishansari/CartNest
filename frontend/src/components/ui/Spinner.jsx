import { motion } from 'framer-motion';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin`}
      />
    </div>
  );
};

export const PageSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-12 h-12 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </motion.div>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-sm text-gray-400 font-medium"
    >
      Loading...
    </motion.p>
  </div>
);

export const SkeletonCard = () => (
  <div className="card p-0 overflow-hidden">
    <div className="skeleton h-52 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-3 w-16 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="flex justify-between items-center pt-1">
        <div className="skeleton h-6 w-20 rounded" />
        <div className="skeleton h-9 w-9 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 8 }) => (
  <div className="product-grid">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.05 }}
      >
        <SkeletonCard />
      </motion.div>
    ))}
  </div>
);

export const SkeletonLine = ({ width = '100%', height = '14px', className = '' }) => (
  <div className={`skeleton rounded ${className}`} style={{ width, height }} />
);

export const SkeletonBlock = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonLine key={i} width={i === lines - 1 ? '60%' : '100%'} />
    ))}
  </div>
);

export default Spinner;
