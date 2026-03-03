import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;

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
const app = express();

// Create HTTP server
const server = http.createServer(app);

//  Socket.IO setup
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
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

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
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
 app.use("/api/orders", Orderroute);

// Payment routes
 app.use("/api/payment", Paymentsroute);

// Inventory routes
 app.use("/api/inventory", Inventoryroute);

app.use("/uploads", express.static("uploads"));

// Connect database
connectdb();

// Start server using server.listen (not app.listen)
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
