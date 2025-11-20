import { Router } from 'express';
import { getProfile, joinRoom, updateStreak, deleteAccount, getCreatedRooms, updateActivity } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/profile', authMiddleware, getProfile);
router.post('/join-room', authMiddleware, joinRoom);
router.post('/streak', authMiddleware, updateStreak);
router.post('/update-activity', authMiddleware, updateActivity);
router.delete('/delete', authMiddleware, deleteAccount);
router.get('/created-rooms', authMiddleware, getCreatedRooms);

export default router;
