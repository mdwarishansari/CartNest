import { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from '../config/firebase';
import { authService } from '../services';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — check for existing session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get ID token and create backend session
          const idToken = await firebaseUser.getIdToken();
          const res = await authService.createSession(idToken);
          const { token, user: appUser } = res.data;

          localStorage.setItem('token', token);
          setUser(appUser);
        } catch (err) {
          console.error('Session creation failed:', err);
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

  // Refresh user data from backend
  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  // Logout
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
    isSeller: user?.role === 'seller' || user?.isSeller,
    isVerifier: user?.role === 'verifier',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
