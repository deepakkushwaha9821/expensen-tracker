import express from "express";
import {  login } from "../controllers/authController.js"; // Import from controller
import { sendOtpEmail } from '../utils/otpMailer.js';

const router = express.Router();


router.post("/login", login);   // Use the imported login function


router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

  await sendOtpEmail(email, otp);
  res.json({ success: true, message: 'OTP sent successfully!' });
});

export default router;
