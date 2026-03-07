import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import SignupModal from "./Signupmodal";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Loginmodal = () => {
  const navigate = useNavigate();
  const { 
    login, 
    loading, 
    error, 
    loginModalOpen, 
    setLoginModalOpen, 
    signupModalOpen, 
    setSignupModalOpen,
    pendingAction,
    clearPendingAction
  } = useAuth();
  
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const result = await login(form);
    
    if (result) {
      setLoginModalOpen(false);
      setForm({ email: "", password: "" });
      
      // Handle pending action after successful login
      if (result.action) {
        const { action, actionData } = result;
        
        switch (action) {
          case "shopNow":
            navigate("/products");
            break;
          case "addToCart":
            // Trigger add to cart after login - we'll dispatch a custom event
            window.dispatchEvent(new CustomEvent("afterLoginAddToCart", { detail: actionData }));
            break;
          case "checkout":
            navigate("/checkout");
            break;
          case "viewCart":
            // Open cart - dispatch event
            window.dispatchEvent(new CustomEvent("openCartAfterLogin"));
            break;
          default:
            break;
        }
      }
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!loginModalOpen) {
      setForm({ email: "", password: "" });
    }
  }, [loginModalOpen]);

  return (
    <>
      {/* LOGIN DIALOG */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-500 hover:bg-green-600">Login</Button>
        </DialogTrigger>

        <DialogContent className="w-[95%] sm:max-w-md rounded-xl bg-white">
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-2xl font-semibold">
              Welcome Back 👋
            </DialogTitle>
            <DialogDescription>
              Login to continue your shopping
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input 
                name="email" 
                type="email" 
                className="h-11" 
                placeholder="you@example.com" 
                value={form.email} 
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Password</Label>
              <Input 
                name="password" 
                type="password" 
                className="h-11" 
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button 
              type="submit"
              className="w-full h-11 bg-green-500 hover:bg-green-600"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* FORGOT PASSWORD LINK */}
          <div className="mt-4 text-center">
            <span
              className="text-sm text-green-600 hover:underline cursor-pointer font-medium"
              onClick={() => {
                setLoginModalOpen(false);
                setForgotPasswordOpen(true);
              }}
            >
              Forgot Password?
            </span>
          </div>

          {/* OPEN SIGNUP */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <span
              className="text-green-600 hover:underline cursor-pointer font-medium"
              onClick={() => {
                setLoginModalOpen(false);
                setSignupModalOpen(true);
              }}
            >
              Sign up
            </span>
          </div>
        </DialogContent>
      </Dialog>

      {/* SIGNUP MODAL */}
      <SignupModal open={signupModalOpen} onOpenChange={setSignupModalOpen} />

      {/* FORGOT PASSWORD MODAL */}
      <ForgotPasswordModal open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </>
  );
};

export default Loginmodal;

