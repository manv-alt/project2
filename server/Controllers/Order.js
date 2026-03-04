import asyncHandler from "../Middleware/Asynhandler.js";
import CartModel from "../Models/Cartmodal.js";
import OrderModel from "../Models/Order.js";
import Inventorymodel from "../Models/Inventory.js";
import { reduceStockService } from "./Inventory.js";


export const createorder = asyncHandler(async (req, res) => {
  try {
    // Use the data sent from frontend if available, otherwise fall back to cart
    const frontendData = req.body;
    
    // Get userId from JWT token (token uses 'id' not '_id')
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    let orderItems = [];
    let totalAmount = 0;
    let shippingAddress = null;

    // If frontend sends orderItems directly (from Checkout.jsx)
    if (frontendData.orderItems && frontendData.orderItems.length > 0) {
      orderItems = frontendData.orderItems.map(item => ({
        productId: item.product,
        quantity: item.qty,
        price: item.price,
      }));
      
      totalAmount = frontendData.totalAmount || 0;
      shippingAddress = frontendData.shippingAddress || null;
    } else {
      // Fall back to getting items from cart database
      const cartItems = await CartModel.find({ user: userId }).populate('productId');
      
      if (!cartItems.length) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      for (const item of cartItems) {
        const product = item.productId;
        if (!product) {
          return res.status(400).json({ message: `Product not found` });
        }

        // Check stock from inventory
        const inventory = await Inventorymodel.findOne({ productId: product._id });
        const availableStock = inventory ? inventory.quantity : 0;

        if (availableStock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
        }

        totalAmount += product.price * item.quantity;
        orderItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
        });
      }
    }

    // Validate we have order items
    if (!orderItems.length) {
      return res.status(400).json({ message: "No items to order" });
    }

    // Reduce stock for each item
    for (const item of orderItems) {
      try {
        await reduceStockService(item.productId, item.quantity);
      } catch (stockError) {
        console.error("Stock reduction error:", stockError.message);
      }
    }

    // Create order with all required fields
    const newOrder = await OrderModel.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress ? {
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state || "",
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      } : undefined,
      status: "confirmed",
      paymentMethod: frontendData.paymentMethod || "cod",
    });

    // Clear cart after successful order (only if we used cart items)
    if (!frontendData.orderItems) {
      await CartModel.deleteMany({ user: userId });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("dashboardUpdate");
    }

    res.json(newOrder);
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});
 export const getorders = async (req, res) => {
try {
    const userId=req.user.id;
    const order = await OrderModel.find({user: userId}).populate("items.productId").sort({createdAt:-1});
    return res.json(order);
} catch (error) {
        res.status(500).json({ error: error.message });     
}
}
export const getallorders = async (req, res) => {
    try{
        const order = await OrderModel.find().populate("user", "name email").populate("items.productId").sort({createdAt:-1});
        return res.json(order);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
}
export const updateorderstatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const allowedStatus = ["pending", "paid", "shipped", "delivered", "cancelled"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        const order = await OrderModel.findByIdAndUpdate(orderId,
            {status},
            { new: true }
            
        )
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
        
    }
}
