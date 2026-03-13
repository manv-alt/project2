import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
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

//  Socket.IO setup
export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5713", "https://project2-1-7lyj.onrender.com"],
    credentials: true,
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
app.use(express.static(path.join(process.cwd(), 'client/dist')));
app.get('/*splat', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    return res.sendFile(path.join(process.cwd(), 'client/dist', 'index.html'));
  }
  res.status(404).json({ error: 'API route not found' });
});
// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["https://project2-1-7lyj.onrender.com", "https://project2-1-7lyj.onrender.com/admin"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api", user);
app.use("/api",Dhasboardroute );
app.use("/api",Productroute );

// Category routes
app.use("/api", Categoryroute);

// Cart routes
 app.use("/api/cart", Cartroute);

// Order routes
 app.use("/api", Orderroute);

// Payment routes
 app.use("/api", Paymentsroute);

// Inventory routes
 app.use("/api/inventory", Inventoryroute);

 // Admin routes
 app.use("/api", Adminroute);

 // Feedback routes
 app.use("/api", Feedbackroute);

app.use("/uploads", express.static("uploads"));

  
 

// Connect database and seed admin
connectdb().then(async () => {
  console.log("Database connected");
  
  // Seed default admin
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

// Start server using server.listen (not app.listen)
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
