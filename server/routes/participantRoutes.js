import express from 'express';
import {
  uploadParticipants,
  getParticipantsByEvent,
  getParticipant,
  updateParticipant,
  deleteParticipant,
  bulkUpdateParticipants,
  addManualParticipant,
} from '../controllers/participantController.js';
import { protect } from '../middleware/auth.js';
import { participantValidation, validate } from '../middleware/validator.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/upload/:eventId', uploadParticipants);
router.get('/event/:eventId', getParticipantsByEvent);
router.post('/bulk-update', bulkUpdateParticipants);
router.post('/manual', participantValidation, validate, addManualParticipant);

router.route('/:id')
  .get(getParticipant)
  .put(updateParticipant)
  .delete(deleteParticipant);

export default router;
