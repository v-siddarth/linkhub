import express from "express";
import { createCollabHub } from "../controllers/collabController.js";
import { auth } from "../middleware/auth.js";
import upload from "../helpers/multer.js";

const collabRouter = express.Router();

collabRouter.post("/collab", auth, upload.single("image"), createCollabHub);

// collabRouter.get("/profile", auth, getUserProfile);
// collabRouter.patch("/edit-profile", auth, upload.single("image"), editProfile);

export default collabRouter;
