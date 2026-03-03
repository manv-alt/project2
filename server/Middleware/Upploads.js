import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads folder if not exists
const uploadPath = "uploads/";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024, // ✅ 10MB limit
  },
});

export default upload;