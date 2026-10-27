import express from 'express';
import {
  createGoal,
  deleteGoal,
  getGoalById,
  getGoals,
  toggleMilestone,
  updateGoal,
} from '../controllers/goalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getGoals);
router.post('/', createGoal);
router.get('/:id', getGoalById);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.patch('/:id/milestones/:milestoneId/toggle', toggleMilestone);

export default router;
