import express from 'express';
import { uploadBarang, getAllBarang } from '../controllers/barangController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route('/').post(protect, uploadBarang).get(protect, getAllBarang);

export default router;