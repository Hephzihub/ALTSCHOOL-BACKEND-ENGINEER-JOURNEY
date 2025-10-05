import { Router } from "express";
import { validateLogin, validateRegister } from "./user.middleware.js";
import { RegisterUser, LoginUser } from "./user.controller.js";

const AuthRouter = Router();

AuthRouter.post('/signup', validateRegister, RegisterUser)
AuthRouter.post('/login', validateLogin, LoginUser)

export default AuthRouter