import mongoose from "mongoose";
import { config } from "dotenv";

config();

const MONGO_URI = process.env.MONGO_URI;

export const connectDB = () => {
  mongoose.connect(MONGO_URI).then(
    () => console.log("Database Connected"),
    () => console.log("Error Connecting to Database")
  );
};
