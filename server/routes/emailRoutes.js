import express from 'express';
import {
  sendInvitations,
  sendConfirmations,
  testEmail,
} from '../controllers/emailController.js';
import { protect } from '../middleware/auth.js';
import { emailValidation, validate } from '../middleware/validator.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/send-invitations', emailValidation, validate, sendInvitations);
router.post('/send-confirmations', emailValidation, validate, sendConfirmations);
router.post('/test', testEmail);

export default router;
