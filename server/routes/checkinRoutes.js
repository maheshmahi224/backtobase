import express from 'express';
import {
  verifyCheckin,
  checkIn,
  manualCheckin,
  getCheckinStats,
} from '../controllers/checkinController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required for check-in)
router.get('/:token', verifyCheckin);
router.post('/:token', checkIn);
router.post('/manual', manualCheckin);

// Protected routes
router.get('/stats/:eventId', protect, getCheckinStats);

export default router;
