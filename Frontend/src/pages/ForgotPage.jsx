import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const ForgotPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const { resetPassOtp, verifyResetOtp, resetPassword } = useAuth();
  
  const inputRefs = useRef([]);

  
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassOtp(email);
      if (response.success) {
        setIsEmailSent(true);
        toast.success(response.message || "OTP sent successfully!");
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send OTP");
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };


  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    
    if (!/^\d*$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && e.target.value === "") {
      inputRefs.current[index - 1]?.focus();
    }
  };

 
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").replace(/\D/g, "").slice(0, 6).split("");
    const newOtpValues = [...otpValues];
    
    pasteData.forEach((char, index) => {
      if (index < 6) {
        newOtpValues[index] = char;
      }
    });
    
    setOtpValues(newOtpValues);
    
   
    const lastIndex = Math.min(pasteData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

 
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    
    const otp = otpValues.join("");
    
    if (otp.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyResetOtp(email, otp);
      if (response.success) {
        toast.success(response.message || "OTP verified successfully!");
        setIsOtpVerified(true);
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to verify OTP");
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

 
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!password ) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const otp = otpValues.join("");
      const response = await resetPassword(email, otp, password);
      if(response.success){
        toast.success(response.message || "Password reset successful!");
        navigate("/login");
      }else{
        setError(response.message || "Failed to reset password");
        toast.error(response.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError(error.response?.data?.message || "Failed to reset password");
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-120px)] px-4 py-12 bg-stone-100 h-screen">
      <form 
        onSubmit={!isEmailSent ? handleSendOtp : !isOtpVerified ? handleVerifyOtp : handleResetPassword}
        className="flex flex-col w-full max-w-md p-6 md:p-8 border-8 border-black bg-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
      >
        <h2 className="text-2xl md:text-3xl font-black uppercase text-center mb-6 border-b-4 border-black pb-3">
          {!isEmailSent ? "Reset Password" : !isOtpVerified ? "Enter OTP" : "New Password"}
        </h2>

        
        {error && (
          <div className="mb-4 p-3 bg-red-500 border-4 border-black text-white font-bold text-center uppercase text-sm">
            {error}
          </div>
        )}

       
        {!isEmailSent && (
          <>
            <label
              htmlFor="email"
              className="text-black text-lg md:text-xl font-black uppercase mb-2 tracking-tight"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-6 p-3 border-4 border-black text-base font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white placeholder:text-gray-400"
              placeholder="Enter Your Email"
              required
              disabled={loading}
            />

            <button
              type="submit"
              className="bg-black text-yellow-400 font-black text-xl md:text-2xl uppercase py-3 px-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        
        {isEmailSent && !isOtpVerified && (
          <>
            <p className="text-center font-bold uppercase text-sm mb-4 tracking-tight">
              Enter 6-digit OTP sent to<br />
              <span className="text-black underline decoration-4 decoration-black">{email}</span>
            </p>

            <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={value}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 md:w-14 md:h-14 text-center text-2xl font-black border-4 border-black bg-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow uppercase"
                  disabled={loading}
                />
              ))}
            </div>

            <button
              type="submit"
              className="bg-black text-yellow-400 font-black text-xl md:text-2xl uppercase py-3 px-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all mb-4 select-none disabled:opacity-50"
              disabled={loading}
            >
              Verify OTP
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEmailSent(false);
                setOtpValues(["", "", "", "", "", ""]);
                setError("");
              }}
              className="bg-white text-black font-bold text-sm uppercase py-2 px-4 border-4 border-black hover:bg-black hover:text-yellow-400 transition-colors"
            >
              ← Change Email
            </button>
          </>
        )}

        
        {isOtpVerified && (
          <>
            <label
              htmlFor="password"
              className="text-black text-lg md:text-xl font-black uppercase mb-2 tracking-tight"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 p-3 border-4 border-black text-base font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white placeholder:text-gray-400"
              placeholder="Enter New Password"
              required
              disabled={loading}
            />

            <button
              type="submit"
              className="bg-black text-yellow-400 font-black text-xl md:text-2xl uppercase py-3 px-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all select-none disabled:opacity-50"
              disabled={loading}
              onClick={handleResetPassword}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        <Link
          to="/login"
          className="text-center mt-6 font-bold uppercase text-sm border-4 border-black bg-stone-100 py-2 hover:bg-black hover:text-yellow-400 transition-colors"
        >
          ← Back to Login
        </Link>
      </form>
    </div>
  );
};

export default ForgotPage;