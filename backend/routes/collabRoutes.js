import express from "express";
import { createCollabHub } from "../controllers/collabController.js";

const collabRouter = express.Router();

collabRouter.post("/collab", createCollabHub);

// collabRouter.get("/profile", auth, getUserProfile);
// collabRouter.patch("/edit-profile", auth, upload.single("image"), editProfile);

export default collabRouter;
