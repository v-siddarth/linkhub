import mongoose from "mongoose";

// Schema for Category
const categorySchema = new mongoose.Schema({
  name: { type: String, default: "General" }, // Default category is "General"
  links: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Link", // Reference to the Link model
    },
  ],
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
