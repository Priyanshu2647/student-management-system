import express from 'express';
import {
  getResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
  getStudentResults,
  getMyResults,
} from '../controllers/resultController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/student/me', authorize('student'), getMyResults);
router.get('/student/:studentId', authorize('admin', 'teacher', 'student'), getStudentResults);

router
  .route('/')
  .get(authorize('admin', 'teacher'), getResults)
  .post(authorize('admin', 'teacher'), createResult);

router
  .route('/:id')
  .get(authorize('admin', 'teacher', 'student'), getResultById)
  .put(authorize('admin', 'teacher'), updateResult)
  .delete(authorize('admin'), deleteResult);

export default router;
