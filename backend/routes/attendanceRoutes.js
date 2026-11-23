import express from 'express';
import {
  getAttendance,
  recordAttendance,
  recordBulkAttendance,
  updateAttendance,
  getStudentAttendanceStats,
  getMyAttendance,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/student/me', authorize('student'), getMyAttendance);
router.get('/stats/:studentId', authorize('admin', 'teacher', 'student'), getStudentAttendanceStats);

router.post('/bulk', authorize('admin', 'teacher'), recordBulkAttendance);

router
  .route('/')
  .get(authorize('admin', 'teacher'), getAttendance)
  .post(authorize('admin', 'teacher'), recordAttendance);

router.route('/:id').put(authorize('admin', 'teacher'), updateAttendance);

export default router;
