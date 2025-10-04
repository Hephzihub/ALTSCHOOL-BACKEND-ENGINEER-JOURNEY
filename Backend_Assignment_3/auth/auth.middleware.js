import Joi from "joi";
import { verifyToken } from "../utils/jwt.js";

export const validateRegister = (req, res, next) => {
  const signupSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi
      .string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords must match",
      }),
  });

  const { error } = signupSchema.validate(req.body);

  if (error) {
    return res.status(400).render("register", {
      error: error.message,
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).render("register", {
      error: error.message,
    });
  }

  next();
};

export const Authenticate = (req, res, next) => {
  const token = req.session.token;

  if (!token) {
    req.session.destroy();
    return res.redirect("/auth/login");
  }

  try {
    const decoded = verifyToken(token);
    
    // Check if token is expired (verifyToken throws error if expired)
    if (!decoded) {
      req.session.destroy();
      return res.redirect("/auth/login");
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    req.session.destroy();
    return res.redirect("/auth/login");
  }
};

export const isGuest = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect("/task");
  }
  next();
};