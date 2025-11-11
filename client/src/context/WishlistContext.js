import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist({ items: [] });
      return;
    }
    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      setWishlist(response.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const addToWishlist = async (productId) => {
    if (!user) {
      return { success: false, error: 'Please login to add items to wishlist' };
    }
    try {
      await api.post('/wishlist', { productId });
      await fetchWishlist();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to add to wishlist' 
      };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    try {
      await api.delete(`/wishlist/${productId}`);
      await fetchWishlist();
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.items.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      addToWishlist,
      removeFromWishlist,
      fetchWishlist,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

