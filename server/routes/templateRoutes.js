import express from 'express';
import {
  getEventTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getDefaultTemplates,
} from '../controllers/templateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/defaults/:eventId', protect, getDefaultTemplates);
router.get('/:eventId', protect, getEventTemplates);
router.get('/single/:templateId', protect, getTemplate);
router.post('/', protect, createTemplate);
router.put('/:templateId', protect, updateTemplate);
router.delete('/:templateId', protect, deleteTemplate);

export default router;
