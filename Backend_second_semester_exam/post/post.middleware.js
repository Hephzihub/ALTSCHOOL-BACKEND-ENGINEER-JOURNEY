import Joi from "joi";

export const validatePost = (req,res,next) => {
  const PostSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().max(500),
    tags: Joi.array().items(Joi.string()),
    body: Joi.string().required(),
  })

  const { error } = PostSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }

  next()
}