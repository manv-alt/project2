import { useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import Checkout from "./Checkout";

const Cart = ({ open, onOpenChange }) => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { cartItems, updateCart, removeFromCart, clearCart, loading } = useCart();

  const calculateTotal = (items) => {
    if (!items) return 0;
    return items.reduce((t, i) => t + i.productId.price * i.quantity, 0);
  };

  const getProductImage = (img) => {
    if (!img) return "/image.png";
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  const total = calculateTotal(cartItems);

  const handleCheckoutSuccess = () => {
    clearCart();
    setCheckoutOpen(false);
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-2xl p-0 overflow-hidden flex flex-col h-[85vh]">
          <DialogHeader className="p-6 border-b bg-gray-50/50">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <div className="bg-green-100 p-2 rounded-full">
                <ShoppingBag className="w-5 h-5 text-green-600" />
              </div>
              My Cart
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {cartItems?.length || 0} items
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="text-gray-500 text-sm">Loading your cart...</p>
              </div>
            ) : !cartItems || cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="bg-gray-50 p-6 rounded-full">
                  <ShoppingBag className="w-12 h-12 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm mt-1">Looks like you haven't added anything yet.</p>
                </div>
                <button onClick={() => onOpenChange(false)} className="text-green-600 font-medium hover:underline">
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 hover:border-green-100 hover:shadow-sm transition-all duration-200 group">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={getProductImage(item.productId.img)}
                      alt={item.productId.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.productId.name}</h3>
                        <p className="text-sm text-gray-500">₹{item.productId.price}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId._id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-lg bg-gray-50">
                        <button
                          onClick={() => updateCart(item.productId._id, item.quantity - 1)}
                          className="p-1.5 hover:bg-white hover:text-green-600 rounded-l-lg transition-colors disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateCart(item.productId._id, item.quantity + 1)}
                          className="p-1.5 hover:bg-white hover:text-green-600 rounded-r-lg transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-gray-900">₹{item.productId.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems && cartItems.length > 0 && (
            <div className="p-6 bg-white border-t space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-900">Total</span>
                  <span className="font-bold text-xl text-green-600">₹{total}</span>
                </div>
              </div>
              <button
                onClick={() => setCheckoutOpen(true)}
                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                disabled={!cartItems || cartItems.length === 0}
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Checkout
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        cartItems={cartItems}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  )
}

export default Cart;
