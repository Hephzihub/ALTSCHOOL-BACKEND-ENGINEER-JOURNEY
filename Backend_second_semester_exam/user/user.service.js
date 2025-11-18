import { encode } from "../utils/jwt.js";
import { UserModel } from "./user.model.js";

export const registerService = async ({
  first_name,
  last_name,
  email,
  password,
  avatar_url,
}) => {
  // Check for existing user
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return {
      code: 409,
      message: "Email already used",
    };
  }
  const auth = await UserModel.create({
    first_name,
    last_name,
    email,
    password,
    avatar_url,
  });

  // console.log(auth);

  if (!auth) {
    return {
      code: 401,
      message: "error creating account",
    };
  }

  const user = {
    _id: auth._id,
    first_name: auth.first_name,
    last_name: auth.last_name,
    email: auth.email,
    avatar_url: auth.avatar_url,
  }
  const token = encode(user);

  return {
    code: 201,
    success: true,
    message: "Signup successful",
    token,
    user
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

  const user = {
    _id: auth._id,
    first_name: auth.first_name,
    last_name: auth.last_name,
    email: auth.email,
  }
  const token = encode(user);

  return {
    code: 200,
    success: true,
    message: "Login successful",
    token,
    user
  };
};

export const UpdateAvatarService = async (userId, avatarUrl) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { avatar_url: avatarUrl },
      { new: true }
    );
    if (!user) {
      return {
        code: 404,
        message: "User not found",
        success: false,
      };
    } else {
      user.avatar_url = avatarUrl;
      await user.save();
      return {
        code: 200,
        message: "Avatar updated successfully",
        success: true,
        user,
      };
    } 
  } catch (error) {
    return {
      code: 500,
      message: "Error updating avatar",
      success: false,
      error: error.message,
    };
  } 
};
