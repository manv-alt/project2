import express from "express";
import { default as authMiddleware } from "../Middleware/auth.js";
import { createorder, getorders, updateorderstatus, getallorders } from "../Controllers/Order.js"
const router = express.Router();
  
 
router.post("/create",authMiddleware,createorder)
router.get("/myorders",authMiddleware,getorders)
router.get("/all",authMiddleware,getallorders)
router.put("/updatestatus/:orderId",authMiddleware,updateorderstatus)
export default router;