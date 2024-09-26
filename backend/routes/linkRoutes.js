import express from "express";
import { addLinks } from "../controllers/linkController.js";
const linkRouter = express.Router();

linkRouter.post("/signup", addLinks);

// linkRouter.get("/profile", auth, getUserProfile);
// linkRouter.patch("/edit-profile", auth, upload.single("image"), editProfile);

export default linkRouter;
