import express from "express";
import { addToCart, getCart, updateCartItem, removeCartItem, clearCart } from "../Controllers/Cart.js";
import { default as authMiddleware } from "../Middleware/auth.js";
 
const router = express.Router();
  
router.get("/", getCart);
router.post("/",  addToCart);
router.put("/:productId",  updateCartItem);
router.delete("/:productId", removeCartItem);
router.delete("/clear",  clearCart);

export default router;
