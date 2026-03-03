import asyncHandler from "../Middleware/Asynhandler.js";
import Inventory from "../Models/Inventory.js";
import Product from "../Models/Product.js";
import OrderModel from "../Models/Order.js";
import XLSX from "xlsx";
import fs from "fs";

/* ===============================
   CORE STOCK FUNCTION
================================= */
const addStockService = async (productId, quantity) => {
  let inventory = await Inventory.findOne({ productId });

  if (!inventory) {
    // If inventory doesn't exist, create it
    inventory = await Inventory.create({ productId, quantity: 0 });
  }

  if (!quantity || quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  inventory.quantity += quantity;
  await inventory.save();

  await Product.findByIdAndUpdate(productId, {
    availabilityStatus: "inStock",
  });

  return inventory;
};

/* ===============================
   REDUCE STOCK AFTER ORDER
================================= */
const reduceStockService = async (productId, quantity) => {
  const inventory = await Inventory.findOne({ productId });

  if (!inventory) {
    throw new Error(`Inventory not found for product ${productId}`);
  }

  if (inventory.quantity < quantity) {
    console.warn(`Stock issue for product ${productId}. Requested: ${quantity}, Available: ${inventory.quantity}. Setting stock to 0.`);
    inventory.quantity = 0;
  } else {
    inventory.quantity -= quantity;
  }

  let newStatus = "inStock";
  if (inventory.quantity <= 0) {
    newStatus = "outOfStock";
  } else if (inventory.quantity <= inventory.lowStockThreshold) {
    newStatus = "lowStock";
  }

  await inventory.save();

  await Product.findByIdAndUpdate(productId, {
    availabilityStatus: newStatus,
  });

  return inventory;
};

export const reduceStockAfterOrder = async (orderId) => {
  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new Error("Order not found for stock reduction.");
  }

  for (const item of order.items) {
    await reduceStockService(item.productId, item.quantity);
  }
};

/* ===============================
   GET ALL INVENTORY (with product details)
================================= */
export const getAllInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find()
    .populate("productId", "name price category img availabilityStatus")
    .sort({ createdAt: -1 });

  // Transform data to include product details directly
  const inventoryWithDetails = inventory.map((item) => ({
    _id: item._id,
    productId: item.productId?._id,
    productName: item.productId?.name || "Unknown Product",
    productCategory: item.productId?.category || "Uncategorized",
    productImage: item.productId?.img,
    quantity: item.quantity,
    lowStockThreshold: item.lowStockThreshold,
    availabilityStatus: item.productId?.availabilityStatus || "outOfStock",
    price: item.productId?.price || 0,
  }));

  res.json(inventoryWithDetails);
});

/* ===============================
   GET INVENTORY STATS
================================= */
export const getInventoryStats = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find().populate("productId", "availabilityStatus");
  
  const totalProducts = inventory.length;
  const lowStockItems = inventory.filter(i => i.quantity > 0 && i.quantity <= (i.lowStockThreshold || 10)).length;
  const outOfStock = inventory.filter(i => i.quantity <= 0).length;
  const inStock = inventory.filter(i => i.quantity > (i.lowStockThreshold || 10)).length;

  res.json({
    totalProducts,
    lowStockItems,
    outOfStock,
    inStock,
  });
});

/* ===============================
   UNIVERSAL ADD STOCK API
================================= */
  const addStock = asyncHandler(async (req, res) => {

  // 1️⃣ Manual Entry
  if (req.body.productId && req.body.quantity) {
    const inventory = await addStockService(
      req.body.productId,
      Number(req.body.quantity)
    );

    return res.json({
      success: true,
      message: "Stock added manually",
      data: inventory,
    });
  }

  // 2️⃣ Excel / Invoice Upload
  if (req.file) {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    for (const row of data) {
      if (!row.productId || !row.quantity) continue;

      await addStockService(
        row.productId,
        Number(row.quantity)
      );
    }

    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      message: "Stock updated from file successfully",
    });
  }

  return res.status(400).json({
    success: false,
    message: "Invalid stock request",
  });
});

/* ===============================
   GET ALL PRODUCTS (for dropdown selection)
================================= */
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().select("_id name category price availabilityStatus");
  res.json(products);
});

export { addStock, addStockService, reduceStockService };
