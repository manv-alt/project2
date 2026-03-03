import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const { verifyotp, resendOtp, loading, error, otpVerified, setLoginModalOpen } = useAuth(); // Added setLoginModalOpen to control login modal from OTP verification

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  /*  PAGE PROTECTION */
  useEffect(() => {
    if (!email) {
      navigate("/");
    }
  }, [email, navigate]);

  /*  AFTER OTP VERIFIED */
  useEffect(() => {
    if (otpVerified) {
      toast.success("OTP verified successfully. Please login.");
      setLoginModalOpen(true);
      navigate("/");
    }
  }, [otpVerified, setLoginModalOpen, navigate]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    if (!value && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
    
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return;

    await verifyotp(email, otpValue);
  };

  const handleResend = async () => {
    await resendOtp(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-sm sm:max-w-md rounded-2xl shadow-xl">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">
              Enter verification code
            </h2>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to your email.
            </p>
          </div>

          <div className="space-y-3">
            <p className="font-medium">Verification code</p>

            <div className="flex gap-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  maxLength={1}
                  onChange={(e) =>
                    handleChange(e.target.value, index)
                  }
                  
                  className="h-14 w-14 text-center text-xl font-semibold rounded-xl"
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">
                {error}
              </p>
            )}
          </div>

          <Button
            className="w-full h-12 text-base rounded-xl bg-green-600 hover:bg-green-700"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Didn’t receive the code?{" "}
            <span
              className="underline cursor-pointer text-foreground"
              onClick={handleResend}
            >
              Resend
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtp;
