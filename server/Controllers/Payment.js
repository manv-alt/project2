import Stripe from "stripe";
import CartModel from "../Models/Cartmodal.js";
import Inventorymodel from "../Models/Inventory.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * STRIPE CHECKOUT FLOW:
 * 1. Read cart items from database
 * 2. Validate stock availability (NOT reduce)
 * 3. Create Stripe checkout session with userId in metadata
 * 4. Redirect to Stripe (NO order created, NO stock reduced, NO cart cleared)
 */
export const createCheckoutSession = async (req, res) => {
  try {
    // Get userId from JWT token
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    // Fetch cart items directly from database
    const cartItems = await CartModel.find({ user: userId }).populate('productId');

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate stock availability (check only, do NOT reduce)
    for (const item of cartItems) {
      const product = item.productId;
      
      if (!product) {
        return res.status(400).json({ message: `Product not found for cart item` });
      }

      const inventory = await Inventorymodel.findOne({ productId: product._id });
      const availableStock = inventory ? inventory.quantity : 0;

      if (availableStock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product: ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}` 
        });
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.productId.price * item.quantity);
    }, 0);

    const deliveryCharge = subtotal > 500 ? 0 : 40; // Free delivery above ₹500
    const platformFee = 10;
    const totalAmount = subtotal + deliveryCharge + platformFee;

    // Stripe minimum safety check (₹50 = 5000 paise)
    if (totalAmount < 50) {
      return res.status(400).json({
        message: "Minimum order amount is ₹50",
      });
    }

    // Build line items for Stripe
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.productId.name || "Product",
          description: item.productId.category || "",
        },
        unit_amount: Math.round(item.productId.price * 100), // Convert to paise
      },
      quantity: item.quantity,
    }));

    // Add delivery charge line item
    if (deliveryCharge > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Delivery Charge",
          },
          unit_amount: Math.round(deliveryCharge * 100),
        },
        quantity: 1,
      });
    }

    // Add platform fee line item
    if (platformFee > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Platform Fee",
          },
          unit_amount: Math.round(platformFee * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session with userId in metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/cancel`,
      metadata: {
        userId: userId.toString(), // Pass userId, NOT orderId
      },
      // Store cart item count for verification in webhook
      client_reference_id: userId.toString(),
    });

    // Return the checkout URL - NO order created, NO stock reduced, NO cart cleared
    res.json({ url: session.url });
    
  } catch (error) {
    console.error("CHECKOUT SESSION ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

