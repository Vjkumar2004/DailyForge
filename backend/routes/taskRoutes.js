import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  trackTaskClick,
  trackTaskCompletion,
  completeTaskWithEngagement,
} from '../controllers/taskController.js';

const router = Router();

router.post('/', authMiddleware, createTask);
router.get('/', authMiddleware, getTasks);
router.get('/:id', authMiddleware, getTaskById);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);

// Helper to get tasks for a room using query ?roomId=XYZ (existing getTasks covers this)
// New completion endpoint that validates engagement and updates analytics + user stats
router.post('/complete', authMiddleware, completeTaskWithEngagement);

router.post('/:id/track-click', authMiddleware, trackTaskClick);
router.post('/:id/track-completion', authMiddleware, trackTaskCompletion);

export default router;
