import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      console.log("ZOD ERROR 👉", err.issues); // ✅ FIXED
      return res.status(400).json({
        message: "Validation failed",
        errors: err.issues,
      });
    }

    console.error("UNKNOWN ERROR 👉", err);
    return res.status(500).json({ message: "Server error" });
  }
};
