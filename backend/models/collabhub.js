import mongoose from "mongoose";
// Schema for Collab Hub
const collabHubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  uniqueLink: { type: String, required: true, unique: true },
  image: { type: String, default: "" }, // Image of the collab hub
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  links: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Link",
    },
  ],
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["pending", "approved"],
        default: "pending",
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const CollabHub = mongoose.model("CollabHub", collabHubSchema);

export default CollabHub;
