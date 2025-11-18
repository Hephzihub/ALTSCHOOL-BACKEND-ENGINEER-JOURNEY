import multer from "multer";
import path from "path";
import fs from "fs";
import { cloudinaryConfig } from "../config/cloudinary.js";

/**
 * Create a reusable upload handler
 * @param {string} uploadDir - Directory to store temp files (e.g., 'uploads/posts/')
 * @param {number} fileSizeMB - Max file size in MB
 * @returns {object} - Object with uploadSingle and handleUpload middleware
 */
export const createUploadHandler = (uploadDir, fileSizeMB = 2) => {
  const storageDisk = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  });
  const storage = multer.memoryStorage();

  const uploader = multer({
    storage,
    limits: { fileSize: fileSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only images allowed"), false);
      }
      cb(null, true);
    },
  });

  /**
   * Middleware to parse single file upload
   */
  const uploadSingle = (fieldName) => {
    return (req, res, next) => {
      const upload = uploader.single(fieldName);
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }
        next();
      });
    };
  };

  /**
   * Middleware to upload file to Cloudinary and set req.body field
   */
  const handleUpload = (bodyField, cloudinaryFolder) => {
    return async (req, res, next) => {
      if (!req.file) return next();

      // const filePath = req.file.path;
      console.log("File buffer available for upload:", bodyField, cloudinaryFolder);

      try {
        // const result = await cloudinaryConfig.uploader.upload(filePath, {
        //   folder: cloudinaryFolder,
        // });
        // req.body[bodyField] = result.secure_url;

        // Upload buffer directly to Cloudinary using upload_stream
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinaryConfig.uploader.upload_stream(
            { folder: cloudinaryFolder },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(req.file.buffer);
        });

        console.log("Cloudinary upload result:", result);
        req.body[bodyField] = result.secure_url;
        next();

        // Cleanup temp file after successful upload
        // fs.unlink(filePath, (err) => {
        //   if (err) console.error("Error deleting local file:", err);
        //   next();
        // });
      } catch (error) {
        console.error("Cloudinary upload error:", error);

        // Cleanup temp file after failed upload
        // fs.unlink(filePath, (unlinkErr) => {
        //   if (unlinkErr) console.error("Error deleting local file:", unlinkErr);
        // });

        return res.status(400).json({
          success: false,
          message: "Image upload failed",
        });
      }
    };
  };

  return {
    uploadSingle,
    handleUpload,
  };
};
