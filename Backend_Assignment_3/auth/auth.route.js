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
authRouter.use(isGuest);

authRouter.get("/signup", registerView);
authRouter.post("/register", validateRegister, registerUser)
authRouter.get("/login", loginView);
authRouter.post("/login", validateLogin, loginUser);
authRouter.get("logout", logoutUser)

export default authRouter;
