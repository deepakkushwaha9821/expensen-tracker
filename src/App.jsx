import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Pages
import Expensentrack from "./pages/Expensentrack";
import OTPAuth from "./pages/OTPAuth";
import Login from "./pages/Login";

export default function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Expense Dashboard */}
      <Route path="/expense" element={user ? <Expensentrack /> : <Navigate to="/otp" />} />

      {/* OTP Page */}
      <Route path="/otp" element={user ? <Navigate to="/expense" /> : <OTPAuth />} />

      {/* Login Page */}
      <Route path="/login" element={<Login />} />

      {/* Default route */}
      <Route path="/" element={<OTPAuth />} />
    </Routes>
  );
}
