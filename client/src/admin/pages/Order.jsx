import { useState, useEffect } from "react";
import { PackageCheck, Loader2, Eye } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { toast } from "sonner";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusOptions = ["pending", "paid", "shipped", "delivered", "cancelled"];

const Orders = () => {
  const [filter, setFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { orders, loading, fetchAllOrders, updateOrderStatus } = useOrder();

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) => o.status === filter);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-[#f7f5f3] min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#f7f5f3] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <PackageCheck /> Order Management
        </h1>

        <select
          className="border px-3 py-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Orders</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* ORDER CARDS */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No orders found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl p-4 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* LEFT */}
              <div>
                <h3 className="font-semibold text-lg">#{order._id.slice(-8).toUpperCase()}</h3>
                <p className="text-sm text-gray-600">
                  {order.user?.name || "Guest"} • {order.user?.email || "No email"} • {order.items?.length || 0} items
                </p>
                <p className="text-sm font-medium">
                  ₹{order.totalAmount} • {order.status}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="text-blue-600 hover:text-blue-800 p-2"
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
                >
                  {order.status?.toUpperCase() || "PENDING"}
                </span>

                <select
                  value={order.status || "pending"}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className="border px-2 py-1 rounded text-sm"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">
                  Order Details
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-medium">#{selectedOrder._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-medium">{selectedOrder.user?.name || "Guest"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{selectedOrder.user?.email || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[selectedOrder.status]}`}>
                    {selectedOrder.status?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="font-semibold text-lg">₹{selectedOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Items</h3>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.productId?.name || "Product"}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <span className="font-medium">₹{item.quantity * item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
