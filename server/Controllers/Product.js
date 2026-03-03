import upload from "../Middleware/Upploads.js";
import Product from "../Models/Product.js";
import fs from"fs";
import path from"path";

const addproduct = async (req, res) => {
  try {
    const { name, price, unit, category } = req.body

    // Debug logging
    console.log("=== ADD PRODUCT DEBUG ===");
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    console.log("name:", name, "type:", typeof name);
    console.log("price:", price, "type:", typeof price);
    console.log("unit:", unit, "type:", typeof unit);
    console.log("category:", category, "type:", typeof category);
    console.log("=========================");

    // Validate required fields - ensure they are not undefined/null
    const nameVal = name ? String(name).trim() : "";
    const priceVal = price ? String(price).trim() : "";
    const unitVal = unit ? String(unit).trim() : "";
    const categoryVal = category ? String(category).trim() : "";

    if (!nameVal) {
      return res.status(400).json({ message: "Product name is required" });
    }
    if (!priceVal || isNaN(priceVal) || parseFloat(priceVal) <= 0) {
      return res.status(400).json({ message: "Please enter a valid price" });
    }
    if (!unitVal) {
      return res.status(400).json({ message: "Unit is required (e.g., kg, piece)" });
    }
    if (!categoryVal) {
      return res.status(400).json({ message: "Please select a category" });
    }

    // Handle image - make it optional but validate if provided
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const newProduct = await Product.create({
      name: nameVal,
      price: parseFloat(priceVal),
      category: categoryVal,
      unit: unitVal,
      img: imagePath,
    });

    res.status(201).json({ 
      success: true,
      message: "Product created successfully", 
      product: newProduct 
    });

  } catch (error) {
    console.log("ADD ERROR:", error);
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error while creating product" });
  }
}
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ products: products })
  } catch (error) {
    res.status(500).json({ error: "Failed to get products" })

  }
}
// const getproductbyid=async(req,res)=>{
//     try {
//         const productbyid=await Product.findById(req.params.id)
//         if(!productbyid)
//              return res.status(404).json({ message: "Product not found" });
//     res.json({ success: true,  productbyid });
//     } catch (error) {
//             res.status(500).json({ message: error.message });

//     }
// }
const updateproduct = async (req, res) => {
  try {
    const { id } = req.params
    const existingProduct = await Product.findById(id)
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" })
    }
    const updates = { ...req.body }
    if (req.file) {
      if (existingProduct.img) {
        const oldImagePath = path.join("uploads", existingProduct.img.replace('/uploads/', ''));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      updates.img = `/uploads/${req.file.filename}`
      
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true })
    res.status(201).json({ message: "Product updated successfully", product: updatedProduct })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}
const deleteProduct = async (req, res) => {
   try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // Delete associated image if exists
    if (product.img) {
      const imagePath = path.join("uploads", product.img.replace('/uploads/', ''));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export { addproduct, getProducts, updateproduct, deleteProduct }  