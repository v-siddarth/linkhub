import express from "express";
import { addLinks } from "../controllers/linkController.js";
import { auth } from "./../middleware/auth.js";
const linkRouter = express.Router();

linkRouter.post("/add-links", auth, addLinks);

// linkRouter.get("/profile", auth, getUserProfile);
// linkRouter.patch("/edit-profile", auth, upload.single("image"), editProfile);

export default linkRouter;
