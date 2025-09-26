import { Router } from 'express';
import { checkAge } from '../middlewares/student.middleware.js';
import { getAllStudents, createStudent, getStudentById, updateStudent, deleteStudent } from '../controllers/student.controller.js'; 

const studentRouter = Router();

studentRouter.get('/', getAllStudents);
studentRouter.post('/', checkAge, createStudent);
studentRouter.get('/:id', getStudentById);
studentRouter.put('/:id', updateStudent);
studentRouter.delete('/:id', deleteStudent);

export default studentRouter;