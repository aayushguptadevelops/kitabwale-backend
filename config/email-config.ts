import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error(
      "Gmail service is not ready to send the email. Please check the email configuration.",
    );
  } else {
    console.log("Gmail service is ready to send the email.");
  }
});

const sendEmail = async (to: string, subject: string, body: string) => {
  await transporter.sendMail({
    from: `"KitabWale" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: body,
  });
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const html = `
    <h1>Welcome to KitabWale! Verify your Email</h1>
    <p>Thank you for registering. Please click link below to verify your email address:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>If you didn't request this or have already verified, please ignore this email.</p>
  `;

  await sendEmail(
    to,
    "Please Verify Your Email to Access your KitabWale Account",
    html,
  );
};

export const sendResetPasswordLinkToEmail = async (
  to: string,
  token: string,
) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const html = `
    <h1>Welcome to KitabWale! Reset your Password</h1>
    <p>You have requested to reset your password. Click on the link below to set a new password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
  `;

  await sendEmail(to, "Please Reset your KitabWale Account Password", html);
};
