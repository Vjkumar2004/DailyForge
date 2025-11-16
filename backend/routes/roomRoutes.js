import { Router } from 'express';
import {
  createRoom,
  browseRooms,
  getRecentRooms,
  incrementRoomView,
} from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/create', authMiddleware, createRoom);
router.get('/browse', browseRooms);
router.get('/recent', getRecentRooms);
router.patch('/:id/view', incrementRoomView);

export default router;
