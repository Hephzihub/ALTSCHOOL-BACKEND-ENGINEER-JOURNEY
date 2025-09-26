const Joi = require("joi")

const ValidateCreateStudent = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    gender: Joi.string().allow('male', 'female').required(),
    age: Joi.number().required()
  })
}