import Stripe from "stripe"
import OrderModel from "../Models/Order.js"


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const createCheckoutSession = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await OrderModel.findById(orderId).populate('items.productId');
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        const line_items = order.items.map(item => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.productId.name,
                },
                unit_amount: item.price * 100, // Use price from order item
            },
            quantity: item.quantity,

        }))
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/cancel`,
            metadata:{
                orderId: order._id.toString(),
            }
        })
        res.json({ url: session.url })
    } catch (error) {
        console.error("CHECKOUT SESSION ERROR:", error);
        res.status(500).json({ error: error.message })

    }
}