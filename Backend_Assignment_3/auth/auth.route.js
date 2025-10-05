import { Router } from "express";
import {
  loginView,
  registerView,
  loginUser,
  registerUser,
  logoutUser
} from "./auth.controller.js";
import { validateRegister, validateLogin, isGuest } from "./auth.middleware.js";

const authRouter = Router();

authRouter.get("/signup", isGuest, registerView);
authRouter.post("/register", isGuest, validateRegister, registerUser)
authRouter.get("/login", isGuest, loginView);
authRouter.post("/login", isGuest, validateLogin, loginUser);
authRouter.post("/logout", logoutUser)

export default authRouter;
