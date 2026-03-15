import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;
import path from 'path';
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectdb from "./Database/Connection.js";
import cookieParser from "cookie-parser";

import user from "./Routes/user.js";
import Dhasboardroute from "./Routes/Dhasboardroute.js";
import Productroute from "./Routes/Productroute.js";
import Orderroute from "./Routes/Orderroute.js";
import Paymentsroute from "./Routes/Paymentsroute.js";
import Inventoryroute from "./Routes/Inventoryroute.js";
import Cartroute from "./Routes/Cartroute.js";
import Categoryroute from "./Routes/Categoryroute.js";
import Webhookroute from "./Routes/Webhookroute.js";
import Adminroute from "./Routes/Adminroute.js";
import Feedbackroute from "./Routes/Feedbackroute.js"; 

const app = express();

// Create HTTP server
const server = http.createServer(app);

// ✅ CORRECTED CORS CONFIG - These are your ACTUAL domains
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5713",
  // ✅ YOUR ACTUAL VERCEL DEPLOYMENT URL
   "https://project2-2tyu-git-main-manv-alts-projects.vercel.app",
  // ✅ Add your production URL if different
  "https://project2-2tyu.vercel.app",
];

// ✅ Socket.IO CORS - FIXED
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

// Socket connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Stripe webhook needs raw body, so it's registered before express.json()
app.use("/api", Webhookroute);

// ✅ CORS for Express - FIXED (put BEFORE all routes)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
}));

app.use(cookieParser());
app.use(express.json());

// ✅ ALL your existing routes (unchanged)
app.use("/api", user);
app.use("/api", Dhasboardroute);
app.use("/api", Productroute);
app.use("/api", Categoryroute);
app.use("/api/cart", Cartroute);
app.use("/api", Orderroute);
app.use("/api", Paymentsroute);
app.use("/api/inventory", Inventoryroute);
app.use("/api", Adminroute);
app.use("/api", Feedbackroute);

app.use("/uploads", express.static("uploads"));

// Database connection (unchanged)
connectdb().then(async () => {
  console.log("Database connected");
  try {
    const AdminModel = (await import("./Models/Admin.js")).default;
    const bcrypt = await import("bcryptjs");
    
    const existingAdmin = await AdminModel.findOne({ username: "admin" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await AdminModel.create({
        username: "admin",
        email: "admin@grocerymart.com",
        password: hashedPassword,
        role: "superadmin",
        settings: {
          notificationsEnabled: true,
          autoRefreshInterval: 10,
        },
      });
      console.log("Default admin created: admin / admin123");
    }
  } catch (error) {
    console.log("Admin seeding skipped:", error.message);
  }
}).catch(err => console.log("Database connection error:", err));

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("✅ CORS allowed origins:", allowedOrigins);
});
