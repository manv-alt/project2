import asyncHandler from "../Middleware/Asynhandler.js";
import CartModel from "../Models/Cartmodal.js";
import OrderModel from "../Models/Order.js";
import Inventorymodel from "../Models/Inventory.js";
import { reduceStockService } from "./Inventory.js";
import { createNotification } from "./Admin.js";

/**
 * COD ORDER FLOW:
 * 1. Read cart items
 * 2. Check stock availability
 * 3. Reduce stock
 * 4. Create order with status: "confirmed", paymentMethod: "cod"
 * 5. Clear cart
 */
export const createorder = asyncHandler(async (req, res) => {
  // Get userId from JWT token
  const userId = req.user.id;
  
  if (!userId) {
    return res.status(400).json({ message: "User not authenticated" });
  }

  // Get payment method from request body
  const { paymentMethod, shippingAddress } = req.body;

  // REJECT Stripe payments - they should go through createCheckoutSession
  if (paymentMethod === "stripe") {
    return res.status(400).json({ 
      message: "For Stripe payments, please use the checkout page to initiate payment" 
    });
  }

  // Fetch cart items from database
  const cartItems = await CartModel.find({ user: userId }).populate('productId');

  if (!cartItems.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  let orderItems = [];
  let totalAmount = 0;

  // Process each cart item - check stock and build order items
  for (const item of cartItems) {
    const product = item.productId;
    
    if (!product) {
      return res.status(400).json({ message: `Product not found for cart item` });
    }

    // Check stock from inventory
    const inventory = await Inventorymodel.findOne({ productId: product._id });
    const availableStock = inventory ? inventory.quantity : 0;

    if (availableStock < item.quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock for product: ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}` 
      });
    }

    // Add to order items
    orderItems.push({
      productId: product._id,
      quantity: item.quantity,
      price: product.price,
    });

    totalAmount += product.price * item.quantity;
  }

  // Validate we have order items
  if (!orderItems.length) {
    return res.status(400).json({ message: "No items to order" });
  }

  // REDUCE STOCK for each item (COD only - payment is confirmed)
  for (const item of orderItems) {
    await reduceStockService(item.productId, item.quantity);
  }

  // Create order with COD payment
  const newOrder = await OrderModel.create({
    user: userId,
    items: orderItems,
    totalAmount,
    shippingAddress: shippingAddress ? {
      address: shippingAddress.address,
      city: shippingAddress.city,
      state: shippingAddress.state || "",
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country || "India",
    } : undefined,
    status: "confirmed",
    paymentMethod: "cod",
  });

  // Clear cart after successful COD order
  await CartModel.deleteMany({ user: userId });

  // Emit socket event for dashboard update
  const io = req.app.get("io");
  if (io) {
    io.emit("dashboardUpdate");
  }

  // Create notification for new order
  await createNotification(
    `New order placed #${newOrder._id.toString().slice(-6)}`,
    "new_order",
    newOrder._id
  );

  // Emit notification event
  if (io) {
    io.emit("newNotification", {
      message: `New order placed #${newOrder._id.toString().slice(-6)}`,
      type: "new_order",
    });
  }

  res.status(201).json(newOrder);
});

/**
 * GET USER ORDERS
 */
export const getorders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await OrderModel.find({ user: userId })
      .populate("user", "name email")
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET ALL ORDERS (Admin)
 */
export const getallorders = async (req, res) => {
  try {
    const orders = await OrderModel.find()
      .populate("user", "name email")
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * UPDATE ORDER STATUS (Admin)
 */
export const updateorderstatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const allowedStatus = ["pending", "confirmed", "paid", "shipped", "delivered", "cancelled"];
    
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Emit socket event for status update
    const io = req.app.get("io");
    if (io) {
      io.emit("dashboardUpdate");
    }

    // Create notification for status update
    await createNotification(
      `Order #${order._id.toString().slice(-6)} marked as ${status}`,
      "order_status",
      order._id
    );

    // Emit notification event
    if (io) {
      io.emit("newNotification", {
        message: `Order #${order._id.toString().slice(-6)} marked as ${status}`,
        type: "order_status",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

