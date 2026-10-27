import express from 'express';
import {
  createAssignment,
  deleteAssignment,
  getAssignmentById,
  getAssignments,
  getDashboardSummary,
  updateAssignment,
} from '../controllers/assignmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All assignment routes require authentication

router.get('/', getAssignments);
router.get('/dashboard', getDashboardSummary);
router.post('/', createAssignment);
router.get('/:id', getAssignmentById);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);

export default router;
