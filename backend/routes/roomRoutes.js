import { Router } from 'express';
import {
  createRoom,
  browseRooms,
  getRecentRooms,
  incrementRoomView,
  deleteRoom,
  getRoomDetails,
} from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/create', authMiddleware, createRoom);
router.get('/browse', browseRooms);
router.get('/recent', getRecentRooms);
router.patch('/:id/view', incrementRoomView);
router.delete('/:id', authMiddleware, deleteRoom);
router.get('/:roomId/details', authMiddleware, getRoomDetails);

export default router;
