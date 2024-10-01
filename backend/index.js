import express from "express";
import cors from "cors";
import { connectDB } from "./dbConnect.js";
import userRouter from "./routes/userRoutes.js";
import linkRouter from "./routes/linkRoutes.js";
import { getProfile } from "./controllers/linkController.js";
import collabRouter from "./routes/collabRoutes.js";
// import "./helpers/cron.js";
const port = 3000;
const app = express();
app.use(cors());
app.use(express.json());
connectDB();
app.use("/users", userRouter);
app.use("/my", linkRouter);
app.use("/group", collabRouter);
app.get("/:username", getProfile);

app.get("/addy/check-ip", (req, res) => {
  const clientIp = req.ip; // Get the client's IP address
  console.log("Client IP:", clientIp); // Log the IP to the console
  res.send(`Your IP address is: ${clientIp}`);
});
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
