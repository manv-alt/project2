import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  comment: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ["general", "order"],
    default: "general"
  }
}, {
  timestamps: true
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;

