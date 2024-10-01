import express from "express";
import {
  addCoverImageToLink,
  addLinks,
  deleteCategory,
  deleteLink,
  getTrendingLinks,
  getUserLinksWithCategories,
  trackLinkClick,
  updateLink,
} from "../controllers/linkController.js";
import { auth } from "./../middleware/auth.js";
import { clickLimiter } from "../helpers/limiter.js";
import upload from "../helpers/multer.js";
const linkRouter = express.Router();

linkRouter.post("/add-links", auth, addLinks);
linkRouter.post("/clicks/:linkId", clickLimiter, trackLinkClick);
linkRouter.get("/trending", getTrendingLinks);
linkRouter.put("/update/:linkId", updateLink);

linkRouter.delete("/deleteLink/:linkId", auth, deleteLink);
linkRouter.delete("/deleteCategory/:categoryId", auth, deleteCategory);
linkRouter.get("/links", auth, getUserLinksWithCategories);
linkRouter.post(
  "/:linkId/cover-image",
  auth,
  upload.single("coverImage"),
  addCoverImageToLink
);

// linkRouter.get("/profile", auth, getUserProfile);
// linkRouter.patch("/edit-profile", auth, upload.single("image"), editProfile);

export default linkRouter;
