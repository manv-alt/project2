import api from "@/lib/axios";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all orders (Admin)
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      // Don't manually set headers - axios interceptor handles token
      const { data } = await api.get("/all");
      setOrders(data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's orders
  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      // Don't manually set headers - axios interceptor handles token
      const { data } = await api.get("/myorders");
      setMyOrders(data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Update order status (Admin)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Don't manually set headers - axios interceptor handles token
      const { data } = await api.put(`/updatestatus/${orderId}`, { status: newStatus });
      setOrders(orders.map((o) => (o._id === orderId ? data : o)));
      toast.success(`Order status updated to ${newStatus}`);
      return true;
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update order status");
      return false;
    }
  };

  // Create new order
  const createOrder = async (orderData) => {
    try {
      // Don't manually set headers - axios interceptor handles token
      const { data: order } = await api.post("/create", orderData);
      toast.success("Order created successfully");
      return order;
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("Failed to create order");
      throw error;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        myOrders,
        loading,
        fetchAllOrders,
        fetchMyOrders,
        updateOrderStatus,
        createOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
