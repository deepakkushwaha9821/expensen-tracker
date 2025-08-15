import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otpController.js";
const sendOTP = require('../sendEmail.js');

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); // random 6-digit OTP

  await sendOTP(email, otp);

  res.json({ success: true, otp }); // in real apps, don't send OTP back in response
});

export default router;
