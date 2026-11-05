import { Router } from 'express';
import {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../controllers/destinationController.js';
import {
  getReviewsByDestination,
  createReview,
} from '../controllers/reviewController.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Public routes (Pengunjung, Pengguna, Admin)
router.get('/', getDestinations);
router.get('/:id', getDestinationById);
router.get('/:id/reviews', getReviewsByDestination);

// Pengguna / Admin routes
router.post('/:id/reviews', verifyToken, createReview);

// Admin-only routes (Full CRUD Destinasi)
router.post('/', requireAdmin, createDestination);
router.put('/:id', requireAdmin, updateDestination);
router.delete('/:id', requireAdmin, deleteDestination);

export default router;
