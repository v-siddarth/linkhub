import cloudinary from "../helpers/cloudinary.js";
import Category from "../models/category.js";
import User from "../models/user.js";
import Link from "./../models/link.js";
import { mongoose } from "mongoose";

export const addLinks = async (req, res) => {
  const userId = req.userId;
  const { links, categoryName } = req.body;
  const file = req.file;

  try {
    // Find the user
    const user = await User.findById(userId).populate("categories");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find or create the category
    let category = await Category.findOne({
      name: categoryName || "General",
      user: userId,
    });
    if (!category) {
      category = new Category({
        name: categoryName || "General",
        user: userId,
      });
      await category.save();
    }

    // Add links to the category
    const linkIds = [];
    for (const linkData of links) {
      const { url, title, description, startDate, endDate } = linkData;

      const link = new Link({
        url,
        title,
        description,
        startDate,
        endDate,
        user: userId, // Associate the link with the user
      });
      await link.save();
      linkIds.push(link._id);
    }

    category.links.push(...linkIds);
    await category.save();

    if (!user.categories.includes(category._id)) {
      user.categories.push(category._id);
      await user.save();
    }

    res.status(201).json({ message: "Links added successfully", category });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username }).populate({
      path: "categories",
      populate: {
        path: "links",
        // select:'url title description'
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
// Increment clicks on a link
export const trackLinkClick = async (req, res) => {
  const linkId = req.params.linkId;

  try {
    // Find the link by ID and increment the clicks count
    const link = await Link.findByIdAndUpdate(
      linkId,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }
    let redirectUrl = link.url;
    if (
      !redirectUrl.startsWith("http://") &&
      !redirectUrl.startsWith("https://")
    ) {
      redirectUrl = "http://" + redirectUrl; // Default to http if no protocol is specified
    }
    // Redirect to the actual URL after tracking
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const getUserLinksWithCategories = async (req, res) => {
  const userId = req.userId;

  try {
    // Find the user
    const user = await User.findById(userId).populate({
      path: "categories",
      populate: {
        path: "links",
        model: "Link",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve the categories with populated links
    const categories = user.categories;

    res.status(200).json({
      message: "User categories and links retrieved successfully",
      categories,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const addCoverImageToLink = async (req, res) => {
  const userId = req.userId;
  const linkId = req.params.linkId;
  const file = req.file;

  try {
    // Check if a file was provided
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Upload the image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream(
          {
            folder: "link_cover_images",
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

    // Find the link and update with the cover image URL
    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    // Ensure that the link belongs to the user
    if (link.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this link" });
    }

    // Set the cover image URL
    link.coverImage = coverImage;
    await link.save();

    res.status(200).json({ message: "Cover image added successfully", link });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
export const deleteLink = async (req, res) => {
  const userId = req.userId; // Assume this comes from authentication middleware
  const linkId = req.params.linkId;

  try {
    // Find the link and ensure it belongs to the user
    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    if (link.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this link" });
    }

    // Remove the link from its associated category
    const category = await Category.findOne({ links: linkId });
    if (category) {
      category.links = category.links.filter(
        (link) => link.toString() !== linkId
      );
      await category.save();
    }

    // Delete the cover image from Cloudinary if it exists
    if (link.coverImage) {
      const publicId = link.coverImage.split("/").pop().split(".")[0];
      console.log(publicId);
      await cloudinary.v2.uploader.destroy(`link_cover_images/${publicId}`);
    }
    // Delete the link
    // await link.remove();
    await Link.deleteOne({ _id: linkId });

    res.status(200).json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
export const deleteCategory = async (req, res) => {
  const userId = req.userId; // Assume this comes from authentication middleware
  const categoryId = req.params.categoryId;
  console.log(categoryId);
  try {
    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Find and delete all links associated with the category
    const links = await Link.find({ _id: { $in: category.links } });
    for (const link of links) {
      // Ensure the link belongs to the user
      if (link.user.toString() === userId) {
        // Delete the cover image from Cloudinary if it exists
        if (link.coverImage) {
          const publicId = link.coverImage.split("/").pop().split(".")[0];
          await cloudinary.v2.uploader.destroy(`link_cover_images/${publicId}`);
        }

        // Delete the link
        await link.remove();
      }
    }

    // Delete the category
    // await Category.findByIdAndRemove(categoryId);
    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      message: "Category and all associated links deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
export const updateLink = async (req, res) => {
  const userId = req.userId; // Assume this comes from authentication middleware
  const linkId = req.params.linkId;
  const { url, title, description, categoryId } = req.body; // Fields to update
  const file = req.file; // Uploaded file

  try {
    // Find the link and ensure it belongs to the user
    const link = await Link.findById(linkId);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    // Ensure the link belongs to the user
    if (link.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this link" });
    }

    // Update the link details
    if (url) link.url = url;
    if (title) link.title = title;
    if (description) link.description = description;

    // Update the category if needed
    if (categoryId) {
      // Find the current category containing the link
      const currentCategory = await Category.findOne({ links: linkId });
      if (currentCategory) {
        // Remove the link from the current category
        currentCategory.links = currentCategory.links.filter(
          (link) => link.toString() !== linkId
        );
        await currentCategory.save();
      }

      // Add the link to the new category
      const newCategory = await Category.findById(categoryId);
      if (!newCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      newCategory.links.push(linkId);
      await newCategory.save();
    }

    // Update the cover image if a new file is provided
    if (file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream(
            {
              folder: "link_cover_images",
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
          .end(file.buffer);
      });
      link.coverImage = uploadResult.secure_url; // Save the image URL
    }

    // Save the updated link
    await link.save();

    res.status(200).json({ message: "Link updated successfully", link });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
export const getTrendingLinks = async (req, res) => {
  try {
    // Retrieve links sorted by number of clicks in descending order
    const trendingLinks = await Link.find()
      .sort({ clicks: -1 })
      .limit(10)
      .populate({
        path: "user",
        select: "username profileImgUrl", // Retrieve only username and profileImgUrl from User
      });

    // Send the trending links as response
    res.status(200).json(trendingLinks);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "An error occurred while retrieving trending links",
        error: error.message,
      });
  }
};
