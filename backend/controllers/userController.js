import { sendOTPEmail } from "../helpers/email_sender.js";
import otpModel from "../models/otp.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const SECRET = "PILLAI";

export const signup = async (req, res) => {
  const { email, username, password } = req.body;
  console.log("someone hitting : " + email + " " + password);
  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.json({
        message: "User already exists",
      });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = Date.now() + 10 * 60 * 1000;

    // Store OTP with user data (password stored temporarily)
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password before storing
    await otpModel.create({
      email,
      otp,
      expiration: otpExpiration,
      password: hashedPassword,
      username,
    });
    // console.log("otp for mail is " + otp + " " + email);
    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP sent to your email. Please verify to complete signup.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json({ message: "user not found" });
    }
    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      return res.status(404).json({ message: "invalid credetails" });
    }
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      SECRET,
      {
        expiresIn: "30d",
      }
    );
    res.status(201).json({ user: existingUser, token: token });
  } catch (error) {}
};
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpEntry = await otpModel.findOne({ email, otp });
    if (!otpEntry) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (Date.now() > otpEntry.expiration) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP is valid, create the user using stored password
    const result = await User.create({
      email: email,
      password: otpEntry.password, // Use the stored hashed password
      username: otpEntry.username,
      profileLink: `http://localhost:3000/${otpEntry.username}`,
    });

    const token = jwt.sign({ email: result.email, id: result._id }, SECRET);

    // Delete OTP after verification
    await otpModel.deleteOne({ email: email });

    res.status(201).json({ user: result, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const otpEntry = await otpModel.findOne({ email: email });
    if (!otpEntry) {
      return res
        .status(400)
        .json({ message: "No OTP request found for this email" });
    }

    // Generate a new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiration = Date.now() + 10 * 60 * 1000; // 10-minute expiration

    // Update the OTP and expiration in the database
    otpEntry.otp = newOtp;
    otpEntry.expiration = newExpiration;
    await otpEntry.save();

    // Send the new OTP via email
    await sendOTPEmail(email, newOtp);

    res.status(200).json({ message: "A new OTP has been sent to your email" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to resend OTP. Please try again." });
  }
};
export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  const user = User.findOne(username);
};
