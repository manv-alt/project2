import express from "express";
import { addStock, getAllInventory, getInventoryStats, getAllProducts } from "../Controllers/Inventory.js";
import { default as authMiddleware } from "../Middleware/auth.js";

const router = express.Router();

// Add stock (manual or via Excel)
router.post("/addstock", authMiddleware, addStock);

// Get all inventory with product details
router.get("/", authMiddleware, getAllInventory);

// Get inventory stats
router.get("/stats", authMiddleware, getInventoryStats);

// Get all products (for dropdown selection)
router.get("/products", authMiddleware, getAllProducts);

export default router;
