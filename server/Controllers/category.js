import Category from "../Models/Category.js";
import fs from "fs";
import path from "path";

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Get all categories (public)
const getCategories = async (req, res) => {
  try {
    const { populate } = req.query;
    let query = Category.find({ isActive: true }).sort({ createdAt: -1 });
    
    if (populate === 'true') {
      query = query.populate('parent', 'name slug');
    }
    
    const categories = await query;
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// Get single category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true }).populate('parent', 'name slug');
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category" });
  }
};

// Get subcategories by parent slug
const getSubcategories = async (req, res) => {
  try {
    const { parentSlug } = req.params;
    const parent = await Category.findOne({ slug: parentSlug, isActive: true });
    
    if (!parent) {
      return res.status(404).json({ message: "Parent category not found" });
    }
    
    const subcategories = await Category.find({ parent: parent._id, isActive: true }).sort({ name: 1 });
    res.status(200).json(subcategories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subcategories" });
  }
};

// Add new category (admin only)
const addCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Generate slug from name
    const slug = generateSlug(name);

    const newCategory = await Category.create({
      name,
      slug,
      image: imagePath,
      parent: parent || null,
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.log("ADD CATEGORY ERROR:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }
    res.status(500).json({ message: "Server error while creating category" });
  }
};

// Update category (admin only)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const existingCategory = await Category.findById(id);
    
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updates = { ...req.body };

    // Generate new slug if name changed
    if (req.body.name && req.body.name !== existingCategory.name) {
      updates.slug = generateSlug(req.body.name);
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

    const updatedCategory = await Category.findByIdAndUpdate(id, updates, { new: true }).populate('parent', 'name slug');
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.log("UPDATE CATEGORY ERROR:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }
    res.status(500).json({ message: "Server error while updating category" });
  }
};

// Delete category (admin only)
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

export { getCategories, getCategoryBySlug, getSubcategories, addCategory, updateCategory, deleteCategory };
