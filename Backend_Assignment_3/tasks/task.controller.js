import {
  createTaskService,
  updateStatusService,
  deleteTaskService,
} from "./task.service.js";
import { TaskModel } from "./task.model.js";

export const getUserTask = async (req, res) => {
  // console.log(req.session);
  const userId = req.session.userId;
  const filter = req.query.filter || "all";

  const tasks = await TaskModel.getTasksByStatus(userId, filter);
  const stats = await TaskModel.getTaskStats(userId);

  // console.log(tasks, stats);

  return res.render("task", {
    username: req.session.username,
    stats,
    tasks,
    filter,
  });
};

export const createTask = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.session.userId;

  const response = await createTaskService({ title, description, userId });

  if (response.code === 201) {
    return res.redirect(`/task?success=${response.message}`);
  }

  return res
    .status(response.code)
    .redirect(`/task?success=${response.message}`);
};

export const updateTaskStatus = async (req, res) => {
  // console.log(req.params);
  const id = req.params.id;
  const type = req.params.type;
  const userId = req.session.userId;

  // console.log(id, type, userId)

  const response = await updateStatusService({type, id, userId});

  if (response.code === 200) {
    return res.redirect(`/task?success=${response.message}`);
  }

  return res
    .status(response.code)
    .redirect(`/task?success=${response.message}`);
};

export const deleteTask = async (req, res) => {
  // console.log(req.params);
  const id = req.params.id;
  const userId = req.session.userId;

  const response = await deleteTaskService({ id, userId });

  if (response.code === 200) {
    return res.redirect(`/task?success=${response.message}`);
  }

  return res
    .status(response.code)
    .redirect(`/task?success=${response.message}`);
};
