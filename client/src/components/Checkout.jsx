import { useState } from "react";
import { CreditCard, CheckCircle, MapPin, Phone, Mail, User, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useOrder } from "@/context/OrderContext";
import { usePayment } from "@/context/PaymentContext";
import { toast } from "sonner";

const Checkout = ({open, onOpenChange, cartItems, onSuccess}) => {
const [orderPlaced, setOrderPlaced] = useState(false);
const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  paymentMethod: 'stripe'
});

const { createOrder } = useOrder();
const { createCheckoutSession, loading: paymentLoading } = usePayment();

 const calculateTotal = (items) => {
  if (!items) return 0;
  return items.reduce((t, i) => t + (i.productId?.price || 0) * i.quantity, 0);
};

  const getProductImage = (img) => {
    if (!img) return "/image.png";
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  const itemsTotal = calculateTotal(cartItems);
  const delivery = itemsTotal > 500 ? 0 : 40;
  const grandTotal = itemsTotal + delivery;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      
      // Create order using context
      const order = await createOrder();
      
      if (formData.paymentMethod === 'stripe') {
        // Use payment context for Stripe
        await createCheckoutSession(order._id);
        return;
      }
      
      // COD - show success
      setOrderPlaced(true);
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        setOrderPlaced(false);
        setFormData({ fullName: '', email: '', phone: '', address: '', paymentMethod: 'stripe' });
      }, 1500);
      
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        {orderPlaced ? (
          <div className="text-center p-6">
            <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Order Placed Successfully!</h2>
            <p className="text-gray-600 mt-2">Thank you for your purchase. Your order will be delivered soon.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>

            {/* Order Summary */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
              {cartItems && cartItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center">
                    <img src={getProductImage(item.productId?.img)} alt={item.productId?.name} className="w-12 h-12 object-cover rounded mr-3" />
                    <div>
                      <p className="font-medium">{item.productId?.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.productId?.price}</p>
                    </div>
                  </div>
                  <p className="font-semibold">₹{(item.productId?.price || 0) * item.quantity}</p>
                </div>
              ))}
              <div className="flex justify-between mt-3 pt-3 border-t">
                <span>Items Total:</span>
                <span>₹{itemsTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className={delivery === 0 ? "text-green-600 font-medium" : ""}>
                  {delivery === 0 ? "Free" : `₹${delivery}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{grandTotal}</span>
              </div>
              {delivery === 0 && <p className="text-green-600 text-sm">Free delivery on orders above ₹500!</p>}
            </div>

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Information</h3>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="address"
                  placeholder="Delivery Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Payment Method</h3>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={formData.paymentMethod === 'stripe'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="font-medium">Pay Online (Stripe)</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="h-5 w-5 mr-2 text-green-600 font-bold">₹</span>
                  <span className="font-medium">Cash on Delivery</span>
                </label>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || paymentLoading || !cartItems?.length}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading || paymentLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Place Order ₹${grandTotal}`
              )}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </div>
  )
}

export default Checkout
