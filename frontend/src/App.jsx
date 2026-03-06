import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Account from './pages/Account';
import Contact from './pages/Contact';
import SellerSignup from './pages/seller/SellerSignup';
import SellerDashboard from './pages/seller/SellerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import VerifierDashboard from './pages/verifier/VerifierDashboard';

// Layout with Navbar + Footer
const Layout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Layout WITHOUT footer (for admin panel which has its own full-height sidebar)
const LayoutNoFooter = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/search" element={<Search />} />
              <Route path="/category/:slug" element={<Search />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/contact" element={<Contact />} />

              {/* Protected — Any authenticated user */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

              {/* Seller */}
              <Route path="/seller/signup" element={<ProtectedRoute><SellerSignup /></ProtectedRoute>} />
              <Route path="/seller/dashboard" element={<ProtectedRoute roles={['seller', 'admin']}><SellerDashboard /></ProtectedRoute>} />

              {/* Verifier */}
              <Route path="/verifier" element={<ProtectedRoute roles={['verifier', 'admin']}><VerifierDashboard /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center py-20">
                  <h1 className="text-6xl font-black gradient-text mb-4">404</h1>
                  <p className="text-gray-500 text-lg">Page not found</p>
                </div>
              } />
            </Route>

            {/* Admin — separate layout without footer for full-height sidebar */}
            <Route element={<LayoutNoFooter />}>
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            </Route>
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '14px' },
              duration: 3000,
            }}
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
