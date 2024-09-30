import express from "express";
import {
  addCoverImageToLink,
  addLinks,
  getUserLinksWithCategories,
  trackLinkClick,
} from "../controllers/linkController.js";
import { auth } from "./../middleware/auth.js";
import { clickLimiter } from "../helpers/limiter.js";
import upload from "../helpers/multer.js";
const linkRouter = express.Router();

linkRouter.post("/add-links", auth, addLinks);
linkRouter.post("/clicks/:linkId", clickLimiter, trackLinkClick);
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
