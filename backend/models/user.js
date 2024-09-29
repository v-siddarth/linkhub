import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
    // minlength: 6,
    // validate: {
    //   validator: (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password),
    //   message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    // }
  },
  profileImgUrl: {
    type: String,
    default: "", // default placeholder image URL
  },
  profileLink: {
    type: String,
    default: "", // default placeholder profile link URL
  },
  qrprofileLink: {
    type: String,
    default: "", // default placeholder QR profile link URL
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the Category model
    },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;
