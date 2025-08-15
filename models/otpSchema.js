import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true }, // store as string
    createdAt: { type: Date, default: Date.now, expires: 300 }, // auto-delete in 5 min
  },
  { versionKey: false }
);

// Force collection name 'otps' to avoid surprises
export default mongoose.model("OTP", otpSchema, "otps");
