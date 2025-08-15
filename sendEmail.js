import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export async function sendOTP(toEmail, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    // console.log removed
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw error;
  }
}
