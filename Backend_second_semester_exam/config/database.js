import mongoose from "mongoose";
import { config } from "dotenv";

config();

const DB_URL = process.env.DB_URL;

export const connectDB = () => {
  mongoose.connect(DB_URL).then(
    () => console.log("Database Connected"),
    () => console.log("Error Connecting to Database")
  );
};
