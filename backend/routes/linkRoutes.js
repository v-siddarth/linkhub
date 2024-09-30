import express from "express";
import {
  addLinks,
  getUserLinksWithCategories,
  trackLinkClick,
} from "../controllers/linkController.js";
import { auth } from "./../middleware/auth.js";
import { clickLimiter } from "../helpers/limiter.js";
const linkRouter = express.Router();

linkRouter.post("/add-links", auth, addLinks);
linkRouter.post("/clicks/:linkId", clickLimiter, trackLinkClick);
linkRouter.get("/links", auth, getUserLinksWithCategories);

// linkRouter.get("/profile", auth, getUserProfile);
// linkRouter.patch("/edit-profile", auth, upload.single("image"), editProfile);

export default linkRouter;
