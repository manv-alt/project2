// validators/auth.schema.js
import { z } from "zod";
const loginSchema = z.object({
     email: z.string().email(),
    password: z
    .string()
    .min(6)
    
})
const signupvalid = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string()
    .min(6)
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
    gender: z.enum(["male", "female", "other"]),

})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export { loginSchema, signupvalid };