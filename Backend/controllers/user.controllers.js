import User from "../model/user.model.js";
import { validationResult } from "express-validator";
import { generateToken, setTokenCookie } from "../utils/jsonAuth.js";
import { sendMail } from "../config/nodeMailer.js";
import { resetPasswordTemplate } from "../config/EmailTemplate.js";
import crypto from "crypto";

const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, userType } = req.body;

  if(!userType || !['transport','simple'].includes(userType)){
    return  res.status(400).json({ message: "User must be either 'transport' or 'simple'" });
  }

  try {
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, userType });
    await user.save();

    return res
      .status(201)
      .json({ message: "User created successfully", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "User creation failed" });
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
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Password" });
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
    res.status(500).json({ message: "Failed to login" });
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
    return res.status(500).json({ message: "Failed to get current user" });
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
    return res.status(500).json({ message: "Failed to logout" });
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
      console.log(user);

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
    return res.status(500).json({ message: "Failed to send OTP" });
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

     console.log('Stored OTP:', user.resetOtp, 'Received OTP:', otp);
    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    user.password = newPassword;
    user.resetOtp = "";
    user.resetOtpExpiry = 0;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong while changing password" });
  }
};

export {
  createUser,
  loginUser,
  getCurrentUser,
  logOutUser,
  resetPassOtp,
  resetPassword,
};
