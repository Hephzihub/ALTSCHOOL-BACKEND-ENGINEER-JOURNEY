import mongoose from "mongoose";
import { config } from "dotenv";

config();

const DB_URL = process.env.DB_URL;

// export const connectDB = () => {
//   mongoose.connect(DB_URL).then(
//     () => console.log("Database Connected"),
//     () => console.log("Error Connecting to Database")
//   );
// };

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL, {
      // These options are no longer needed in Mongoose 6+, but won't hurt
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};