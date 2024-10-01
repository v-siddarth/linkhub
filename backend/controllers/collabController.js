import cloudinary from "../helpers/cloudinary.js";
import Category from "../models/category.js";
import CollabHub from "../models/collabhub.js";
import User from "../models/user.js";
import Link from "./../models/link.js";

export const createCollabHub = async (req, res) => {
  const userId = req.userId;
  const { name } = req.body;
  const file = req.file;

  try {
    // Generate unique link
    let uniqueLink = `http://localhost:3000/collab/${name}`;

    // Check if the unique link already exists in CollabHub or User
    const isUnique =
      (await CollabHub.findOne({ uniqueLink })) ||
      (await User.findOne({ username: uniqueLink }));

    if (isUnique) {
      return res.status(400).json({ message: "Collab name already exists" });
    }

    // Upload image to Cloudinary if provided
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            folder: "collab_profile_image",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              reject(new Error(error.message));
            } else {
              resolve(result);
            }
          }
        )
        .end(file.buffer); // Pass the buffer to Cloudinary
    });

    const coverImage = uploadResult.secure_url; // Save the image URL

    // Create default category "General"
    const defaultCategory = await Category.create({ name: "General" });

    // Create collab hub
    const collabHub = await CollabHub.create({
      name,
      uniqueLink,
      image: coverImage,
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
export const addCategoryToCollabHub = async (req, res) => {
  const userId = req.userId;
  const { collabId } = req.params;
  const { categoryName } = req.body;

  try {
    // Find the collab hub by ID and check if the current user is the owner
    const collabHub = await CollabHub.findById(collabId);
    if (!collabHub) {
      return res.status(404).json({ message: "Collab hub not found" });
    }

    if (collabHub.owner.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to add categories to this collab hub",
      });
    }

    // Create new category
    const newCategory = await Category.create({ name: categoryName });

    // Add the new category to the collab hub
    collabHub.categories.push(newCategory._id);
    await collabHub.save();

    res.status(201).json({ message: "Category added successfully", collabHub });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const addLinkToCollabHub = async (req, res) => {
  const userId = req.userId;
  const collabId = req.params.collabId;
  const { url, title, description, categoryId } = req.body;

  try {
    const collabHub = await CollabHub.findById(collabId);
    if (!collabHub) {
      return res.status(404).json({ message: "Collab hub not found" });
    }

    // Check if the user is the owner of the collab hub
    if (collabHub.owner.toString() === userId) {
      // Owner can directly add the link
      return await addLinkToHub(
        collabHub,
        { url, title, description, categoryId },
        userId,
        res
      );
    }

    // If not the owner, check if the user is an approved member
    const member = collabHub.members.find(
      (member) => member.user.toString() === userId
    );
    if (!member || member.status !== "approved") {
      return res.status(403).json({
        message: "You are not authorized to add links to this collab hub",
      });
    }

    // Add link for approved member
    await addLinkToHub(
      collabHub,
      { url, title, description, categoryId },
      userId,
      res
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Helper function to add link to collab hub
const addLinkToHub = async (collabHub, linkData, userId, res) => {
  const { url, title, description, categoryId } = linkData;

  try {
    // Create link
    const link = await Link.create({ url, title, description, user: userId });

    // Add link to the collab hub
    collabHub.links.push(link._id);
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (category) {
        category.links.push(link._id);
        await category.save();
      }
    } else {
      const defaultCategory = await Category.findById(collabHub.categories[0]);
      defaultCategory.links.push(link._id);
      await defaultCategory.save();
    }

    await collabHub.save();
    res.status(201).json({ message: "Link added successfully", link });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Join collab hub
export const joinCollabHub = async (req, res) => {
  const userId = req.userId;
  const collabId = req.params.collabId;

  try {
    const collabHub = await CollabHub.findById(collabId);
    if (!collabHub) {
      return res.status(404).json({ message: "Collab hub not found" });
    }

    // Check if the user is already a member
    const isMember = collabHub.members.some(
      (member) => member.user.toString() === userId
    );
    if (isMember) {
      return res
        .status(400)
        .json({ message: "You are already a member of this collab hub" });
    }

    // Add user as a pending member
    collabHub.members.push({ user: userId, status: "pending" });
    await collabHub.save();

    res
      .status(200)
      .json({ message: "Request to join collab hub sent successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

// Approve member
export const approveMember = async (req, res) => {
  const userId = req.userId;
  const collabId = req.params.collabId;
  const { memberId } = req.body;

  try {
    const collabHub = await CollabHub.findById(collabId);
    if (!collabHub) {
      return res.status(404).json({ message: "Collab hub not found" });
    }

    // Ensure only the owner can approve members
    if (collabHub.owner.toString() !== userId) {
      return res.status(403).json({
        message:
          "You are not authorized to approve members for this collab hub",
      });
    }

    // Approve the member
    const member = collabHub.members.find(
      (member) => member.user.toString() === memberId
    );
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    member.status = "approved";
    await collabHub.save();

    res.status(200).json({ message: "Member approved successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
