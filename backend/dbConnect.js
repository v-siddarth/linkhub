import mongoose from "mongoose";
const dbURI =
  "mongodb+srv://20sdev:vijay207@cluster0.hsy4w.mongodb.net/linkhub?retryWrites=true&w=majority";

export const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(dbURI);
    console.error("Failed to connect to MongoDB", err.message);
    process.exit(1);
  }
};
