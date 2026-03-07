import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useOrder } from "@/context/OrderContext";
import { CheckCircle, ShoppingBag, Home, MessageSquare } from "lucide-react";

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchMyOrders, orders } = useOrder();
  const [loading, setLoading] = useState(true);
  const [orderFound, setOrderFound] = useState(false);
  const [latestOrderId, setLatestOrderId] = useState(null);

  useEffect(() => {
    const checkOrder = async () => {
      try {
        // Wait a moment for webhook to process the order
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Fetch user's orders to check if order was created
        await fetchMyOrders();
        
        if (orders && orders.length > 0) {
          setOrderFound(true);
          // Get the most recent order
          const sortedOrders = [...orders].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setLatestOrderId(sortedOrders[0]._id);
        }
      } catch (error) {
        console.error("Error checking order:", error);
      } finally {
        setLoading(false);
      }
    };

    checkOrder();
  }, [fetchMyOrders]);

  // Auto-redirect to feedback after 3 seconds if order found
  useEffect(() => {
    if (orderFound && latestOrderId && !loading) {
      const timer = setTimeout(() => {
        navigate(`/feedback?orderId=${latestOrderId}`);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [orderFound, latestOrderId, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful! 🎉
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>

        {orderFound && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-6">
            <p className="text-sm font-medium">✓ Order has been created successfully</p>
            {latestOrderId && (
              <p className="text-xs mt-1">Order ID: #{latestOrderId.slice(-8)}</p>
            )}
          </div>
        )}

        {/* Feedback Redirect Notice */}
        {orderFound && (
          <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-center gap-2">
            <MessageSquare size={18} />
            <p className="text-sm">Redirecting to feedback page...</p>
          </div>
        )}

        <div className="space-y-3">
          {latestOrderId ? (
            <button
              onClick={() => navigate(`/feedback?orderId=${latestOrderId}`)}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={20} />
              Rate Your Order
            </button>
          ) : (
            <button
              onClick={() => navigate("/my-orders")}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              View My Orders
            </button>
          )}
          
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;

