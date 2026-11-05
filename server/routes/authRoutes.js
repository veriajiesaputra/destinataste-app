import { Router } from 'express';
import {
  register,
  login,
  getMe,
  getAllUsers,
  updateProfile,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
} from '../controllers/authController.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Public Auth
router.post('/register', register);
router.post('/login', login);

// User Profile
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);

// Admin User Management
router.get('/users', requireAdmin, getAllUsers);
router.post('/users', requireAdmin, createUserByAdmin);
router.put('/users/:id', requireAdmin, updateUserByAdmin);
router.delete('/users/:id', requireAdmin, deleteUserByAdmin);

export default router;
