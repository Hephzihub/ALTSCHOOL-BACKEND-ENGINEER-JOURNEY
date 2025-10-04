import Joi from "joi";

export const validatedTask = (req, res, next) => {
  const taskSchema = Joi.object({
    title: Joi.string().required().min(4).max(100),
    description: Joi.string().max(500),
  });

  const { error } = taskSchema.validate(req.body);

  if (error) {
    return res.status(400).redirect(`/task/${error.message}`);
  }

  next();
};
