import express from "express";
import cors from "cors";
import { connectDB } from "./dbConnect.js";
import userRouter from "./routes/userRoutes.js";
import linkRouter from "./routes/linkRoutes.js";
const port = 3000;
const app = express();
app.use(cors());
app.use(express.json());
connectDB();
app.use("/users", userRouter);
app.use("/my", linkRouter);
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
