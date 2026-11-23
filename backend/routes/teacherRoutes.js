import express from 'express';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getMyTeacherProfile,
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/profile/me', authorize('teacher'), getMyTeacherProfile);

router
  .route('/')
  .get(authorize('admin', 'teacher', 'student'), getTeachers)
  .post(authorize('admin'), createTeacher);

router
  .route('/:id')
  .get(authorize('admin', 'teacher', 'student'), getTeacherById)
  .put(authorize('admin'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

export default router;
