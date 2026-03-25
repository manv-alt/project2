import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import AdminModel from "../Models/Admin.js";

// ✏️  Change these to your desired credentials
const NEW_USERNAME = "admin";
const NEW_PASSWORD = "admin@123";
const NEW_EMAIL    = "manishkarkera927@gmail.com";

await mongoose.connect(process.env.MONGODB_URI);

const hashed = await bcrypt.hash(NEW_PASSWORD, 10);

const result = await AdminModel.findOneAndUpdate(
  {}, // first admin found
  { username: NEW_USERNAME, password: hashed, email: NEW_EMAIL },
  { upsert: true, new: true }
);

console.log("✅ Admin updated:", result.username, "/", result.email);
await mongoose.disconnect();
