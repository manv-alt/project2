import api from "@/lib/axios";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/cart");
      setCartItems(data.items);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await api.post("/cart", { productId, quantity });
      setCartItems(data.items);
    } catch (error) {
      console.log(error);
    }
  };

  const updateCart = async (productId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      setCartItems(data.items);
    } catch (error) {
      console.log(error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      setCartItems(data.items);
    } catch (error) {
      console.log(error);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart/clear");
      setCartItems([]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        fetchCart,
        addToCart,
        updateCart,
        clearCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
