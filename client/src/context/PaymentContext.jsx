import api from "@/lib/axios";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

const PaymentContext = createContext(null);

export const PaymentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  /**
   * STRIPE CHECKOUT SESSION:
   * 
   * New Architecture (NO pre-order):
   * 1. Send request to backend (no orderId needed)
   * 2. Backend reads cart from database
   * 3. Backend validates stock
   * 4. Backend creates Stripe session with userId in metadata
   * 5. Backend returns checkout URL
   * 6. User redirected to Stripe
   * 7. Order created in webhook AFTER successful payment
   */
  const createCheckoutSession = async () => {
    try {
      setLoading(true);
      
      // No orderId needed - backend reads cart directly
      const { data: { url } } = await api.post("/checkout", {});
      
      // Redirect to Stripe checkout
      window.location.href = url;
      return true;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Failed to initiate payment");
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
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext);

