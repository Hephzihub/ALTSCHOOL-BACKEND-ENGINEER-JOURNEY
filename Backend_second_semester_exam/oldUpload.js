import multer from "multer";
import path from "path";
import { config } from "dotenv";
import { cloudinaryCofig } from "../config/cloudinary.js";
import fs from "fs";

config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts/');
  },
  filename: (req, file, cb) => {
    // keep original extension
    const ext = path.extname(file.originalname) || '';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const uploadPostImage = multer({
  // dest: 'uploads',
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB 
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'), false);
    cb(null, true);
  }
});

// Create an upload single middleware that handles errors
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const upload = uploadPostImage.single(fieldName);
    // add file path to req.body after successful upload
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        // An unknown error occurred when uploading.
        return res.status(400).json({ success: false, message: err.message });
      }
      // Everything went fine.
      // if (req.file) {
      //   req.body.image_url = `${process.env.APP_URL}/${req.file.path}`;
      //   console.log('Uploaded file path:', req.body.image_url);
      // }
      next();
    });
  };
};

export const handleImageUpload = async (req, res, next) => {
  if (!req.file) return next();

  const filePath = req.file.path;

  try {
    const result = await cloudinaryCofig.uploader.upload(filePath);
    req.body.image_url = result.secure_url;
    // console.log(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Image upload failed',
    });
  } finally {
    // Optionally, delete the local file after upload to Cloudinary
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });
    next();
  }
}
