import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
});

// Test whether cloudinary is configured correctly
export const testCloudinaryConfig = async () => {
  console.log("Testing Cloudinary configuration...");
  try {
    const result = await cloudinary.api.ping();
    console.log("Cloudinary is configured correctly:", result);
  } catch (error) {
    console.error("Error with Cloudinary configuration:", error);
  } 
};

export const cloudinaryConfig = cloudinary;