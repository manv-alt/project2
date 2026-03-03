import express from "express";
import { login, logout, register, resendOtp, userrefresh, verifyotp, getProfile, updateProfile, getAddresses, addAddress, deleteAddress } from "../Controllers/userctrl.js";
import { loginSchema,  signupvalid } from "../validator/authvalid.js";
import { validate } from "../Middleware/validator.js";
import auth from "../Middleware/auth.js";

import Dhashboard from "../Controllers/Dhashboard.js";
  

const router = express.Router();

// REGISTER
router.post("/auth/signup",   validate(signupvalid), register);
router.post("/auth/verifyotp", verifyotp);
router.post("/auth/resendotp", resendOtp);
// LOGIN
router.post("/auth/login",   validate(loginSchema), login);
router.post("/auth/logout", logout);
router.get("/auth/refresh", userrefresh);
//dash board
router.get("/auth/Dashboard",Dhashboard)

// Profile Routes
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

// Address Routes
router.get("/addresses", auth, getAddresses);
router.post("/addresses", auth, addAddress);
router.delete("/addresses/:id", auth, deleteAddress);

export default router;
