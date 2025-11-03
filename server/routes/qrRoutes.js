import express from 'express';
import {
  verifyQR,
  scanQR,
  generateQR,
  getAttendedParticipants,
  getQRStats,
} from '../controllers/qrController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/verify', verifyQR);
router.post('/scan', scanQR);

// Protected routes
router.get('/generate/:participantId', protect, generateQR);
router.get('/attended/:eventId', protect, getAttendedParticipants);
router.get('/stats/:eventId', protect, getQRStats);

export default router;
