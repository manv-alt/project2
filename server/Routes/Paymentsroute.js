import express from "express";
import { default as authMiddleware } from "../Middleware/auth.js";

import { createCheckoutSession } from "../Controllers/Payment.js"
const router = express.Router();

router.post("/checkout",authMiddleware,createCheckoutSession)
export default router;