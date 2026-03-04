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
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    try {
      const order = await OrderModel.findById(orderId);

      if (!order || order.status === "paid") {
        return res.json({ received: true });
      }

       for (const item of order.items) {
        await reduceStockService(item.productId, item.quantity);
      }

      order.status = "paid";
      order.paymentIntentId = session.payment_intent;
      await order.save();

      if (io) io.emit("dashboardUpdate");

    } catch (error) {
      console.error("Webhook processing error:", error);
    }
  }

  res.json({ received: true });
};