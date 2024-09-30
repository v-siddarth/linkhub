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

      const link = new Link({ url, title, description, startDate, endDate });
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

    // Redirect to the actual URL after tracking
    return res.redirect(link.url);
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
