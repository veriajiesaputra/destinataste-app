import { Router } from 'express';
import { getAdminStats, exportDestinationsCSV, exportReviewsCSV } from '../controllers/adminController.js';
import { requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/stats', requireAdmin, getAdminStats);
router.get('/export/destinations', requireAdmin, exportDestinationsCSV);
router.get('/export/reviews', requireAdmin, exportReviewsCSV);

export default router;
