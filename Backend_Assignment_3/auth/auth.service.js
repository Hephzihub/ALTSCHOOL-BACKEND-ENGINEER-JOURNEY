import { UserModel } from "./auth.model.js";
import { encode } from "../utils/jwt.js";

export const registerService = async ({ username, password }) => {
  const auth = await UserModel.create({ username, password });

  const token = encode({
    id: auth._id,
    username: auth.username,
  });

  return {
    code: 201,
    message: "Account created successfully",
    data: {
      auth,
      token,
    },
  };
};

export const loginService = async ({ username, password }) => {
  const user = await UserModel.findOne({
    username: username.toLowerCase(),
  }).select("+password");

  if (!user) {
    return {
      code: 401,
      message: `Invalid Credentials`,
    };
  }

  const passwordMatch = await user.comparePassword(password);

  if (!passwordMatch) {
    return {
      code: 401,
      message: `Invalid Credentials`,
    };
  }

  const token = encode({
    id: user._id,
    username: user.username,
  });

  return {
    code: 200,
    message: "Login successfully",
    data: {
      user,
      token,
    },
  };
};