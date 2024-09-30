import mongoose from "mongoose";

// Schema for Link
const linkSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String, default: null }, // URL for the cover image

  startDate: { type: Date, default: null }, // Optional start date for scheduling
  endDate: { type: Date, default: null }, // Optional end date for scheduling
  clicks: { type: Number, default: 0 }, // New field to track clicks

  createdAt: { type: Date, default: Date.now },
});

const Link = mongoose.model("Link", linkSchema);

export default Link;
