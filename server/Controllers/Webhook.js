import OrderModel from "../Models/Order.js";
import CartModel from "../Models/Cartmodal.js";
import { reduceStockService } from "./Inventory.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * STRIPE WEBHOOK HANDLER:
 * 
 * On checkout.session.completed:
 * 1. Get userId from session.metadata.userId
 * 2. Fetch cart items for that user
 * 3. Validate stock and reduce stock
 * 4. Create OrderModel with status: "paid", paymentMethod: "stripe"
 * 5. Clear cart
 * 
 * This ensures:
 * - Order is ONLY created AFTER successful payment
 * - Stock is ONLY reduced AFTER successful payment
 * - Cart is ONLY cleared AFTER successful payment
 */
export const webhookController = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const io = req.app.get("io");

  let event;

  try {
    // Verify Stripe webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Signature Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful Stripe payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    // Get userId from metadata (NOT orderId - we don't create order before payment)
    const userId = session.metadata.userId;

    if (!userId) {
      console.error("No userId in session metadata");
      return res.status(400).json({ received: true, error: "No userId in metadata" });
    }

    try {
      // Fetch cart items from database
      const cartItems = await CartModel.find({ user: userId }).populate('productId');

      if (!cartItems.length) {
        console.error(`No cart items found for user ${userId}`);
        return res.json({ received: true });
      }

      // Build order items from cart
      let orderItems = [];
      let totalAmount = 0;

      for (const item of cartItems) {
        const product = item.productId;
        
        if (!product) {
          console.warn(`Product not found for cart item`);
          continue;
        }

        // Get shipping address from session if available
        const shippingAddress = session.shipping ? {
          address: session.shipping.address.line1 || "",
          city: session.shipping.address.city || "",
          state: session.shipping.address.state || "",
          postalCode: session.shipping.address.postal_code || "",
          country: session.shipping.address.country || "India",
        } : undefined;

        orderItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
        });

        totalAmount += product.price * item.quantity;
      }

      // Add delivery charge if any (matching the checkout session)
      const subtotal = totalAmount;
      const deliveryCharge = subtotal > 500 ? 0 : 40;
      const platformFee = 10;
      totalAmount += deliveryCharge + platformFee;

      // REDUCE STOCK for each item (ONLY after successful payment)
      for (const item of orderItems) {
        await reduceStockService(item.productId, item.quantity);
      }

      // Create order with "paid" status and Stripe payment details
      const newOrder = await OrderModel.create({
        user: userId,
        items: orderItems,
        totalAmount,
        shippingAddress: session.shipping ? {
          address: session.shipping.address.line1 || "",
          city: session.shipping.address.city || "",
          state: session.shipping.address.state || "",
          postalCode: session.shipping.address.postal_code || "",
          country: session.shipping.address.country || "India",
        } : undefined,
        status: "paid",
        paymentMethod: "stripe",
        paymentIntentId: session.payment_intent,
      });

      // Clear cart AFTER successful order creation
      await CartModel.deleteMany({ user: userId });

      console.log(`Order ${newOrder._id} created for user ${userId} via Stripe payment`);

      // Emit socket event for dashboard update
      if (io) {
        io.emit("dashboardUpdate");
      }

    } catch (error) {
      console.error("Webhook processing error:", error);
      // Still return 200 to Stripe to prevent retries for technical errors
      // But log the error for manual investigation
    }
  }

  // Return 200 for any other event types (keep Stripe happy)
  res.json({ received: true });
};

