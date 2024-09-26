import nodemailer from "nodemailer";
import crypto from "crypto";

// Function to generate a random OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Function to send OTP via email
export const sendOTPEmail = async (email, otp) => {
  console.log("Otp and email : " + otp + " " + email);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "onlyaddy68@gmail.com", // Replace with your email
      pass: "swjqeaqnpmglpcml", // Replace with your email password or app password
    },
  });

  const mailOptions = {
    from: "onlyaddy68@gmail.com", // Sender address
    to: email,
    subject: "Your OTP for Signup",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  return transporter.sendMail(mailOptions);
};
