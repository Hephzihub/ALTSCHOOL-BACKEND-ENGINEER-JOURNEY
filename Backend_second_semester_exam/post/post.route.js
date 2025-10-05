import { Router } from "express";
import { validatePost } from "./post.middleware.js";
import { AuthenticateUser } from "../user/user.middleware.js";
import {
  GetPublishedPost,
  GetSinglePost,
  CreateSinglePost,
  GetUserPosts,
  publishPost,
  DeletePost,
  UpdatePost
} from "./post.controller.js";

const PostRouter = Router();

PostRouter.get("/", GetPublishedPost);
PostRouter.get("/:id", GetSinglePost);

// Authenticated Routes
PostRouter.post("/", AuthenticateUser, validatePost, CreateSinglePost);
PostRouter.get('/user/me', AuthenticateUser, GetUserPosts)
PostRouter.patch('/:id', AuthenticateUser, validatePost, UpdatePost)
PostRouter.patch('/:id/publish', AuthenticateUser, publishPost)
PostRouter.delete('/:id', AuthenticateUser, DeletePost)

export default PostRouter;
