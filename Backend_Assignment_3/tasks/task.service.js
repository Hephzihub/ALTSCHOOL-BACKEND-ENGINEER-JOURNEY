import { TaskModel } from "./task.model.js";

export const createTaskService = async ({ title, description, userId }) => {
  const task = await TaskModel.create({ userId, title, description });

  return {
    code: 201,
    message: "Task created successfully",
  };
};

export const updateStatusService = async ({type, id, userId}) => {
  const task = await TaskModel.findOne({
    _id: id,
    userId,
  });

  if (!task) {
    return {
      code: 404,
      message: "Task not found",
    };
  }

  // console.log(type)

  try {
    if (type === "completed") {
      if (task.status === "completed") {
        return {
          code: 400,
          message: "Task already completed",
        };
      } else {
        await task.markAsCompleted();
      }
    } else {
      await task.undoCompletion();
    }

    return {
      code: 200,
      message: "Task updated",
    };
  } catch (error) {
    // console.log(error);
    return {
      code: 400,
      message: "Task could not be updated, try again",
    };
  }
};

export const deleteTaskService = async ({id, userId}) => {
  const task = await TaskModel.findOne({
    _id: id,
    userId,
  });

  if (!task) {
    return {
      code: 404,
      message: "Task not found",
    };
  }

  try {
    await task.markAsDeleted();

    return {
      code: 200,
      message: "Task Deleted",
    };
  } catch (error) {
    return {
      code: 400,
      message: "Task could not be deleted",
    };
  }
};
