import OrderModel from "../Models/Order.js";
import Stripe from "stripe";
import { reduceStockAfterOrder } from "./Inventory.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export const webhookController = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const io = req.app.get("io");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Payment success
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const orderId = session.metadata.orderId; // Make sure this matches metadata in createCheckoutSession

    try {
      await OrderModel.findByIdAndUpdate(orderId, {
        status: "paid",
        paymentIntentId: session.payment_intent,
      });

      // Reduce stock from inventory
      await reduceStockAfterOrder(orderId);
      io.emit("dashboardUpdate"); // Notify dashboard of changes
    } catch (error) {
      console.error(`Error processing successful payment for order ${orderId}:`, error);
      // You might want to handle this error, e.g., by flagging the order for manual review.
    }
  }

  res.json({ received: true });
};