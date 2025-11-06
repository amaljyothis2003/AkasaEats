import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching cart...');
      const response = await cartService.getCart();
      console.log('Cart response:', response);
      const cartData = response.data.data || response.data;
      console.log('Cart data:', cartData);
      setCart(cartData);
    } catch (err) {
      console.error('Error fetching cart:', err);
      console.error('Error response:', err.response?.data);
      if (err.response?.status === 404) {
        // Cart doesn't exist yet
        console.log('Cart not found, initializing empty cart');
        setCart({ items: [], totalItems: 0, totalPrice: 0 });
      } else {
        const errorMsg = err.response?.data?.message || 'Failed to fetch cart';
        setError(errorMsg);
        console.error('Cart error:', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (itemId, quantity = 1) => {
    try {
      setError(null);
      console.log('Adding to cart:', { itemId, quantity });
      const response = await cartService.addToCart(itemId, quantity);
      console.log('Add to cart response:', response);
      await fetchCart(); // Refresh cart
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setError(null);
      const response = await cartService.updateQuantity(itemId, quantity);
      await fetchCart(); // Refresh cart
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update quantity';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const removeItem = async (itemId) => {
    try {
      setError(null);
      await cartService.removeItem(itemId);
      await fetchCart(); // Refresh cart
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      await cartService.clearCart();
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const validateCart = async () => {
    try {
      setError(null);
      const response = await cartService.validateCart();
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Cart validation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const getCartItemCount = () => {
    return cart?.totalItems || 0;
  };

  const getCartTotal = () => {
    return cart?.totalPrice || 0;
  };

  const value = {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    validateCart,
    getCartItemCount,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
