import { Router } from 'express';
import { chatWithGemini, generateItinerary } from '../controllers/chatController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

// Endpoint khusus pengguna terdaftar yang sudah login (Role: pengguna atau admin)
router.post('/', verifyToken, chatWithGemini);
router.post('/itinerary', verifyToken, generateItinerary);

export default router;
