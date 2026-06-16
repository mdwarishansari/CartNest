import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, User, LogOut, ChevronDown, Shield, Store, ClipboardCheck, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { auth } from '../../config/firebase';
import toast from 'react-hot-toast';
import { categoryService } from '../../services';

const Navbar = () => {
  const { user, isAdmin, isSeller, isVerifier } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const [navCategories, setNavCategories] = useState([]);

  useEffect(() => {
    categoryService.getAll()
      .then((res) => setNavCategories(res.data.categories || []))
      .catch((err) => console.error('Failed to load navbar categories:', err));
  }, []);

  const isSearchPage = location.pathname === '/search';

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
      setQ('');
      setMobileSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
    setProfileOpen(false);
  };

  return (
    <header className="w-full flex flex-col z-50 bg-pure-white">
      <nav className="sticky top-0 bg-pure-white border-b border-ash">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left side: Logo / Mobile Search */}
            {mobileSearchOpen ? (
              <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 md:hidden">
                <button type="button" onClick={() => setMobileSearchOpen(false)} className="p-1 text-charcoal">
                  <X className="w-5 h-5" />
                </button>
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 text-caption font-graphik text-charcoal border border-ash rounded-3xl bg-pure-white outline-none focus:border-charcoal transition-all"
                />
              </form>
            ) : (
              <Link to="/" className="flex items-center gap-3 shrink-0">
                <img src="/logo.png" alt="CartNest" className="h-12 w-auto object-contain" />
                <span className="text-[20px] font-nantes font-normal tracking-[0.1em] text-ink-black uppercase hidden sm:block">CartNest</span>
              </Link>
            )}
            {/* Search — Desktop (hidden on search page or when mobile search is active) */}
            {!isSearchPage && !mobileSearchOpen && (
              <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-11 pr-4 py-2.5 text-caption font-graphik text-charcoal border border-ash rounded-3xl bg-pure-white outline-none focus:border-charcoal transition-all"
                  />
                </div>
              </form>
            )}

            {/* Right side actions */}
            {!mobileSearchOpen && (
              <div className="flex items-center gap-2">
                {/* Sell on CartNest link */}
                {(!user || (user.role === 'customer' && !user.isSeller)) && (
                  <Link to="/seller/register" className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-caption font-graphik text-charcoal hover:text-ink-black transition-colors">
                    <Store className="w-4 h-4" /> Sell on CartNest
                  </Link>
                )}

                {/* Mobile Search Icon Toggle */}
                {!isSearchPage && (
                  <button onClick={() => setMobileSearchOpen(true)} className="md:hidden p-2 rounded-md hover:bg-cream-paper transition-colors">
                    <Search className="w-5 h-5 text-charcoal" />
                  </button>
                )}

                {/* Cart Icon */}
                <Link to="/cart" className="relative p-2 rounded-md hover:bg-cream-paper transition-colors">
                  <ShoppingCart className="w-5 h-5 text-charcoal" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-4 h-4 bg-ink-black text-pure-white text-[9px] font-bold rounded-full flex items-center justify-center"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </Link>

                {/* Profile dropdown or Login/Signup */}
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-cream-paper transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-ink-black flex items-center justify-center text-pure-white text-xs font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-charcoal" />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 mt-2 w-72 bg-pure-white rounded-md border border-ash py-3.5 z-50 shadow-md"
                          >
                            <div className="px-5 py-4 border-b border-ash">
                              <p className="text-caption font-semibold text-ink-black truncate">{user.name}</p>
                              <p className="text-[12px] text-smoke truncate">{user.email}</p>
                              <span className="inline-block mt-1 px-2.5 py-0.5 text-[9px] font-semibold uppercase rounded-3xl bg-cream-paper text-charcoal border border-ash">
                                {user.role}
                              </span>
                            </div>
                            <div className="py-1">
                              {(user.role === 'customer' || user.role === 'seller' || isAdmin) && (
                                <>
                                  <Link to="/account" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-caption font-graphik text-charcoal hover:bg-cream-paper transition-colors">
                                    <User className="w-4 h-4 text-smoke" /> My Account
                                  </Link>
                                  <Link to="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-caption font-graphik text-charcoal hover:bg-cream-paper transition-colors">
                                    <ShoppingBag className="w-4 h-4 text-smoke" /> My Orders
                                  </Link>
                                </>
                              )}

                              {(isSeller || isAdmin) && (
                                <Link to="/seller/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-caption font-graphik text-ink-black hover:bg-cream-paper transition-colors font-medium">
                                  <Store className="w-4 h-4 text-ink-black" /> Seller Dashboard
                                </Link>
                              )}

                              {(isVerifier || isAdmin) && (
                                <Link to="/verifier" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-caption font-graphik text-ink-black hover:bg-cream-paper transition-colors font-medium">
                                  <ClipboardCheck className="w-4 h-4 text-ink-black" /> Verifier Panel
                                </Link>
                              )}

                              {isAdmin && (
                                <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-caption font-graphik text-ink-black hover:bg-cream-paper transition-colors font-medium">
                                  <Shield className="w-4 h-4 text-ink-black" /> Admin Panel
                                </Link>
                              )}
                            </div>
                            <div className="border-t border-ash pt-1">
                              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-caption font-graphik text-smoke hover:bg-cream-paper transition-colors">
                                <LogOut className="w-4 h-4" /> Sign Out
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-4">
                    <Link to="/auth/login" className="text-caption font-graphik text-charcoal hover:text-ink-black transition-colors">Login</Link>
                    <Link to="/auth/signup" className="px-6 py-2.5 bg-ink-black text-pure-white text-caption font-graphik rounded-md hover:bg-charcoal transition-all">Sign Up</Link>
                  </div>
                )}

                {/* Mobile hamburger menu */}
                <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-md hover:bg-cream-paper transition-colors">
                  {open ? <X className="w-5 h-5 text-charcoal" /> : <Menu className="w-5 h-5 text-charcoal" />}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Mobile menu expanded */}
        <AnimatePresence>
          {open && !mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-ash bg-pure-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                {!isSearchPage && (
                  <form onSubmit={handleSearch}>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-4 py-2 text-caption font-graphik text-charcoal border border-ash rounded-3xl bg-cream-paper outline-none focus:bg-pure-white focus:border-charcoal transition-all"
                    />
                  </form>
                )}
                {(!user || (user.role === 'customer' && !user.isSeller)) && (
                  <Link to="/seller/register" onClick={() => setOpen(false)} className="block text-center py-2 text-caption font-graphik text-charcoal hover:underline">
                    Sell on CartNest →
                  </Link>
                )}
                {!user ? (
                  <div className="flex gap-2 pt-2">
                    <Link to="/auth/login" onClick={() => setOpen(false)} className="flex-1 text-center py-2 border border-ash rounded-md text-caption font-graphik text-charcoal hover:bg-cream-paper">Login</Link>
                    <Link to="/auth/signup" onClick={() => setOpen(false)} className="flex-1 text-center py-2 bg-ink-black text-pure-white rounded-md text-caption font-graphik">Sign Up</Link>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-ash/40">
                    <div className="px-2 py-1 text-xs text-smoke font-semibold uppercase tracking-wider">
                      Signed in as {user.name}
                    </div>
                    {(user.role === 'customer' || user.role === 'seller' || isAdmin) && (
                      <>
                        <Link to="/account" onClick={() => setOpen(false)} className="block py-2 px-2 text-caption font-graphik text-charcoal hover:bg-cream-paper rounded-md transition-colors">
                          My Account
                        </Link>
                        <Link to="/orders" onClick={() => setOpen(false)} className="block py-2 px-2 text-caption font-graphik text-charcoal hover:bg-cream-paper rounded-md transition-colors">
                          My Orders
                        </Link>
                      </>
                    )}
                    {(isSeller || isAdmin) && (
                      <Link to="/seller/dashboard" onClick={() => setOpen(false)} className="block py-2 px-2 text-caption font-semibold text-ink-black hover:bg-cream-paper rounded-md transition-colors">
                        Seller Dashboard
                      </Link>
                    )}
                    {(isVerifier || isAdmin) && (
                      <Link to="/verifier" onClick={() => setOpen(false)} className="block py-2 px-2 text-caption font-semibold text-ink-black hover:bg-cream-paper rounded-md transition-colors">
                        Verifier Panel
                      </Link>
                    )}
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setOpen(false)} className="block py-2 px-2 text-caption font-semibold text-ink-black hover:bg-cream-paper rounded-md transition-colors">
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { handleLogout(); setOpen(false); }} className="w-full text-left py-2 px-2 text-caption font-graphik text-smoke hover:bg-cream-paper rounded-md transition-colors">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Category Links Sub-bar (Desktop only) */}
      <div className="hidden md:block bg-pure-white border-b border-ash/40 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 text-caption font-graphik text-charcoal overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
            {navCategories.map((cat) => (
              <Link
                key={cat._id}
                to={`/search?category=${encodeURIComponent(cat.slug)}`}
                className="hover:text-ink-black transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
