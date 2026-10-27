import express from 'express';
import {
  createDoodle,
  deleteDoodle,
  getDoodleById,
  getDoodles,
  updateDoodle,
} from '../controllers/doodleController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getDoodles);
router.post('/', createDoodle);
router.get('/:id', getDoodleById);
router.put('/:id', updateDoodle);
router.delete('/:id', deleteDoodle);

export default router;
