import { Router } from "express";
import { getUserTask, createTask, updateTaskStatus, deleteTask } from "./task.controller.js";
import { validatedTask } from "./task.middleware.js";
import { Authenticate } from "../auth/auth.middleware.js";

const taskRouter = Router();

taskRouter.use(Authenticate);

taskRouter.get("/", getUserTask);
taskRouter.post('/', validatedTask, createTask);
// taskRouter.patch('/:id/:type', updateTaskStatus)
taskRouter.post('/updateTask/:id/:type', updateTaskStatus)
taskRouter.post('/delete/:id', deleteTask)

export default taskRouter;