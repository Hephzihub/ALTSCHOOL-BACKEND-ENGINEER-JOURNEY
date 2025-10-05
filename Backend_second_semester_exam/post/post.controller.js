import { PostModel } from "./post.model.js";
import {
  GetSinglePostService,
  CreatePostService,
  DeletePostService,
  PublishPostService,
  UpdatePostService
} from "./post.service.js";

export const GetPublishedPost = async (req, res) => {
  const { page = 1, limit = 20, author, title, tags, sortBy } = req.query;
  
  // Build filter object
  const filter = { state: "published" };
  if (author) filter.author = new RegExp(author, 'i');
  if (title) filter.title = new RegExp(title, 'i');
  if (tags) filter.tags = { $in: tags.split(',').map(tag => new RegExp(tag.trim(), 'i')) };

  // Build sort object
  let sort = {};
  if (sortBy) {
    const validSortFields = ['read_count', 'reading_time', 'timestamp'];
    const [field, order] = sortBy.split(':');
    if (validSortFields.includes(field)) {
      sort[field] = order === 'desc' ? -1 : 1;
    }
  }

  try {
    const posts = await PostModel.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await PostModel.countDocuments(filter);

    return res.status(200).json({
      code: 200,
      message: posts.length ? "Posts Retrieved" : "No Post Records",
      success: true,
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Error retrieving posts",
      success: false,
      error: error.message
    });
  }
};

export const GetUserPosts = async (req, res) => {
  const { page = 1, limit = 20, state, title, tags, sortBy } = req.query;
  const author_id = req.user._id;

  // Build filter object
  const filter = { author_id };
  if (state) filter.state = state;
  if (title) filter.title = new RegExp(title, 'i');
  if (tags) filter.tags = { $in: tags.split(',').map(tag => new RegExp(tag.trim(), 'i')) };

  // Build sort object
  let sort = {};
  if (sortBy) {
    const validSortFields = ['read_count', 'reading_time', 'timestamp'];
    const [field, order] = sortBy.split(':');
    if (validSortFields.includes(field)) {
      sort[field] = order === 'desc' ? -1 : 1;
    }
  }

  try {
    const posts = await PostModel.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await PostModel.countDocuments(filter);

    return res.status(200).json({
      code: 200,
      message: posts.length ? "Posts Retrieved" : "No Post Records",
      success: true,
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Error retrieving posts",
      success: false,
      error: error.message
    });
  }
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

  // console.log(req.user, requestBody);

  // return res.json(requestBody)

  const response = await UpdatePostService(requestBody);

  return res.status(response.code).json(response);
};

export const DeletePost = async (req, res) => {
  const response = await DeletePostService(req.params.id, req.user._id);

  return res.status(response.code).json(response);
};
