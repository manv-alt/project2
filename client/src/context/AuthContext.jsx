import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🔥 important
  const [error, setError] = useState(null);
const [otpVerified, setOtpVerified] = useState(false);
  // Added global modal states for login and signup modals to enable cross-component modal control
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  /*  
     AUTO LOGIN (on refresh / reopen)
       */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get("/auth/refresh"); // refresh token used here
        localStorage.setItem("accessToken", res.data.accessToken);
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

   const login = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.post("/auth/login", data);
      localStorage.setItem("accessToken", res.data.accessToken);
        toast.success("Logged in successfully");
      setUser(res.data.user);
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || "Login failed";

      if (errorMsg === "Incorrect password") {
        toast.error("Incorrect password. Please try again.");
      } else if (errorMsg.includes("ZodError") || err.response?.status === 400) {
        toast.error("Invalid input data.");
      } else {
        toast.error(errorMsg);
      }

      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };
const verifyotp = async (email,otp) => {
  try {
    setLoading(true);
    setError(null);
    await api.post("/auth/verifyotp",{email,otp})
    setOtpVerified(true);
    return true;
  } catch (error) {
          setError(error.response?.data?.msg || "Login failed");
return false;
  }finally {
    setLoading(false);
  }
}
const resendOtp = async (email) => {
  try {
     setLoading(true);
     setError(null);

    await api.post("/auth/resendotp", { email });

    return true;
  } catch (err) {
     setError(
      err.response?.data?.msg || "Failed to resend OTP"
    );
    return false;
  } finally {
    setLoading(false);
  }
};

   const signup = async (data) => {
    try {
      setLoading(true);
      setError(null);

      await api.post("/auth/signup", data);
     
      return true;
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

   const logout = async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully");
    setUser(null);
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setUser(res.data.user);
      return res.data.user;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };


  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, signup, logout,verifyotp,resendOtp,otpVerified, loginModalOpen, setLoginModalOpen, signupModalOpen, setSignupModalOpen, fetchProfile, setUser }}
    >

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
