import express from 'express';
import {
  convertIdea,
  createIdea,
  deleteIdea,
  getIdeas,
  updateIdea,
} from '../controllers/ideaController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getIdeas);
router.post('/', createIdea);
router.put('/:id', updateIdea);
router.delete('/:id', deleteIdea);
router.post('/:id/convert', convertIdea);

export default router;
