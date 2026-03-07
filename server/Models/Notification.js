import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["new_order", "low_stock", "order_status", "general"],
    default: "general",
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "type",
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ read: 1 });

const NotificationModel = mongoose.model("Notification", NotificationSchema);
export default NotificationModel;

