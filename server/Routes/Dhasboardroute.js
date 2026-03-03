 import express from "express";
 
import Dhashboard from "../Controllers/Dhashboard.js";
  

const router = express.Router();



 
router.get("/dashboard",Dhashboard)
export default router;
