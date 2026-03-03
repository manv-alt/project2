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
import { useState } from "react";
import SignupModal from "./Signupmodal";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Loginmodal = () => {
  // Updated to use global modal states from AuthContext instead of local state for cross-component modal control
  const {login,loading,error, loginModalOpen, setLoginModalOpen, signupModalOpen, setSignupModalOpen}=useAuth()
  const[form,setForm]=useState({
    email:"",
    password:""
  })
  const handlechange=(e)=>{
    setForm({...form,[e.target.name]:e.target.value})
  }
  const handleLogin=async()=>{
     const success = await login(form);
    if (success)
       setLoginModalOpen(false);
     
  }
  return (
    <>
      {/* LOGIN DIALOG */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogTrigger asChild>
          <Button  className="bg-green-500">Login</Button>
        </DialogTrigger>

        <DialogContent className="w-[95%] sm:max-w-md rounded-xl bg-white">
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-2xl font-semibold">
              Welcome Back 👋
            </DialogTitle>
            <DialogDescription>
              Login to your account to continue
            </DialogDescription>
          </DialogHeader>
 <div className="mt-6 space-y-5">
          
          <div className="mt-6 space-y-5">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input name="email" type="email" className="h-11" placeholder="you@example.com" value={form.email}onChange={handlechange}/>
            </div>

            <div className="space-y-1">
              <Label>Password</Label>
              <Input name="password"type="password" className="h-11" 
              value={form.password}
              onChange={handlechange}/>
            </div>

            <Button className="w-full h-11 bg-green-500"onClick={handleLogin}
            disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>

          {/* OPEN SIGNUP */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <span
              className="text-primary hover:underline cursor-pointer"
              onClick={() => {
                setLoginModalOpen(false);
                setSignupModalOpen(true);
              }}
            >
              Sign up
            </span>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SIGNUP MODAL */}
      <SignupModal open={signupModalOpen} onOpenChange={setSignupModalOpen} />
     </>
  );
};

export default Loginmodal;
