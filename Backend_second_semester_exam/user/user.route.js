import { Router } from "express";
import {
  validateLogin,
  validateRegister,
  uploadSingle,
  handleAvatarUpload,
  AuthenticateUser,
} from "./user.middleware.js";
import { RegisterUser, LoginUser, UpdateAvatar } from "./user.controller.js";

const AuthRouter = Router();

AuthRouter.post(
  "/signup",
  validateRegister,
  uploadSingle("avatar_url"),
  handleAvatarUpload,
  RegisterUser
);
AuthRouter.patch(
  "/user/avatar",
  AuthenticateUser,
  uploadSingle("avatar_url"),
  handleAvatarUpload,
  UpdateAvatar
);
AuthRouter.post("/login", validateLogin, LoginUser);

export default AuthRouter;
