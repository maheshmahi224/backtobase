import express from 'express';
import {
  getShortlisted,
  addToShortlist,
  removeFromShortlist,
} from '../controllers/shortlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/:eventId', getShortlisted);
router.post('/add', addToShortlist);
router.post('/remove', removeFromShortlist);

export default router;
