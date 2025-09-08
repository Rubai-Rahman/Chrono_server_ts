import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g. "smtp.gmail.com"
  port: Number(process.env.SMTP_PORT) || 587, // 465 (SSL) or 587 (TLS)
  secure: false, // true if port = 465
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email app password
  },
});
