import Joi from "joi";
import { createUploadHandler } from "../utils/uploadHandler.js";

// Setup post image upload handler
const { uploadSingle, handleUpload } = createUploadHandler("uploads/posts/", 2); // 2MB limit

export { uploadSingle };

export const handleImageUpload = (req, res, next) => {
  const uploadHandler = handleUpload("image_url", "blog_posts");
  return uploadHandler(req, res, next);
};

export const validatePost = (req, res, next) => {
  const PostSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().max(500),
    tags: Joi.array().items(Joi.string()),
    body: Joi.string().required(),
  });

  const { error } = PostSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next();
};
