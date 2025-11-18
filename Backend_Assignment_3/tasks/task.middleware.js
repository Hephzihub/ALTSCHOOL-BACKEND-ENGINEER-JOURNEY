import Joi from "joi";

export const validatedTask = (req, res, next) => {
  console.log(req.body);
  
  const taskSchema = Joi.object({
    title: Joi.string().min(4).max(100).required().trim(),
    description: Joi.string().max(500).allow('').optional().trim(),
  });

  const { error } = taskSchema.validate(req.body);

  console.error(error);

  if (error) {
    return res.status(400).redirect(`/task?error=${encodeURIComponent(error.message)}`);
  }

  next();
};
