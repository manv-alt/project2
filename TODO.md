# TODO: Move API fetch logic from pages to Context

## Phase 1: Create New Context Files - COMPLETED

- [x] 1. Create `InventoryContext.jsx` - inventory CRUD operations
- [x] 2. Create `OrderContext.jsx` - order management (admin + user)
- [x] 3. Create `PaymentContext.jsx` - payment operations

## Phase 2: Update Pages to Use Contexts - COMPLETED

- [x] 4. Update `admin/pages/Inventory.jsx` to use InventoryContext
- [x] 5. Update `admin/pages/Order.jsx` to use OrderContext
- [x] 6. Update `pages/MyOrders.jsx` to use OrderContext
- [x] 7. Update `components/Checkout.jsx` to use PaymentContext

## Phase 3: Register Contexts in main.jsx - COMPLETED

- [x] 8. Register new contexts in `main.jsx`
// import { useEffect, useState } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { useOrder } from "@/context/OrderContext";
// import api from "@/lib/axios";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Loader2, User, MapPin, ShoppingBag, Eye, ArrowLeft } from "lucide-react";
// import { toast } from "sonner";

// const ProfileModal = ({ open, onOpenChange }) => {
//   const { user: authUser } = useAuth();
//   const { myOrders, fetchMyOrders } = useOrder();

//   const [view, setView] = useState("profile");
//   const [user, setUser] = useState(null);
//   const [addresses, setAddresses] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [orderLoading, setOrderLoading] = useState(false);

//   // =============================
//   // FETCH PROFILE + ADDRESS
//   // =============================
//   useEffect(() => {
//     if (open) {
//       fetchProfileData();
//       setView("profile");
//     }
//   }, [open]);

//   const fetchProfileData = async () => {
//     try {
//       setLoading(true);

//       const [profileRes, addressRes] = await Promise.all([
//         api.get("/profile"),
//         api.get("/addresses"),
//       ]);

//       setUser(profileRes.data.user);
//       setAddresses(addressRes.data.addresses);
//     } catch (err) {
//       toast.error("Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =============================
//   // FETCH ORDERS WHEN VIEW OPEN
//   // =============================
//   useEffect(() => {
//     if (view === "orders") {
//       fetchMyOrders();
//     }
//   }, [view]);

//   // =============================
//   // CANCEL ORDER
//   // =============================


//   // =============================
//   // PROFILE VIEW
//   // =============================
//   const renderProfileView = () => (
//     <div className="space-y-6">
//       <div className="p-4 bg-gray-50 rounded-lg">
//         <h2 className="text-lg font-bold text-black">{user?.name}</h2>
//         <p className="text-sm text-gray-500">{user?.email}</p>
//       </div>

//       <Separator />

//       {/* Addresses */}
//       <div>
//         <h3 className="font-semibold flex items-center gap-2 mb-2 text-black">
//           <MapPin className="w-4 h-4 text-green-600" />
//           Saved Addresses
//         </h3>

//         {addresses.length > 0 ? (
//           addresses.map((addr) => (
//             <div key={addr._id} className="text-sm border border-gray-200 p-2 rounded mb-2 text-black">
//               {addr.street}, {addr.city}, {addr.state}
//             </div>
//           ))
//         ) : (
//           <p className="text-sm text-gray-400">No addresses</p>
//         )}
//       </div>

//       <Separator />

//       {/* Orders */}
//       <div>
//         <div className="flex justify-between items-center">
//           <h3 className="font-semibold flex items-center gap-2 text-black">
//             <ShoppingBag className="w-4 h-4 text-green-600" />
//             My Orders
//           </h3>

//           <Button size="sm" variant="outline" onClick={() => setView("orders")}>
//             View
//           </Button>
//         </div>

//         <p className="text-sm text-gray-400 mt-1">
//           {myOrders?.length || 0} orders placed
//         </p>
//       </div>
//     </div>
//   );

//   // =============================
//   // ORDERS VIEW
//   // =============================
//   const renderOrdersView = () => (
//     <div className="space-y-4">
//       <div className="flex items-center gap-2">
//         <Button variant="ghost" size="sm" onClick={() => setView("profile")}>
//           <ArrowLeft className="w-4 h-4" />
//         </Button>
//         <h2 className="font-semibold text-black">My Orders</h2>
//       </div>

//       {myOrders?.length > 0 ? (
//         myOrders.map((order) => (
//           <div key={order._id} className="border border-gray-200 p-3 rounded">
//             <div className="flex justify-between mb-2">
//               <span className="text-xs text-gray-500">
//                 {new Date(order.createdAt).toLocaleDateString()}
//               </span>

//               <Badge
//                 className={
//                   order.status === "cancelled"
//                     ? "bg-red-100 text-red-700"
//                     : order.status === "paid"
//                     ? "bg-green-100 text-green-700"
//                     : "bg-yellow-100 text-yellow-700"
//                 }
//               >
//                 {order.status}
//               </Badge>
//             </div>

//             <div className="flex justify-between">
//               <span className="font-medium text-black">₹{order.totalPrice}</span>

//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={() => setSelectedOrder(order)}
//               >
//                 <Eye className="w-4 h-4 mr-1" />
//                 View
//               </Button>
//             </div>
//           </div>
//         ))
//       ) : (
//         <p className="text-sm text-gray-400">No orders yet</p>
//       )}
//     </div>
//   );

//   if (loading) {
//     return (
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="bg-white">
//           <div className="flex justify-center py-6">
//             <Loader2 className="w-6 h-6 animate-spin text-green-600" />
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   return (
//     <>
//       {/* MAIN PROFILE MODAL */}
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="sm:max-w-md bg-white">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-black">
//               <User className="w-5 h-5 text-green-600" />
//               My Profile
//             </DialogTitle>
//           </DialogHeader>

//           {view === "profile" && renderProfileView()}
//           {view === "orders" && renderOrdersView()}
//         </DialogContent>
//       </Dialog>

//       {/* ORDER DETAILS MODAL */}
//       <Dialog
//         open={!!selectedOrder}
//         onOpenChange={() => setSelectedOrder(null)}
//       >
//         <DialogContent className="sm:max-w-md bg-white">
//           <DialogHeader>
//             <DialogTitle className="text-black">Order Details</DialogTitle>
//           </DialogHeader>

//           {selectedOrder && (
//             <div className="space-y-4">
//               <div className="flex justify-between text-black">
//                 <span>Status</span>
//                 <Badge>{selectedOrder.status}</Badge>
//               </div>

//               <Separator />

//               {selectedOrder.orderItems?.map((item) => (
//                 <div
//                   key={item._id}
//                   className="flex justify-between text-sm"
//                 >
//                   <span>{item.product?.name}</span>
//                   <span>
//                     {item.quantity} × ₹{item.price}
//                   </span>
//                 </div>
//               ))}

//               <Separator />

//               <div className="flex justify-between font-semibold">
//                 <span>Total</span>
//                 <span>₹{selectedOrder.totalPrice}</span>
//               </div>

//               {selectedOrder.status === "pending" && (
//                 <Button
//                   variant="destructive"
//                   className="w-full"
//                   onClick={() => cancelOrder(selectedOrder._id)}
//                   disabled={orderLoading}
//                 >
//                   {orderLoading ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     "Cancel Order"
//                   )}
//                 </Button>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default ProfileModal;

