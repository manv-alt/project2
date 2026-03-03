import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react"; // Added icons for enhanced UI/UX
import { toast } from "sonner";

const SignupModal = ({ open, onOpenChange }) => {
   const { signup, loading, error } = useAuth();
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // Added for password visibility toggle - enhances UX by allowing users to see/hide password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Added for confirm password visibility toggle

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for the field being changed
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Invalid email format";
    if (!form.gender) errors.gender = "Gender is required";
    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) errors.confirmPassword = "Confirm password is required";
    else if (form.password !== form.confirmPassword) errors.confirmPassword = "Passwords do not match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    const succes = await signup(form);
    if (succes) {
      toast.success("OTP sent to your email. Please verify.");
      onOpenChange(false)
       navigate("/VerifyOtp", {
        state: { email: form.email }

      })
    }
  };

return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] sm:max-w-sm rounded-xl shadow-lg border-0 bg-white/95 backdrop-blur-sm max-h-[95vh] flex flex-col p-0 overflow-hidden">
        
        {/* Fixed Header */}
        <DialogHeader className="p-6 pb-2 text-center">
          <DialogTitle className="text-2xl font-semibold">Create Account</DialogTitle>
          <p className="text-sm text-muted-foreground">Sign up to get started</p>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-200">
          {error && (
            <p className="text-sm text-red-500 text-center bg-red-50 py-2 rounded-md">{error}</p>
          )}

          {/* Name */}
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-gray-500">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                name="name"
                placeholder="John Doe"
                className={`h-10 pl-9 ${fieldErrors.name ? 'border-red-500' : ''}`}
                value={form.name}
                onChange={handleChange}
              />
            </div>
            {fieldErrors.name && <p className="text-[12px] text-red-500 leading-none">{fieldErrors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-gray-500">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                className={`h-10 pl-9 ${fieldErrors.email ? 'border-red-500' : ''}`}
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {fieldErrors.email && <p className="text-[12px] text-red-500 leading-none">{fieldErrors.email}</p>}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-gray-500">Gender</Label>
            <RadioGroup
              value={form.gender}
              onValueChange={(value) => setForm({ ...form, gender: value })}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="male" id="male" className="text-green-600 border-green-300" />
                <Label htmlFor="male" className="font-normal text-gray-700">Male</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="female" id="female" className="text-green-600 border-green-300" />
                <Label htmlFor="female" className="font-normal text-gray-700">Female</Label>
              </div>
            </RadioGroup>
            {fieldErrors.gender && <p className="text-[12px] text-red-500">{fieldErrors.gender}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-gray-500">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                className={`h-10 pl-9 pr-9 ${fieldErrors.password ? 'border-red-500' : ''}`}
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
           </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-gray-500">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className={`h-10 pl-9 pr-9 ${fieldErrors.confirmPassword ? 'border-red-500' : ''}`}
                value={form.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p className="text-[12px] text-red-500 leading-none">{fieldErrors.confirmPassword}</p>}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 pt-2">
          <Button
            className="w-full h-11 text-base font-medium bg-green-600 hover:bg-green-700"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Signup"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default SignupModal;
