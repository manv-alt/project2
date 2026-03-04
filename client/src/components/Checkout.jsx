import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useOrder } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/axios";
import { usePayment } from "@/context/PaymentContext";
 
const Checkout = ({ open, onClose, onBack }) => {
  const { cartItems, clearCart } = useCart();
  const { createOrder } = useOrder();
  const { createCheckoutSession } = usePayment();
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [loading, setLoading] = useState(false);

  // =============================
  // FETCH USER PROFILE
  // =============================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setProfile({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          address: data.user.street,
          city: data.user.city,
          postalCode: data.user.zip,
          country: data.user.country, 
      

        });
        const { data: addressData } = await api.get("/addresses");

      if (addressData.addresses.length > 0) {
        const addr = addressData.addresses[0];

        setProfile(prev => ({
          ...prev,
          address: addr.street || "",
          city: addr.city || "",
          state: addr.state || "",
          postalCode: addr.zip || "",
          country: addr.country || "",
        }));
      }
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };

    if (open) fetchProfile();
  }, [open, token]);

  // =============================
  // CALCULATE TOTAL
  // =============================
  const validItems = cartItems?.filter(item => item.productId) || [];
  
  const totalPrice = validItems.reduce(
    (acc, item) => acc + (item.productId?.price || 0) * item.quantity,
    0
  );
  const deliveryCharge = totalPrice > 500 ? 0 : 40;

const platformFee = 10;

const totalAmount = totalPrice + deliveryCharge + platformFee;

  // =============================
  // CHECK INVENTORY
  // =============================
  // Simplified check - only block if explicitly marked as outOfStock
  const hasOutOfStock = validItems.some(
    (item) => item.productId && item.productId.availabilityStatus === "outOfStock"
  );
  
  // For now, don't block orders based on stock - just allow placing order
  // The server will handle stock validation
  const canPlaceOrder = !loading && validItems.length > 0;

  // =============================
  // PLACE ORDER
  // =============================
  const handlePlaceOrder = async () => {
    if (!profile) return;

    try {
      setLoading(true);

      const orderData = {
        orderItems: validItems.map((item) => ({
          product: item.productId._id,
          qty: item.quantity,
          price: item.productId.price,
        })),
        shippingAddress: {
          address: profile.address,
          city: profile.city,
          state: profile.state || "",
          postalCode: profile.postalCode,
          country: profile.country,
        },
        paymentMethod,
        totalAmount,
        deliveryCharge,
        platformFee,
        totalPrice: totalAmount,
      };

      const order = await createOrder(orderData);

      if (paymentMethod === "stripe") {
        await createCheckoutSession(order._id);
        return;
      }

      clearCart();
      alert("Order Placed Successfully");
      onClose();
    } catch (error) {
      console.error("Order error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white text-black p-6 rounded-lg w-[500px] space-y-4 max-h-[90vh] overflow-y-auto">

        {/* ================= HEADER WITH BACK BUTTON ================= */}
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-black" />
            </button>
          )}
          <h2 className="text-xl font-bold">Checkout</h2>
        </div>

        {/* ================= SHIPPING DETAILS ================= */}
        <div className="border border-gray-200 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-black">Shipping Details</h3>

          {profile ? (
            <>
              <p className="text-black"><strong>Name:</strong> {profile.name}</p>
              <p className="text-black"><strong>Email:</strong> {profile.email}</p>
              <p className="text-black"><strong>Phone:</strong> {profile.phone}</p>
              <p className="text-black"><strong>Address:</strong> {profile.address}</p>
              <p className="text-black"><strong>City:</strong> {profile.city}</p>
              <p className="text-black"><strong>Postal Code:</strong> {profile.postalCode}</p>
              <p className="text-black"><strong>Country:</strong> {profile.country}</p>
            </>
          ) : (
            <p className="text-black">Loading profile...</p>
          )}
        </div>

        {/* ================= PAYMENT METHOD ================= */}
        <div>
          <label className="font-semibold text-black">Select Payment Method</label>
          <select
            className="w-full border border-gray-300 p-2 rounded mt-2 text-black bg-white"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="stripe">Stripe</option>
            <option value="cod">Cash on Delivery</option>
          </select>
        </div>

        {/* ================= TOTAL ================= */}
       <div className="border-t pt-3 space-y-2 text-black">

  <div className="flex justify-between">
    <span>Subtotal:</span>
    <span>₹ {totalPrice}</span>
  </div>

  <div className="flex justify-between">
    <span>Delivery Charge:</span>
    <span>
      {deliveryCharge === 0 ? "Free" : `₹ ${deliveryCharge}`}
    </span>
  </div>

  <div className="flex justify-between">
    <span>Platform Fee:</span>
    <span>₹ {platformFee}</span>
  </div>

  <div className="flex justify-between font-bold text-lg border-t pt-2">
    <span>Total:</span>
    <span>₹ {totalAmount}</span>
  </div>

</div>

        {/* ================= BUTTONS ================= */}
        <div className="space-y-2">
          <button
            onClick={handlePlaceOrder}
            disabled={!canPlaceOrder}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium disabled:bg-gray-400 hover:bg-green-700 transition-colors"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onBack || onClose}
              className="flex-1 bg-gray-200 text-black py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
