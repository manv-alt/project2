import CartModel from "../Models/Cartmodal.js";
import Product from "../Models/Product.js";

// Clean up cart items where product no longer exists
const cleanupInvalidCartItems = async (userId) => {
  const cartItems = await CartModel.find({ user: userId });
  const invalidItemIds = [];
  
  for (const item of cartItems) {
    const product = await Product.findById(item.productId);
    if (!product) {
      invalidItemIds.push(item._id);
    }
  }
  
  if (invalidItemIds.length > 0) {
    await CartModel.deleteMany({ _id: { $in: invalidItemIds } });
    console.log(`Cleaned up ${invalidItemIds.length} invalid cart items`);
  }
};

const getCartContents = async (userId) => {
  // Clean up invalid cart items first
  await cleanupInvalidCartItems(userId);
  
  const cartItems = await CartModel.find({ user: userId }).populate("productId");
  if (!cartItems.length) {
    return {
      items: [],
      totalQuantity: 0,
      totalPrice: 0,
      deliveryCharge: 0,
      grandTotal: 0,
    };
  }

  let totalQuantity = 0;
  let totalPrice = 0;

  cartItems.forEach((item) => {
    // Skip items where product was deleted (productId is null)
    if (!item.productId) {
      console.warn(`Cart item with missing product found: ${item._id}`);
      return;
    }
    totalQuantity += item.quantity;
    totalPrice += item.productId.price * item.quantity;
  });

  const deliveryCharge = totalPrice > 500 ? 0 : 40;
  const grandTotal = totalPrice + deliveryCharge;

  return {
    items: cartItems,
    totalQuantity,
    totalPrice,
    deliveryCharge,
    grandTotal,
  };
};

export const addToCart = async (req, res) => {
  try {
    const { quantity, productId } = req.body;
    const userId = req.user.id;

    console.log("addToCart called:", { userId, quantity, productId });

    if (!quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cartItem = await CartModel.findOne({ user: userId, productId });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = new CartModel({
        user: userId,
        productId,
        quantity,
      });
      await cartItem.save();
    }

    const cartData = await getCartContents(userId);
    res.status(200).json(cartData);
  } catch (error) {
    console.error("addToCart error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartData = await getCartContents(userId);
    res.json(cartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    const cartItem = await CartModel.findOne({ user: userId, productId });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    const cartData = await getCartContents(userId);
    res.status(200).json(cartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cartItem = await CartModel.findOneAndDelete({
      user: userId,
      productId,
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const cartData = await getCartContents(userId);
    res.status(200).json(cartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await CartModel.deleteMany({ user: userId });
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
