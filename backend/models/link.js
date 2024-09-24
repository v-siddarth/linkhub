import mongoose from "mongoose";

// Schema for Link
const linkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Link = mongoose.model("Link", linkSchema);

export default Link;
