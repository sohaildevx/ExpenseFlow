import { Router } from "express";
import { createUser, loginUser, getCurrentUser, logOutUser, resetPassOtp, verifyResetOtp, resetPassword, verifyEmail, resendVerificationOtp } from "../controllers/user.controllers.js";
import { body } from "express-validator";
import {authToken} from "../middleware/auth.js";

const router = Router();

router.post('/register',[
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').trim()
],
    createUser);

router.post('/login',[
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required').trim(),
],
    loginUser
)

router.post('/send-reset-otp',[
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
],resetPassOtp);

router.post('/verify-reset-otp',[
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('otp').notEmpty().withMessage('OTP is required').trim(),
],verifyResetOtp);

router.post('/reset-password',[
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('otp').notEmpty().withMessage('OTP is required').trim(),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').trim()
],resetPassword);

router.post('/verify-email',[
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('otp').notEmpty().withMessage('OTP is required').trim(),
],verifyEmail);

router.post('/resend-verification-otp',[
    body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
],resendVerificationOtp);

router.get('/getCurrentUser',authToken,getCurrentUser);
router.post('/logout',authToken,logOutUser);


export default router;