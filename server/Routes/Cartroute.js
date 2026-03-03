import express from "express";
import { addToCart, getCart, updateCartItem, removeCartItem, clearCart } from "../Controllers/Cart.js";
import { default as authMiddleware } from "../Middleware/auth.js";
 
const router = express.Router();
  
router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.put("/:productId", authMiddleware, updateCartItem);
router.delete("/:productId", authMiddleware, removeCartItem);
router.delete("/clear", authMiddleware, clearCart);

export default router;
