import { PostModel } from "./post.model.js";

export const GetSinglePostService = async (id) => {
  const post = await PostModel.findById(id).populate(
    "author_id",
    "first_name last_name email"
  );

  if (!post) {
    return {
      code: 404,
      message: "Post not found",
      sucess: false,
    };
  }

  if (post.state !== "published") {
    return {
      code: 403,
      message: "Access denied",
      sucess: false,
    };
  }

  post.read_count++;
  await post.save();

  return {
    code: 200,
    message: "Post found",
    sucess: true,
    post,
  };
};

export const CreatePostService = async ({
  author_id,
  title,
  description,
  tags,
  body,
}) => {
  // console.log(author_id)

  const existingBlog = await PostModel.findOne({
    title,
  });

  if (existingBlog) {
    return {
      code: 409,
      message: "Title Already Exist",
      sucess: false,
    };
  }

  const post = await PostModel.create({
    author_id,
    title,
    description,
    tags,
    body,
  });

  if (!post) {
    return {
      code: 400,
      message: "error creating post",
      sucess: false,
    };
  }

  return {
    code: 201,
    message: "Post Created",
    post,
    sucess: true,
  };
};

export const PublishPostService = async (_id, author_id) => {
  const post = await PostModel.findById(_id);

  if (!post) {
    return {
      code: 404,
      message: "Post not found",
      sucess: false,
    };
  }

  if (post.author_id.toString() !== author_id.toString()) {
    return {
      code: 403,
      message: "You don't have permission",
      sucess: false,
    };
  }

  post.state = "published";

  await post.save();

  return {
    code: 200,
    sucess: true,
    message: "Post published successfully",
  };
};

export const UpdatePostService = async ({
  title,
  description,
  tags,
  body,
  id,
  author_id
}) => {

  const existingBlog = await PostModel.findOne({
    title,
    _id: { $ne: id }, // excludes the current post ID from the search
  });

  let post = await PostModel.findById(id);

  if (post.author_id.toString() !== author_id.toString()) {
    return {
      code: 403,
      message: "You don't have permission",
      sucess: false,
    };
  }

  if (existingBlog) {
    return {
      code: 400,
      message: "Title Already Exist",
      sucess: false,
    };
  }

  post.title = title;
  post.description = description;
  post.tags = tags;
  post.body = body

  post = await post.save();

  if (!post) {
    return {
      code: 400,
      message: "error updating post",
      sucess: false,
    };
  }

  return {
    code: 200,
    message: "Post Updated",
    post,
    sucess: true,
  };
};

export const DeletePostService = async (_id, author_id) => {
  const post = await PostModel.findById(_id);

  if (!post) {
    return {
      code: 404,
      message: "Post not found",
      sucess: false,
    };
  }

  if (post.author_id.toString() !== author_id.toString()) {
    return {
      code: 403,
      message: "You don't have permission",
      sucess: false,
    };
  }

  await post.deleteOne();

  return {
    code: 200,
    sucess: true,
    message: "Post deleted successfully",
  };
};
