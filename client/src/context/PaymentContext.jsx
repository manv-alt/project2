import api from "@/lib/axios";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

const PaymentContext = createContext(null);

export const PaymentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  // Create checkout session for Stripe payment
  const createCheckoutSession = async (orderId) => {
    try {
      setLoading(true);
      const { data: { url } } = await api.post("/payment/create-checkout-session", { orderId });
      window.location.href = url;
      return true;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Process payment
  const processPayment = async (orderId, paymentMethod) => {
    try {
      setLoading(true);
      
      // Create order first
      const { data: order } = await api.post("/orders/create");
      
      if (paymentMethod === 'stripe') {
        // Redirect to Stripe checkout
        await createCheckoutSession(order._id);
      } else {
        // COD - just return the order
        toast.success("Order placed successfully!");
        return order;
      }
    } catch (error) {
      console.error("Payment error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        loading,
        createCheckoutSession,
        processPayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext);
