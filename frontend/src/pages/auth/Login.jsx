import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
} from '../../config/firebase';
import { sendEmailVerification } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVerificationNeeded(false);
    try {
      const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);

      // If email is not verified, show message and sign out
      if (!fbUser.emailVerified) {
        setVerificationNeeded(true);
        await auth.signOut();
        setLoading(false);
        return;
      }

      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again later.'
        : err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(fbUser);
      await auth.signOut();
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      toast.error('Failed to resend. Try again later.');
    } finally {
      setResending(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Logged in with Google!');
      navigate('/');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') toast.error(err.message);
    }
  };

  return (
    <div className="bg-cream-paper min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 font-graphik">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
            <img src="/logo.png" alt="CartNest" className="w-12 h-12 object-contain mx-auto mb-4" />
          </motion.div>
          <h1 className="text-heading font-nantes text-ink-black mb-1">Welcome Back</h1>
          <p className="text-caption text-smoke">Sign in to your CartNest account</p>
        </div>

        {/* Email verification warning */}
        {verificationNeeded && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-[#fbf7f4] border border-[#ebdcd0] rounded-md text-[#8c6d58]">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="text-caption font-semibold">Email not verified</p>
                <p className="text-xs mt-1">Please check your inbox and click the verification link before logging in.</p>
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="mt-2 text-xs font-semibold underline underline-offset-2 hover:text-ink-black"
                >
                  {resending ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Card */}
        <div className="bg-pure-white rounded-md border border-ash p-7 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-caption font-semibold text-charcoal mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 text-caption border border-ash rounded-md bg-pure-white focus:border-ink-black outline-none transition-all font-graphik text-charcoal placeholder:text-smoke"
                  placeholder="you@example.com" required autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-caption font-semibold text-charcoal mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke" />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2 text-caption border border-ash rounded-md bg-pure-white focus:border-ink-black outline-none transition-all font-graphik text-charcoal placeholder:text-smoke"
                  placeholder="Enter your password" required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-smoke hover:text-charcoal transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 px-6 bg-ink-black text-pure-white font-semibold rounded-md hover:bg-charcoal transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-caption cursor-pointer">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-pure-white/30 border-t-pure-white rounded-full animate-spin" />Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-ash" /></div>
            <div className="relative flex justify-center"><span className="bg-pure-white px-4 text-caption text-smoke">or continue with</span></div>
          </div>

          {/* Google */}
          <button onClick={handleGoogle}
            className="w-full py-2.5 px-6 bg-pure-white border border-ash rounded-md text-caption font-semibold text-charcoal hover:bg-cream-paper/20 hover:border-charcoal transition-all flex items-center justify-center gap-3 cursor-pointer">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Footer */}
          <div className="mt-7 space-y-2 text-center text-caption">
            <p className="text-smoke">
              Don&apos;t have an account?{' '}
              <Link to="/auth/signup" className="text-charcoal font-semibold hover:text-ink-black hover:underline">Create Account</Link>
            </p>
            <p className="text-xs text-smoke">
              Seller? <Link to="/seller/register" className="text-smoke font-semibold hover:text-ink-black hover:underline">Register as Seller</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
