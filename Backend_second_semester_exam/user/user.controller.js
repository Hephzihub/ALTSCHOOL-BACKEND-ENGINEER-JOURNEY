import { registerService, loginService } from "./user.service.js";

export const RegisterUser = async (req, res) => {

  const response = await registerService(req.body);

  return res.status(response.code).json(response);
}

export const LoginUser = async (req, res) => {

  const response = await loginService(req.body);

  return res.status(response.code).json(response);
}