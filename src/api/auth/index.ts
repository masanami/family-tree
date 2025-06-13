import { Router } from 'express';
import { authController } from '../../controllers/authController';
import { authMiddleware } from '../../middleware/auth';
import { createRateLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Rate limiters
const loginLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
const registerLimiter = createRateLimiter(60 * 60 * 1000, 3); // 3 registrations per hour

// Public routes
router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);

export default router;