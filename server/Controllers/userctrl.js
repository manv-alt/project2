import dotenv from "dotenv";
dotenv.config();
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { loginSchema, signupvalid, } from "../validator/authvalid.js";
import UserModel from "../Models/Registermodel.js";
import AddressModel from "../Models/Address.js";
import nodemailer from "nodemailer";
import tempotp from "../Models/TempOtpModel.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const register = async (req, res) => {
  try {
    const validatedData = signupvalid.parse(req.body);
    const { name, email, password, gender } = validatedData;

    const useremail = await UserModel.findOne({ email });
    if (useremail) {
      return res.status(400).json({ msg: "This email is already registered" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await tempotp.deleteOne({email})
  await tempotp.create({
    name,
    email,
    password: hashedPassword,
    gender,
    otp,
    otpExpiry: Date.now() + 5 * 60 * 1000,
  });
     
    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Verify your account",
      text: `Hi ${name},\nYour OTP is: ${otp}\nValid for 5 minutes.`,
    });
    const io = req.app.get("io");
    io.emit("dashboardUpdate");

    res.status(201).json({
      msg: "Otp sent successfully",
      email,
    });
    console.log(req.body);

  } catch (error) {
    console.error("REGISTER ERROR ", error);
    if (error.name === "ZodError") {
      return res.status(400).json({
        msg: error.errors[0].message,
      });
    }
  }
};
//===verify otp==//
const verifyotp = async (req, res) => {
  try {
    const {  otp,email } = req.body;
    const tempuser = await tempotp.findOne({ email })
    if (!tempuser) return res.status(400).json({ msg: "User not found" })
    if (tempuser.isVerified) return res.status(400).json({ msg: "User already verified" })
    if (tempuser.otp !== otp)
      return res.status(400).send("Invalid OTP");
    if (tempuser.otpExpiry < Date.now())
      return res.status(400).send("OTP expired");
  
  const user = await UserModel.create({
        name: tempuser.name,
        email: tempuser.email,
        password: tempuser.password,
        gender: tempuser.gender,
        isVerified: true,
      })
     
     
    res.status(200).json({ msg: "Email verified successfully", user });
  
  } catch (error) {
    console.error("VERIFY OTP ERROR", error);
    res.status(500).json({ msg: error.message });
  }
}
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await tempotp.findOne({ email });
     if (!user)
      return res
        .status(404)
        .json({ msg: "Signup session expired. Register again." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Resend OTP",
      html: `<h3>Hello ${user.name}</h3><p>Your new OTP:</p><h2>${otp}</h2><p>Valid for 5 minutes</p>`,
    });

    res.json({ msg: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to resend OTP" });
  }
};

const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Incorrect password" });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite:"none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    res.status(200).json({
      msg: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR ", error);
    if (error.name === "ZodError") {
      return res.status(400).json({
        msg: error.errors[0].message,
      });
    }
    res.status(500).json({ msg: error.message });
  }
};


const userrefresh = async (req, res) => {
  try {
    const refreshToken =  req.cookies.refreshToken;
     if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    const user = await UserModel.findById(decoded.id).select("-password");
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ msg: "Invalid session" });
    }

    const newAccessToken = jwt.sign(
      { id: user._id,email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      accessToken: newAccessToken,
      user,
    });
  } catch (error) {
    console.error("Refresh error:", error.message);
    res.status(401).json({ msg: "Session expired" });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await UserModel.updateOne(
        { refreshToken },
        { $set: { refreshToken: null } }
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Logout failed" });
  }
}
// Profile Management Functions
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId)
      .select("-password -refreshToken -otp -otpExpiry")
      .populate("addresses");
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error("GET PROFILE ERROR", error);
    res.status(500).json({ msg: "Failed to get profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, profileImage } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (profileImage) updateData.profileImage = profileImage;
    
    const user = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -refreshToken -otp -otpExpiry");
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    res.status(200).json({ msg: "Profile updated successfully", user });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR", error);
    res.status(500).json({ msg: "Failed to update profile" });
  }
};

// Address Management Functions
const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await AddressModel.find({ user: userId }).sort({ createdAt: -1 });
    
    res.status(200).json({ addresses });
  } catch (error) {
    console.error("GET ADDRESSES ERROR", error);
    res.status(500).json({ msg: "Failed to get addresses" });
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { street, city, state, zip, country, type } = req.body;
    
    // Validate required fields
    if (!street || !city || !state || !zip || !country) {
      return res.status(400).json({ msg: "All address fields are required" });
    }
    
    const address = await AddressModel.create({
      user: userId,
      street,
      city,
      state,
      zip,
      country,
      type: type || "home"
    });
    
    // Add address reference to user
    await UserModel.findByIdAndUpdate(userId, {
      $push: { addresses: address._id }
    });
    
    res.status(201).json({ msg: "Address added successfully", address });
  } catch (error) {
    console.error("ADD ADDRESS ERROR", error);
    res.status(500).json({ msg: "Failed to add address" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const address = await AddressModel.findOne({ _id: id, user: userId });
    
    if (!address) {
      return res.status(404).json({ msg: "Address not found" });
    }
    
    // Remove address reference from user
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { addresses: id }
    });
    
    await AddressModel.findByIdAndDelete(id);
    
    res.status(200).json({ msg: "Address deleted successfully" });
  } catch (error) {
    console.error("DELETE ADDRESS ERROR", error);
    res.status(500).json({ msg: "Failed to delete address" });
  }
};

// === FORGOT PASSWORD === //
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Email not registered" });
    }

    // Generate 6 digit OTP
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOTPExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    user.resetOTP = resetOTP;
    user.resetOTPExpiry = resetOTPExpiry;
    await user.save();

    // Send OTP via email
    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>Your OTP for resetting password is:</p>
          <h1 style="color: #16a34a; letter-spacing: 5px;">${resetOTP}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ msg: "OTP sent successfully to your email", email });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR", error);
    res.status(500).json({ msg: "Failed to send OTP" });
  }
};

// === VERIFY RESET OTP === //
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ msg: "Email and OTP are required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.resetOTP !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ msg: "OTP has expired" });
    }

    res.status(200).json({ msg: "OTP verified successfully" });
  } catch (error) {
    console.error("VERIFY RESET OTP ERROR", error);
    res.status(500).json({ msg: "Failed to verify OTP" });
  }
};

// === RESET PASSWORD === //
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ msg: "Email and new password are required" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.status(200).json({ msg: "Password reset successfully" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR", error);
    res.status(500).json({ msg: "Failed to reset password" });
  }
};

export { register, verifyotp, resendOtp, login, userrefresh, logout, getProfile, updateProfile, getAddresses, addAddress, deleteAddress, forgotPassword, verifyResetOTP, resetPassword };
