import express from "express";
import upload from "../Middleware/Upploads.js";
import { getCategories, getCategoryBySlug, getSubcategories, addCategory, updateCategory, deleteCategory } from "../Controllers/category.js";

const router = express.Router();

// Public routes - GET
router.get("/categories", getCategories);
router.get("/categories/slug/:slug", getCategoryBySlug);
router.get("/categories/subcategories/:parentSlug", getSubcategories);

// Protected routes (add authMiddleware back when ready)
// Note: For now making public to test - add authMiddleware for admin only access
router.post("/categories", upload.single("image"), addCategory);
router.put("/categories/:id", upload.single("image"), updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
