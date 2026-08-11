import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/axios";
import { useAuth } from "./authContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const items = Array.isArray(cart?.items) ? cart.items : [];
  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCart(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/buyer/cart/items");
      setCart(res.data?.data || null);
    } catch (err) {
      console.error(err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, { size, quantity = 1 } = {}) => {
    const res = await api.post(`/buyer/${productId}`, { quantity, size });
    setCart(res.data?.data || null);
    return res.data;
  }, []);

  const updateQuantity = useCallback(async (productId, { size, quantity }) => {
    const res = await api.put(`/buyer/${productId}`, { quantity, size });
    setCart(res.data?.data || null);
    return res.data;
  }, []);

  const removeItem = useCallback(async (productId, { size } = {}) => {
    const res = await api.delete(`/buyer/${productId}`, { data: { size } });
    setCart(res.data?.data || null);
    return res.data;
  }, []);

  const clearCart = useCallback(async () => {
    const res = await api.delete(`/buyer/`);
    setCart(res.data?.data || null);
    return res.data;
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        cartCount,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
};