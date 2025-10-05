import Joi from "joi";
import { verifyToken } from "../utils/jwt.js";
import { UserModel } from "./user.model.js";

export const validateRegister = (req, res, next) => {
  // console.log(req.body)
  const RegisterSchema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
  });

  const { error } = RegisterSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const LoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { data: error } = LoginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }

  next();
};

export const AuthenticateUser = async (req, res, next) => {
  const bearerToken = req.headers["authorization"];
  
  if (!bearerToken) {
    return res.status(401).json({
      code: 401,
      message: "Not Authorized",
    });
  }

  const tokenSplit = bearerToken.split(" ");

  const token = tokenSplit[1];

  if (!token) {
    return res.status(401).json({
      message: "Not Authorized",
    });
  }

  try {
    
    const decoded = verifyToken(token);
    const user = await UserModel.findById(decoded._id);

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: "Not Authorized",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: "Authorization failed",
    });
  }
};
