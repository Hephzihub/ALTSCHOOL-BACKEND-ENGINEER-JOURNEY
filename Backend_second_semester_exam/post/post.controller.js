import {
  GetPublishedService,
  GetUserPostService,
  GetSinglePostService,
  CreatePostService,
  DeletePostService,
  PublishPostService,
  UpdatePostService,
} from "./post.service.js";

export const GetPublishedPost = async (req, res) => {
  const response = await GetPublishedService(req.query);

  return res.status(response.code).json(response);
};

export const GetUserPosts = async (req, res) => {
  const response = await GetUserPostService(req.query, req.user._id);

  return res.status(response.code).json(response);
  
};

export const GetSinglePost = async (req, res) => {
  // console.log(req.params)
  const response = await GetSinglePostService(req.params.id);

  return res.status(response.code).json(response);
};

export const CreateSinglePost = async (req, res) => {
  const requestBody = req.body;
  requestBody.author_id = req.user._id;

  // console.log(req.user, requestBody);

  const response = await CreatePostService(requestBody);

  return res.status(response.code).json(response);
};

export const publishPost = async (req, res) => {
  const response = await PublishPostService(req.params.id, req.user._id);

  return res.status(response.code).json(response);
};

export const UpdatePost = async (req, res) => {
  const requestBody = req.body;
  requestBody.author_id = req.user._id;
  requestBody.id = req.params.id;

  const response = await UpdatePostService(requestBody);

  return res.status(response.code).json(response);
};

export const DeletePost = async (req, res) => {
  const response = await DeletePostService(req.params.id, req.user._id);

  return res.status(response.code).json(response);
};
