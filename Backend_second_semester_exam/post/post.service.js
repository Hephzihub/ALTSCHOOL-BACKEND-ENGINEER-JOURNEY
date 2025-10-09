import { PostModel } from "./post.model.js";

const LIMIT = 20;

export const GetPublishedService = async ({
  page = 1,
  author,
  title,
  tags,
  sortBy,
}) => {
  const matchStage = { state: "published" };
  if (title) matchStage.title = new RegExp(title, "i");
  if (tags) {
    matchStage.tags = {
      $in: tags.split(",").map((tag) => new RegExp(tag.trim(), "i")),
    };
  }

  const sortField = sortBy?.split(":")[0];
  const sortOrder = sortBy?.split(":")[1] === "desc" ? -1 : 1;
  const sort = ["read_count", "reading_time", "createdAt"].includes(sortField)
    ? { [sortField]: sortOrder }
    : { createdAt: -1 };

  try {
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "author_id",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
    ];

    if (author) {
      pipeline.push({
        $match: {
          $or: [
            { "author.first_name": new RegExp(author, "i") },
            { "author.last_name": new RegExp(author, "i") },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    
    pipeline.push(
      { $sort: sort },
      { $skip: (page - 1) * LIMIT },
      { $limit: LIMIT },
      {
        $project: {
          "author.first_name": 1,
          "author.last_name": 1,
          "author.email": 1,
          title: 1,
          description: 1,
          state: 1,
          read_count: 1,
          reading_time: 1,
          tags: 1,
          body: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      }
    );

    const [posts, countResult] = await Promise.all([
      PostModel.aggregate(pipeline),
      PostModel.aggregate(countPipeline),
    ]);

    const count = countResult[0]?.total || 0;

    return {
      code: 200,
      message: posts.length ? "Posts Retrieved" : "No Post Records",
      success: true,
      posts,
      totalPages: Math.ceil(count / LIMIT),
      currentPage: page,
    };
  } catch (error) {
    return {
      code: 500,
      message: "Error retrieving posts",
      success: false,
      error: error.message,
    };
  }
};

export const GetUserPostService = async (
  { page = 1, state, title, tags, sortBy },
  author_id
) => {

  // Build filter object
  const filter = { author_id };
  if (state) filter.state = state;
  if (title) filter.title = new RegExp(title, "i");
  if (tags)
    filter.tags = {
      $in: tags.split(",").map((tag) => new RegExp(tag.trim(), "i")),
    };

  // Build sort object
  let sort = {};
  if (sortBy) {
    const validSortFields = ["read_count", "reading_time", "createdAt"];
    const [field, order] = sortBy.split(":");
    if (validSortFields.includes(field)) {
      sort[field] = order === "desc" ? -1 : 1;
    }
  } else {
    sort = { createdAt: -1 };
  }

  try {
    const posts = await PostModel.find(filter)
      .sort(sort)
      .limit(LIMIT * 1)
      .skip((page - 1) * LIMIT)
      .exec();

    const count = await PostModel.countDocuments(filter);

    return {
      code: 200,
      message: posts.length ? "Posts Retrieved" : "No Post Records",
      success: true,
      posts,
      totalPages: Math.ceil(count / LIMIT),
      currentPage: page,
    };
  } catch (error) {
    return {
      code: 500,
      message: "Error retrieving posts",
      success: false,
      error: error.message,
    };
  }
};

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
    post,
  };
};

export const UpdatePostService = async ({
  title,
  description,
  tags,
  body,
  id,
  author_id,
}) => {
  const existingBlog = await PostModel.findOne({
    title,
    _id: { $ne: id },
  });

  let post = await PostModel.findById(id);

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
  post.body = body;

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