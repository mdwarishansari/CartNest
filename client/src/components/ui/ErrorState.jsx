import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading the data. Please try again.',
  onRetry,
  icon: Icon = AlertCircle,
  className = '',
}) => {
  const [retrying, setRetrying] = React.useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center min-h-[40vh] ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-pure-white border border-ash rounded-md p-8 shadow-sm flex flex-col items-center"
      >
        <div className="p-3 bg-red-50 text-red-500 rounded-full mb-4">
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-heading-sm font-nantes text-ink-black mb-2">{title}</h3>
        <p className="text-body text-smoke font-graphik mb-6">{message}</p>
        
        {onRetry && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-ink-black text-pure-white text-caption font-graphik font-medium rounded-md hover:bg-charcoal transition-all disabled:opacity-50 gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Try Again'}
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default ErrorState;
