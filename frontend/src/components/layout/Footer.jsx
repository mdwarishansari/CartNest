import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="CartNest" className="w-9 h-9 rounded-xl object-contain" />
              <span className="text-lg font-extrabold text-white">CartNest</span>
            </Link>
            <p className="text-sm leading-relaxed">A lightweight multi-vendor marketplace for small sellers. Shop unique products, pay securely.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/search" className="hover:text-white transition-colors">Browse Products</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/auth/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/auth/signup" className="hover:text-white transition-colors">Customer Sign Up</Link></li>
              <li><Link to="/seller/register" className="hover:text-white transition-colors">Seller Registration</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Info</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-gray-500">Secure Razorpay Payments</span></li>
              <li><span className="text-gray-500">Verified Seller Products</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} CartNest. All rights reserved.</p>
          <p className="text-xs text-gray-600">Built with ❤️ for small sellers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
