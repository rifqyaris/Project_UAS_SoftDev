import express from 'express';
import { ajukanPermintaan, getMyTracking } from '../controllers/transaksiController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/request', protect, ajukanPermintaan);
router.get('/tracking', protect, getMyTracking);

export default router;