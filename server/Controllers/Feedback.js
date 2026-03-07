import Feedback from "../Models/Feedback.js";

// Submit general feedback from contact page
const submitFeedback = async (req, res) => {
  try {
    const { name, email, message, rating } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    const feedback = await Feedback.create({
      name,
      email,
      message,
      rating: rating || 0,
      type: "general"
    });

    res.status(201).json({ 
      success: true, 
      message: "Feedback submitted successfully",
      feedback 
    });
  } catch (error) {
    console.log("FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
};

// Submit order feedback
const submitOrderFeedback = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({ message: "Order ID and rating are required" });
    }

    const feedback = await Feedback.create({
      orderId,
      rating,
      comment: comment || "",
      type: "order"
    });

    res.status(201).json({ 
      success: true, 
      message: "Order feedback submitted successfully",
      feedback 
    });
  } catch (error) {
    console.log("ORDER FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Failed to submit order feedback" });
  }
};

// Get all feedback (admin)
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ feedback });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
};

export { submitFeedback, submitOrderFeedback, getAllFeedback };

