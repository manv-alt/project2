import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "@/context/OrderContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";

const MyOrders = () => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { myOrders, loading, fetchMyOrders } = useOrder();

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "paid":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "stripe":
        return "Online Payment";
      case "cod":
        return "Cash on Delivery";
      default:
        return method;
    }
  };

  const getProductImage = (img) => {
    if (!img) return "/image.png";
    if (img.startsWith('http')) return img;
return `https://project2-0tm8.onrender.com${img}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-gray-900"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage your orders</p>
        </div>

        {myOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
              <Button
                onClick={() => navigate("/")}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-mono font-semibold text-gray-900">{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img
                          src={getProductImage(item.productId?.img)}
                          alt={item.productId?.name}
                          className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productId?.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">
                        Payment: <span className="font-medium text-gray-900">{getPaymentMethodLabel(order.paymentMethod)}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-xl font-bold text-green-600">₹{order.totalAmount}</p>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                    >
                      {selectedOrder === order._id ? "Hide Details" : "View Details"}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {selectedOrder === order._id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3">Order Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Order Status</p>
                          <p className="font-medium capitalize">{order.status}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Payment Method</p>
                          <p className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Items</p>
                          <p className="font-medium">{order.items?.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Order Total</p>
                          <p className="font-medium">₹{order.totalAmount}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
