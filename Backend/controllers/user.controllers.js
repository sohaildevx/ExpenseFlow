import User from "../model/user.model.js";
import { validationResult } from "express-validator";
import { generateToken, setTokenCookie } from "../utils/jsonAuth.js";
import { sendMail } from "../config/nodeMailer.js";
import { resetPasswordTemplate } from "../config/EmailTemplate.js";
import crypto from "crypto";
import {emailVerificationTemplate} from "../config/EmailTemplate.js"
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => ({ ...e, value: undefined })) });
  }

  const { name, email, password, userType } = req.body;

  if(!userType || !['transport','simple'].includes(userType)){
    return  res.status(400).json({ message: "User must be either 'transport' or 'simple'" });
  }

  try {
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password, userType });

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    try {
      await sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Verify Your Email - ExpenseFlow",
        html: emailVerificationTemplate(otp),
      });
    } catch (mailError) {
      console.error("Failed to send verification email:", mailError.message);
      return res.status(201).json({ message: "Account created but verification email failed. Please use Resend OTP.", email: user.email });
    }

    return res
      .status(201)
      .json({ message: "Account created. Please verify your email.", email: user.email });
  } catch (error) {
    console.error("Create user error:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Email not verified", email: user.email, needsVerification: true });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = {
      email: user.email,
      id: user._id,
      userType: user.userType,
    };

    const token = generateToken(payload);
    setTokenCookie(res, token);

    return res
      .status(200)
      .json({ message: "Login successful", user: { name: user.name, email: user.email, id: user._id, userType: user.userType } });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select(
      "-password -verifyOtp -resetOtp -__v"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({user: {
    id: user._id,
    name: user.name,
    email: user.email,
    userType: user.userType,
    createdAt: user.createdAt
  } });
  } catch (error) {
    console.error("Get user error:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const logOutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const resetPassOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "If user exists, OTP sent to email" });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: resetPasswordTemplate.replace("{{OTP_CODE}}", otp),
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Send reset OTP error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const verifyResetOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp === "") {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }

    if (user.resetOtpExpiry < Date.now()) {
      user.resetOtp = "";
      user.resetOtpExpiry = 0;
      await user.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify reset OTP error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp === "") {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }

    if (user.resetOtpExpiry < Date.now()) {
      user.resetOtp = "";
      user.resetOtpExpiry = 0;
      return res.status(400).json({ message: "Otp Expired" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    user.password = newPassword;
    user.resetOtp = "";
    user.resetOtpExpiry = 0;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

const verifyEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    if (!user.verifyOtp || user.verifyOtp === "") {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }

    if (user.verifyOtpExpiry < Date.now()) {
      user.verifyOtp = "";
      user.verifyOtpExpiry = 0;
      await user.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.verifyOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isEmailVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiry = 0;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const resendVerificationOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify Your Email - ExpenseFlow",
      html: emailVerificationTemplate(otp),
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Resend verification OTP error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const googleLogin = async (req, res) => {
  const { credential, userType } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "Google credential is required" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture) user.avatar = picture;
        await user.save();
      }
    } else {
      if (!userType || !['transport', 'simple'].includes(userType)) {
        return res.status(400).json({ message: "Please select a user type (transport or simple)" });
      }

      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        isEmailVerified: true,
        userType,
      });
    }

    const tokenPayload = {
      email: user.email,
      id: user._id,
      userType: user.userType,
    };

    const token = generateToken(tokenPayload);
    setTokenCookie(res, token);

    return res.status(200).json({
      message: "Google login successful",
      user: {
        name: user.name,
        email: user.email,
        id: user._id,
        userType: user.userType,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google login error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export {
  createUser,
  loginUser,
  getCurrentUser,
  logOutUser,
  resetPassOtp,
  verifyResetOtp,
  resetPassword,
  verifyEmail,
  resendVerificationOtp,
  googleLogin,
};
