import { useEffect, useState } from "react";
import { PackageCheck, Loader2, Eye } from "lucide-react";
import { useOrder } from "@/context/OrderContext";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusOptions = ["pending", "paid", "shipped", "delivered", "cancelled"];

const Orders = () => {
  const { orders, loading, fetchAllOrders, updateOrderStatus } = useOrder();
  const [filter, setFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) => o.status === filter);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
              {s.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* ORDERS */}
      {filteredOrders.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No orders found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl p-4 shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">
                  #{order._id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-sm text-gray-600">
                  {order.user?.name} • {order.user?.email}
                </p>
                <p className="font-medium">
                  ₹{order.totalPrice}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="text-blue-600"
                >
                  <Eye size={18} />
                </button>

                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    statusColors[order.status]
                  }`}
                >
                  {order.status.toUpperCase()}
                </span>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateOrderStatus(order._id, e.target.value)
                  }
                  className="border px-2 py-1 rounded text-sm"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[500px] max-h-[80vh] overflow-y-auto">
            <h2 className="font-semibold mb-4">Order Details</h2>

            <p><strong>User:</strong> {selectedOrder.user?.name}</p>
            <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
            <p><strong>Total:</strong> ₹{selectedOrder.totalPrice}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Items</h3>
              {selectedOrder.orderItems.map((item, i) => (
                <div key={i} className="flex justify-between border-b py-2">
                  <div>
                    {item.product?.name}
                    <p className="text-sm text-gray-500">
                      {item.qty} × ₹{item.price}
                    </p>
                  </div>
                  <span>
                    ₹{item.qty * item.price}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 w-full border py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;