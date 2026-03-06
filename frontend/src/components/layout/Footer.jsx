import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  const links = [
    {
      title: 'SHOP',
      items: [
        { label: 'Home', to: '/' },
        { label: 'Browse Products', to: '/search' },
        { label: 'Cart', to: '/cart' },
        { label: 'My Orders', to: '/orders' },
      ],
    },
    {
      title: 'SELLERS',
      items: [
        { label: 'Become a Seller', to: '/seller/signup' },
        { label: 'Seller Dashboard', to: '/seller/dashboard' },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { label: 'Contact Us', to: '/contact' },
        { label: 'Login', to: '/auth/login' },
        { label: 'Sign Up', to: '/auth/signup' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">CN</div>
              <span className="text-lg font-extrabold text-white">CartNest</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              A lightweight multi-vendor marketplace for small sellers. Buy and sell with confidence.
            </p>
          </div>

          {/* Link columns */}
          {links.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-white mb-4 tracking-wider">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">© {year} CartNest. All rights reserved.</p>
          <p className="text-sm text-gray-500">Built with React, Express, MongoDB & <span className="text-red-400">♥</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
