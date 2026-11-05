import { Router } from 'express';
import { deleteReview, getAllReviews } from '../controllers/reviewController.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// GET all reviews (Admin moderation)
router.get('/', requireAdmin, getAllReviews);

// DELETE review (Owner or Admin)
router.delete('/:id', verifyToken, deleteReview);

export default router;
