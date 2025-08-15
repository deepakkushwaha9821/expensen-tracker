// backend/otpMailer.js
import nodemailer from "nodemailer";

export async function sendOtpEmail(toEmail, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // from .env
      pass: process.env.EMAIL_PASS, // from .env
    },
  });

  const mailOptions = {
    from: `"OTP Auth" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
}
