import Stripe from "stripe"
import OrderModel from "../Models/Order.js"


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const createCheckoutSession = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId || orderId.length === 0) {
            return res.status(400).json({ error: "Order ID is required" });
        }
        
        const order = await OrderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        
        // Use order.items to calculate subtotal
        const subtotal = order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        
        const deliveryCharge = subtotal > 500 ? 0 : 40;   // free above ₹500
        const platformFee = 10;

        const totalAmount = subtotal + deliveryCharge + platformFee;

        //  Stripe minimum safety
        if (totalAmount < 50) {
            return res.status(400).json({
                message: "Minimum order amount is ₹50",
            });
        }
        
        // Use order.items for line items
        const lineItems = order.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.productId?.name || "Product",
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }));

        // Add delivery charge
        lineItems.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charge",
                },
                unit_amount: deliveryCharge * 100,
            },
            quantity: 1,
        });

        // Add platform fee
        lineItems.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Platform Fee",
                },
                unit_amount: platformFee * 100,
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/cancel`,
            metadata: {
                orderId: order._id.toString(),
            }
        });
        res.json({ url: session.url });
    } catch (error) {
        console.error("CHECKOUT SESSION ERROR:", error);
        res.status(500).json({ error: error.message });

    }
}
