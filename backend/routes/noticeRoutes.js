import express from 'express';
import {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getNotices)
  .post(authorize('admin', 'teacher'), createNotice);

router
  .route('/:id')
  .get(getNoticeById)
  .put(authorize('admin', 'teacher'), updateNotice)
  .delete(authorize('admin', 'teacher'), deleteNotice);

export default router;
