import Category from "../Models/Category.js";
import fs from "fs";
import path from "path";

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// Add new category
const addCategory = async (req, res) => {
  try {
    const { name, icon, subcategories } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const newCategory = await Category.create({
      name,
      icon: icon || "",
      image: imagePath,
      subcategories: subcategories ? JSON.parse(subcategories) : [],
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.log("ADD CATEGORY ERROR:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error while creating category" });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const existingCategory = await Category.findById(id);
    
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updates = { ...req.body };
    
    // Handle subcategories parsing
    if (req.body.subcategories) {
      updates.subcategories = JSON.parse(req.body.subcategories);
    }

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (existingCategory.image) {
        const oldImagePath = path.join("uploads", existingCategory.image.replace('/uploads/', ''));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updates.image = `/uploads/${req.file.filename}`;
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.log("UPDATE CATEGORY ERROR:", error);
    res.status(500).json({ message: "Server error while updating category" });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Delete associated image if exists
    if (category.image) {
      const imagePath = path.join("uploads", category.image.replace('/uploads/', ''));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log("DELETE CATEGORY ERROR:", error);
    res.status(500).json({ message: "Server error while deleting category" });
  }
};

export { getCategories, addCategory, updateCategory, deleteCategory };
