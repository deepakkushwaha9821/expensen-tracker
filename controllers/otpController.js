import User from "../models/User.js";
import jwt from "jsonwebtoken";

let otpStore = {}; // in-memory store for OTPs

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min

  console.log(`OTP for ${email}: ${otp}`); // console log for testing

  res.json({ message: "OTP sent! Check backend console." });
};

export const verifyOtp = async (req, res) => {
  const { email, otp, name, age } = req.body;
  const record = otpStore[email];

  if (!record) return res.status(400).json({ error: "No OTP found" });
  if (record.expires < Date.now()) return res.status(400).json({ error: "OTP expired" });
  if (record.otp.toString() !== otp.toString()) return res.status(400).json({ error: "Invalid OTP" });

  // Delete OTP after verification
  delete otpStore[email];

  // Create or update user
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, name, age });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ user, token });
};
