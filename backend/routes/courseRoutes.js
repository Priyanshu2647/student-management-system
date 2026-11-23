import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getTeacherAssignedCourses,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/teacher/assigned', authorize('teacher'), getTeacherAssignedCourses);

router
  .route('/')
  .get(authorize('admin', 'teacher', 'student'), getCourses)
  .post(authorize('admin'), createCourse);

router
  .route('/:id')
  .get(authorize('admin', 'teacher', 'student'), getCourseById)
  .put(authorize('admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

export default router;
