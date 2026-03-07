import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Star, CheckCircle, ShoppingBag, Home } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Feedback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const orderId = searchParams.get("orderId");
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // If no order ID, show a general feedback form
  const isOrderFeedback = !!orderId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = isOrderFeedback 
        ? { orderId, rating, comment }
        : { rating, comment };

      const endpoint = isOrderFeedback ? "/order-feedback" : "/feedback";
      
      // Add user info if logged in
      if (user) {
        payload.email = user.email;
        payload.name = user.name || "Customer";
      }

      const { data } = await api.post(endpoint, payload);
      
      if (data.success) {
        setIsSubmitted(true);
        toast.success("Thank you for your feedback!");
      }
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className="focus:outline-none transition-transform hover:scale-110"
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setRating(star)}
      >
        <Star
          className={`w-10 h-10 transition-colors ${
            star <= (hoverRating || rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      </button>
    ));
  };

  const getRatingText = () => {
    const currentRating = hoverRating || rating;
    if (currentRating === 5) return "Excellent! 🌟";
    if (currentRating === 4) return "Great! 😊";
    if (currentRating === 3) return "Good 👍";
    if (currentRating === 2) return "Fair 😐";
    if (currentRating === 1) return "Poor 😞";
    return "Tap to rate";
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your feedback helps us improve our service. We appreciate your time!
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/products")}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              Continue Shopping
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {isOrderFeedback ? "Rate Your Order" : "We'd Love Your Feedback"}
            </h1>
            <p className="text-gray-600">
              {isOrderFeedback 
                ? `Order #${orderId?.slice(-6)} - Tell us about your experience`
                : "Help us improve by sharing your experience with us"}
            </p>
          </div>

          {/* Feedback Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div className="text-center">
                <label className="block text-lg font-medium text-gray-700 mb-4">
                  How would you rate your experience?
                </label>
                <div className="flex justify-center gap-2 mb-3">
                  {renderStars()}
                </div>
                <p className="text-lg font-medium text-gray-700 h-6">
                  {getRatingText()}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share your thoughts (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
                  placeholder="What did you like? What can we improve?"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Feedback
                    <Star className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Skip Button */}
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors text-sm"
              >
                Skip for now
              </button>
            </form>
          </div>

          {/* Thank You Message */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Your feedback means the world to us! 💚
          </p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;

