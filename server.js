import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import OTP from "./models/otpSchema.js";
import User from "./models/User.js";
import { sendOTP } from "./sendEmail.js";



dotenv.config();
const app = express();

// --- Middleware ---
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

// --- DB ---
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// --- Utilities ---
const normalizeEmail = (e) => String(e || "").trim().toLowerCase();
const normalizeOtp = (o) => String(o || "").trim();

const signToken = (email) =>
  jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

// ---------- Routes ----------

// 1) Send OTP
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit

    const doc = await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() }, // refresh TTL
      { upsert: true, new: true }
    );
  await sendOTP(email, otp);
    // TODO: send via email/SMS here

    res.json({ success: true, message: "OTP generated" });
  } catch (err) {
    console.error("send-otp error:", err);
    res.status(500).json({ error: "Internal error generating OTP" });
  }
});

// 2) Verify OTP + Create/Update user
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    let { email, otp, name, age, password } = req.body;
    email = normalizeEmail(email);
    otp = normalizeOtp(otp);

    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    console.log(`📥 Verifying OTP for email: ${email}`);

    const otpDoc = await OTP.findOne({ email, otp });
   console.log("📤 Stored OTP doc found");

    if (!otpDoc) {
      // show what is stored for this email to help debug
      const allForEmail = await OTP.find({ email });
      console.log("🔎 Existing OTP docs for email:", allForEmail);
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const passwordHash = password ? await bcrypt.hash(String(password), 10) : undefined;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        name: name?.trim() || undefined,
        age: Number.isFinite(+age) ? +age : undefined,
        passwordHash,
      });
    } else {
      if (name) user.name = name.trim();
      if (Number.isFinite(+age)) user.age = +age;
      if (passwordHash) user.passwordHash = passwordHash;
    }
    await user.save();

    // Delete OTP after verification
    await OTP.deleteOne({ email });

    const token = signToken(email);
    res.json({ success: true, token, user });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ error: "Internal error verifying OTP" });
  }
});

// 3) Login (supports passwordHash OR legacy password)
app.post("/api/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    email = normalizeEmail(email);

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const storedHash = user.passwordHash || user.password || "";
    const match = await bcrypt.compare(String(password), storedHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken(email);
    res.json({ token, user });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Internal error during login" });
  }
});

// Health/debug (optional)
app.get("/api/auth/otps", async (req, res) => {
  const email = normalizeEmail(req.query.email || "");
  const docs = email ? await OTP.find({ email }) : await OTP.find().limit(20);
  res.json(docs);
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

