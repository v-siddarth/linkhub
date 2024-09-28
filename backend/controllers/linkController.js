import Category from "../models/category.js";
import User from "../models/user.js";
import Link from "./../models/link.js";
import { mongoose } from "mongoose";

export const addLinks = async (req, res) => {
  const userId = req.userId; // Get user ID from the request
  const { links, categoryName } = req.body; // Expecting links array and category name

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
      await category.save(); // Save new category
    }

    // Loop through the array of links and add them to the category
    const linkIds = []; // Array to store created link IDs
    for (const linkData of links) {
      const { url, title, description } = linkData; // Destructure link data

      const link = new Link({ url, title, description }); // Create new link
      await link.save(); // Save the link to the database
      linkIds.push(link._id); // Store the link ID
    }

    // Add links to the category
    category.links.push(...linkIds); // Push all link IDs into the category's links array
    await category.save(); // Save the updated category

    // Update the user to reference the new category if it wasn't already
    if (!user.categories.includes(category._id)) {
      user.categories.push(category._id);
      await user.save(); // Save the updated user
    }

    // Respond with success
    res.status(201).json({ message: "Links added successfully", category });
  } catch (error) {
    console.error(error); // Log any errors
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
