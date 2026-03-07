import jwt from "jsonwebtoken";
import asyncHandler from "../Middleware/Asynhandler.js";
import AdminModel from "../Models/Admin.js";

// Admin authentication middleware
export const adminAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "admin_access_secret");
    const admin = await AdminModel.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

// Optional admin auth - doesn't fail if no token
export const optionalAdminAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || "admin_access_secret");
    const admin = await AdminModel.findById(decoded.id).select("-password");

    if (admin) {
      req.admin = admin;
    }
  } catch (error) {
    // Token invalid, but continue without admin
  }

  next();
});

