import cloudinary from "../helpers/cloudinary.js";
import Category from "../models/category.js";
import CollabHub from "../models/collabhub.js";

export const createCollabHub = async (req, res) => {
  const userId = req.userId;
  const { name, image } = req.body;

  try {
    // Generate unique link
    let uniqueLink = name.trim().toLowerCase().replace(/ /g, "-");
    const isUnique =
      (await CollabHub.findOne({ uniqueLink })) ||
      (await User.findOne({ username: uniqueLink }));
    if (isUnique) {
      return res.status(400).json({ message: "Collab name already exists" });
    }

    // Upload image to Cloudinary if provided
    let hubImage = "";
    if (image) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(
          image,
          { folder: "collab_hub_images" },
          (error, result) => {
            if (error) reject(new Error(error.message));
            else resolve(result);
          }
        );
      });
      hubImage = uploadResult.secure_url;
    }

    // Create default category "General"
    const defaultCategory = await Category.create({ name: "General" });

    // Create collab hub
    const collabHub = await CollabHub.create({
      name,
      uniqueLink,
      image: hubImage,
      owner: userId,
      categories: [defaultCategory._id],
    });

    res
      .status(201)
      .json({ message: "Collab hub created successfully", collabHub });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
