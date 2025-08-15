import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginSuccess } from "../features/authSlice";
import axios from "axios";
import "./AuthForm.css";

const API = "http://localhost:5000";

export default function OTPAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const normEmail = (e) => String(e || "").trim().toLowerCase();

  const handleSendOtp = async () => {
  try {
    setLoading(true);
    await axios.post(`${API}/api/auth/send-otp`, {
      email: normEmail(email),
    });
    setStep(2);
    alert("OTP sent! Check your email.");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "Failed to send OTP.");
  } finally {
    setLoading(false);
  }
};

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API}/api/auth/verify-otp`, {
        email: normEmail(email),
        otp: String(otp || "").trim(), // keep as string
        name: String(name || "").trim(),
        age,
        password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      navigate("/expense");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">ExpenseTracker Pro</h1>

        {step === 1 ? (
          <>
            <h2 className="auth-subtitle">Create your account</h2>
            <input
              className="auth-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password (set now)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="auth-btn" onClick={handleSendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <p className="auth-footer">
              Already signed up? <Link to="/login">Login here</Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="auth-subtitle">Verify OTP</h2>
            <input
              className="auth-input"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              className="auth-input"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="auth-input"
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            <button className="auth-btn" onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button className="auth-btn secondary" onClick={handleSendOtp} disabled={loading} style={{ marginTop: 8 }}>
              Resend OTP
            </button>
          </>
        )}
      </div>
    </div>
  );
}
