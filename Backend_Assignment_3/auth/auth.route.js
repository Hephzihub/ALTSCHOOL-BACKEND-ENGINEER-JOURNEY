import { Router } from "express";
import { loginView, registerView } from "./auth.controller.js";

const authRouter = Router();

authRouter.get('/login', loginView)
authRouter.get('/signup', registerView)

export default authRouter