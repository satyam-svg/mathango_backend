import express from 'express';
import {
  getChapters,
  getChapterById,
  uploadChapters
} from '../controllers/chapterController.js';
import adminAuth from '../middlewares/auth.js';
import rateLimiter from '../middlewares/rateLimiter.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', rateLimiter, getChapters);
router.get('/:id', rateLimiter, getChapterById);
router.post('/', rateLimiter, adminAuth, upload.single('file'), uploadChapters);

export default router;