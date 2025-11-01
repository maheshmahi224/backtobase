import express from 'express';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import { eventValidation, validate } from '../middleware/validator.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .post(eventValidation, validate, createEvent)
  .get(getEvents);

router.route('/:id')
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

router.get('/:id/stats', getEventStats);

export default router;
