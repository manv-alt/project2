import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "../Middleware/Asynhandler.js";
import AdminModel from "../Models/Admin.js";
import NotificationModel from "../Models/Notification.js";
import OrderModel from "../Models/Order.js";
import Product from "../Models/Product.js";
import UserModel from "../Models/Registermodel.js";
import Inventorymodel from "../Models/Inventory.js";

// Generate tokens
const generateTokens = (adminId) => {
  const accessToken = jwt.sign(
    { id: adminId },
    process.env.JWT_ACCESS_SECRET || "admin_access_secret",
    { expiresIn: "1d" }
  );
  const refreshToken = jwt.sign(
    { id: adminId },
    process.env.JWT_REFRESH_SECRET || "admin_refresh_secret",
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

// ADMIN LOGIN
export const adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide username and password" });
  }

  const admin = await AdminModel.findOne({ username });
  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = generateTokens(admin._id);

  admin.refreshToken = refreshToken;
  await admin.save();

  res.json({
    accessToken,
    refreshToken,
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      settings: admin.settings,
    },
  });
});

// ADMIN REFRESH TOKEN
export const adminRefresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  // Decode the refresh token to get admin ID
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "admin_refresh_secret");
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const admin = await AdminModel.findById(decoded.id);
  if (!admin || admin.refreshToken !== refreshToken) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const tokens = generateTokens(admin._id);
  admin.refreshToken = tokens.refreshToken;
  await admin.save();

  res.json(tokens);
});

// ADMIN LOGOUT
export const adminLogout = asyncHandler(async (req, res) => {
  const admin = await AdminModel.findById(req.admin.id);
  if (admin) {
    admin.refreshToken = null;
    await admin.save();
  }
  res.json({ message: "Logged out successfully" });
});

// DASHBOARD STATS
export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get totals
  const totalUsers = await UserModel.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await OrderModel.countDocuments();

  // Get revenue
  const revenueResult = await OrderModel.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // New orders today
  const newOrdersToday = await OrderModel.countDocuments({
    createdAt: { $gte: today },
  });

  // Low stock products
  const lowStockProducts = await Inventorymodel.find({
    $expr: { $lte: ["$quantity", 5] }
  }).populate("productId", "name");

  // Recent orders
  const recentOrders = await OrderModel.find()
    .populate("user", "name email")
    .populate("items.productId", "name")
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    newOrdersToday,
    lowStockCount: lowStockProducts.length,
    lowStockProducts: lowStockProducts.map(item => ({
      id: item._id,
      productId: item.productId?._id,
      name: item.productId?.name || "Unknown",
      quantity: item.quantity,
    })),
    recentOrders: recentOrders.map(order => ({
      id: order._id,
      user: order.user?.name || "Unknown",
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
    })),
  });
});

// GET NOTIFICATIONS
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await NotificationModel.find()
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await NotificationModel.countDocuments({ read: false });

  res.json({ notifications, unreadCount });
});

// MARK NOTIFICATIONS AS READ
export const markNotificationsRead = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;

  if (notificationIds && notificationIds.length > 0) {
    await NotificationModel.updateMany(
      { _id: { $in: notificationIds } },
      { read: true }
    );
  } else {
    // Mark all as read
    await NotificationModel.updateMany({}, { read: true });
  }

  res.json({ message: "Notifications marked as read" });
});

// GET RECENT ORDERS
export const getRecentOrders = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const orders = await OrderModel.find()
    .populate("user", "name email")
    .populate("items.productId", "name price")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json(orders);
});

// UPDATE ADMIN SETTINGS
export const updateAdminSettings = asyncHandler(async (req, res) => {
  const { notificationsEnabled, autoRefreshInterval, currentPassword, newPassword } = req.body;
  const adminId = req.admin.id;

  const admin = await AdminModel.findById(adminId);
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  // Update settings
  if (notificationsEnabled !== undefined) {
    admin.settings.notificationsEnabled = notificationsEnabled;
  }
  if (autoRefreshInterval !== undefined) {
    admin.settings.autoRefreshInterval = autoRefreshInterval;
  }

  // Change password if provided
  if (currentPassword && newPassword) {
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    admin.password = await bcrypt.hash(newPassword, 10);
  }

  await admin.save();

  res.json({
    message: "Settings updated successfully",
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      settings: admin.settings,
    },
  });
});

// CREATE NOTIFICATION (Helper function)
export const createNotification = async (message, type = "general", relatedId = null) => {
  try {
    const notification = await NotificationModel.create({
      message,
      type,
      relatedId,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// SEED DEFAULT ADMIN
export const seedDefaultAdmin = asyncHandler(async (req, res) => {
  const existingAdmin = await AdminModel.findOne({ username: "admin" });
  
  if (existingAdmin) {
    return res.json({ message: "Admin already exists" });
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await AdminModel.create({
    username: "admin",
    email: "admin@grocerymart.com",
    password: hashedPassword,
    role: "superadmin",
  });

  res.json({ message: "Default admin created", adminId: admin._id });
});

