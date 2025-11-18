import { registerService, loginService, UpdateAvatarService } from "./user.service.js";

export const RegisterUser = async (req, res) => {

  const response = await registerService(req.body);

  return res.status(response.code).json(response);
}

export const LoginUser = async (req, res) => {

  const response = await loginService(req.body);

  return res.status(response.code).json(response);
}

export const UpdateAvatar = async (req, res) => {
  // console.log(req.user);
  const userId = req.user._id;
  const avatarUrl = req.body.avatar_url;
  
  const response = await UpdateAvatarService(userId, avatarUrl);

  return res.status(response.code).json(response);
};

// export const LogoutUser = async (req, res) => {
//   try {
//     const jti = req.tokenJti;
    
//     if (!jti) {
//       return res.status(400).json({
//         code: 400,
//         message: "Token information not found",
//         success: false,
//       });
//     }

//     // Add token JTI to blacklist
//     addToBlacklist(jti);

//     return res.status(200).json({
//       code: 200,
//       message: "Logged out successfully",
//       success: true,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       code: 500,
//       message: "Error during logout",
//       success: false,
//       error: error.message,
//     });
//   }
// };