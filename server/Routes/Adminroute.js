import express from "express";
import {
  adminLogin,
  adminLogout,
  adminRefresh,
  getDashboardStats,
  getNotifications,
  markNotificationsRead,
  getRecentOrders,
  updateAdminSettings,
  seedDefaultAdmin,
} from "../Controllers/Admin.js";
import { adminAuth } from "../Middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.post("/admin/login", adminLogin);
router.post("/admin/refresh", adminRefresh);
router.post("/admin/seed", seedDefaultAdmin);

// Protected routes
router.post("/admin/logout", adminAuth, adminLogout);
router.get("/admin/dashboard-stats", adminAuth, getDashboardStats);
router.get("/admin/notifications", adminAuth, getNotifications);
router.patch("/admin/notifications/read", adminAuth, markNotificationsRead);
router.get("/admin/orders/recent", adminAuth, getRecentOrders);
router.put("/admin/settings", adminAuth, updateAdminSettings);

export default router;

