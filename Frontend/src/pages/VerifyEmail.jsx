import React, { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { MdEmail } from "react-icons/md";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromSignup = location.state?.email || "";

  const [email, setEmail] = useState(emailFromSignup);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const { verifyEmail, resendVerificationOtp } = useAuth();

  const inputRefs = useRef([]);

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
      if (index < 6) newOtpValues[index] = char;
    });
    setOtpValues(newOtpValues);
    const lastIndex = Math.min(pasteData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    const otp = otpValues.join("");
    if (otp.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyEmail(email, otp);
      if (response.success) {
        toast.success(response.message || "Email verified successfully!");
        setIsVerified(true);
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to verify email");
      toast.error(error.response?.data?.message || "Failed to verify email");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      const response = await resendVerificationOtp(email);
      if (response.success) {
        toast.success(response.message || "OTP resent successfully!");
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend OTP");
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        <div className="p-2 md:p-4">
          <Link to="/">
            <h1 className="font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tight text-black rounded-2xl bg-yellow-400 inline-block px-2 py-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer">
              ExpenseFlow
            </h1>
          </Link>
        </div>
        <div className="flex justify-center items-center px-4 py-6 flex-1">
          <div className="flex flex-col w-full max-w-md p-6 md:p-8 border-8 border-black bg-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <h2 className="text-2xl md:text-3xl font-black uppercase mb-4 border-b-4 border-black pb-3">
              Email Verified!
            </h2>
            <p className="font-bold mb-6">Your email has been verified successfully. You can now login.</p>
            <Link
              to="/login"
              className="bg-black text-yellow-400 font-black text-xl uppercase py-3 px-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <div className="p-2 md:p-4">
        <Link to="/">
          <h1 className="font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tight text-black rounded-2xl bg-yellow-400 inline-block px-2 py-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer">
            ExpenseFlow
          </h1>
        </Link>
      </div>
      <div className="flex justify-center items-center px-4 py-6 flex-1">
        <form
          onSubmit={handleVerify}
          className="flex flex-col w-full max-w-md p-6 md:p-8 border-8 border-black bg-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <h2 className="text-2xl md:text-3xl font-black uppercase text-center mb-4 border-b-4 border-black pb-3">
            Verify Your Email
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500 border-4 border-black text-white font-bold text-center uppercase text-sm">
              {error}
            </div>
          )}

          <p className="text-center font-bold uppercase text-sm mb-4 tracking-tight">
            Enter 6-digit OTP sent to
          </p>

          <div className="relative mb-4">
            <MdEmail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-2 py-2 border-4 border-black text-sm font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-white placeholder:text-gray-400"
              placeholder="Email"
              disabled={!!emailFromSignup}
              required
            />
          </div>

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
            className="bg-black text-yellow-400 font-black text-xl md:text-2xl uppercase py-3 px-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all mb-4 select-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="bg-white text-black font-bold text-sm uppercase py-2 px-4 border-4 border-black hover:bg-black hover:text-yellow-400 transition-colors mb-4 disabled:opacity-50"
          >
            Resend OTP
          </button>

          <Link
            to="/login"
            className="text-center font-bold uppercase text-sm border-4 border-black bg-stone-100 py-2 hover:bg-black hover:text-yellow-400 transition-colors"
          >
            ← Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
