import { Router } from 'express';
import { getUserFavorites, getFavoriteIds, toggleFavorite } from '../controllers/favoriteController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.get('/', verifyToken, getUserFavorites);
router.get('/ids', verifyToken, getFavoriteIds);
router.post('/:destinationId', verifyToken, toggleFavorite);

export default router;
