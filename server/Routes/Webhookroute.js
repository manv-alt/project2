import express from "express";
import { webhookController } from "../Controllers/Webhook.js";
 
const router = express.Router();
  
 router.post("/webhook", express.raw({type: 'application/json'}), webhookController)
 
export default router;