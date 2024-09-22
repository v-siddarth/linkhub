import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiration: { type: Date, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const otpModel = mongoose.model("OTP", otpSchema);

export default otpModel;
