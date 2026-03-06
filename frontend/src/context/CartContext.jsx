import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await cartService.get();
      setCart(res.data.cart);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, qty = 1) => {
    try {
      const res = await cartService.add(productId, qty);
      setCart(res.data.cart);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart');
    }
  };

  const updateQty = async (productId, qty) => {
    try {
      const res = await cartService.update(productId, qty);
      setCart(res.data.cart);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await cartService.remove(productId);
      setCart(res.data.cart);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error(err.message || 'Failed to remove');
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clear();
      setCart(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.qty, 0) || 0;
  const cartTotal = cart?.items?.reduce((sum, item) => {
    const price = item.productId?.price || item.priceAtAdd || 0;
    return sum + price * item.qty;
  }, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, cartCount, cartTotal, addToCart, updateQty, removeItem, clearCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
