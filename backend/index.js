import express from "express";
import { connectDB } from "./dbConnect.js";
import cors from "cors";
const port = 3000;
const app = express();
app.use(cors());
app.use(express.json());

connectDB();
app.listen(() => {
  console.log(`Server is running on port http://localhost:${port}`);
});
