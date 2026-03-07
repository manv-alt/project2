import express from "express";
import { submitFeedback, submitOrderFeedback, getAllFeedback } from "../Controllers/Feedback.js";

const router = express.Router();

// Public route - submit general feedback
router.post("/feedback", submitFeedback);

// Public route - submit order feedback
router.post("/order-feedback", submitOrderFeedback);

// Protected route - get all feedback (admin)
router.get("/feedback", getAllFeedback);

export default router;

