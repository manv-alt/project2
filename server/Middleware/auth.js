 // Middleware/auth.js
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers && req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No authorization header" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
