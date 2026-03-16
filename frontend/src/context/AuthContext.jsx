import { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from '../config/firebase';
import { authService, sellerService } from '../services';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await authService.createSession(idToken);
          const { token, user: appUser } = res.data;

          localStorage.setItem('token', token);
          let currentUser = appUser;

          // Check for pending seller registration (saved from seller signup page)
          const pendingSeller = localStorage.getItem('pendingSellerRegistration');
          if (pendingSeller && currentUser.role === 'customer' && !currentUser.isSeller) {
            try {
              const sellerData = JSON.parse(pendingSeller);
              // Pass logo, shopName, description to register endpoint
              await sellerService.register({
                shopName: sellerData.shopName,
                description: sellerData.description,
                logo: sellerData.logo || undefined,
              });
              localStorage.removeItem('pendingSellerRegistration');

              // Refresh JWT token to get updated role
              const refreshRes = await authService.refreshToken();
              const { token: newToken, user: updatedUser } = refreshRes.data;
              localStorage.setItem('token', newToken);
              currentUser = updatedUser;
            } catch (sellerErr) {
              console.error('Auto seller registration failed:', sellerErr);
              // If it failed because user already registered, clear pending data
              if (sellerErr.status === 409) {
                localStorage.removeItem('pendingSellerRegistration');
              }
            }
          }

          setUser(currentUser);
        } catch (err) {
          console.error('Session creation failed:', err);
          // If email not verified, sign out from Firebase
          if (err.status === 403) {
            await firebaseSignOut(auth);
          }
          setUser(null);
          localStorage.removeItem('token');
        }
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    try {
      // Refresh both token and user data
      const refreshRes = await authService.refreshToken();
      const { token, user: updatedUser } = refreshRes.data;
      localStorage.setItem('token', token);
      setUser(updatedUser);
    } catch {
      // Fallback to getMe if refreshToken fails
      try {
        const res = await authService.getMe();
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const value = {
    user,
    loading,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    isVerifier: user?.role === 'verifier',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
