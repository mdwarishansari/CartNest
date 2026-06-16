import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-ink-black text-ash border-t border-ash/20 mt-auto font-graphik">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="CartNest" className="w-8 h-8 rounded-md object-contain" />
              <span className="text-lg font-normal tracking-[0.25em] text-pure-white uppercase">CartNest</span>
            </Link>
            <p className="text-caption leading-relaxed text-smoke">A lightweight multi-vendor marketplace for small sellers. Shop unique products, pay securely.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-caption font-semibold text-pure-white tracking-widest uppercase mb-4">Shop</h4>
            <ul className="space-y-2.5 text-caption">
              <li><Link to="/search" className="text-smoke hover:text-pure-white hover:underline transition-all">Browse Products</Link></li>
              <li><Link to="/contact" className="text-smoke hover:text-pure-white hover:underline transition-all">Contact Us</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-caption font-semibold text-pure-white tracking-widest uppercase mb-4">Account</h4>
            <ul className="space-y-2.5 text-caption">
              <li><Link to="/auth/login" className="text-smoke hover:text-pure-white hover:underline transition-all">Login</Link></li>
              <li><Link to="/auth/signup" className="text-smoke hover:text-pure-white hover:underline transition-all">Customer Sign Up</Link></li>
              <li><Link to="/seller/register" className="text-smoke hover:text-pure-white hover:underline transition-all">Seller Registration</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-caption font-semibold text-pure-white tracking-widest uppercase mb-4">Info</h4>
            <ul className="space-y-2.5 text-caption">
              <li><span className="text-smoke">Secure Razorpay Payments</span></li>
              <li><span className="text-smoke">Verified Seller Products</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ash/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-smoke">
          <p>© {new Date().getFullYear()} CartNest. All rights reserved.</p>
          <p>Built with care for small sellers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
