import { encode } from "../utils/jwt.js";
import { UserModel } from "./user.model.js";

export const registerService = async ({
  first_name,
  last_name,
  email,
  password,
}) => {
  // Check for existing user
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return {
      code: 404,
      message: "Email already used",
    };
  }
  const auth = await UserModel.create({
    first_name,
    last_name,
    email,
    password,
  });

  // console.log(auth);

  if (!auth) {
    return {
      code: 401,
      message: "error creating account",
    };
  }

  const token = encode({
    _id: auth._id,
    first_name: auth.first_name,
    last_name: auth.last_name,
    email: auth.email,
  });

  return {
    code: 201,
    success: true,
    message: "Signup successful",
    token,
  };
};

export const loginService = async ({ email, password }) => {
  const auth = await UserModel.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!auth) {
    return {
      code: 401,
      message: "Invalid Credentials",
    };
  }

  const passwordMatch = await auth.comparePassword(password);

  if (!passwordMatch) {
    return {
      code: 401,
      message: "Invalid Credentials",
    };
  }

  const token = encode({
    _id: auth._id,
    first_name: auth.first_name,
    last_name: auth.last_name,
    email: auth.email,
  });

  return {
    code: 200,
    success: true,
    message: "Login successful",
    token,
  };
};
