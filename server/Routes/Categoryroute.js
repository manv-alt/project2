import express from "express";
import upload from "../Middleware/Upploads.js";
import { getCategories, addCategory, updateCategory, deleteCategory } from "../Controllers/category.js";

const router = express.Router();

router.get("/categories", getCategories);
router.post("/categories", upload.single("image"), addCategory);
router.put("/categories/:id", upload.single("image"), updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
