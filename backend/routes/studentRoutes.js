import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyStudentProfile,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/profile/me', authorize('student'), getMyStudentProfile);

router
  .route('/')
  .get(authorize('admin', 'teacher'), getStudents)
  .post(authorize('admin'), createStudent);

router
  .route('/:id')
  .get(authorize('admin', 'teacher', 'student'), getStudentById)
  .put(authorize('admin', 'teacher'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

export default router;
