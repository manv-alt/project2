import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "superadmin"],
    default: "admin",
  },
  settings: {
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    autoRefreshInterval: {
      type: Number,
      default: 10, // seconds
    },
  },
  refreshToken: {
    type: String,
  },
}, {
  timestamps: true,
});

const AdminModel = mongoose.model("Admin", AdminSchema);
export default AdminModel;

