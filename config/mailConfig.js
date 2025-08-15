// backend/config/mailConfig.js
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // sender email from env
    pass: process.env.EMAIL_PASS  // app password from env
  }
});
