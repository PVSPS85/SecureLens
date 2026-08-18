import { Router } from 'express';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import { login, signup } from '../controllers/auth.controller.js';

const router = Router();

// POST /api/v1/auth/login - User authentication credentials check (rate limited)
router.post('/login', authLimiter, login);

// POST /api/v1/auth/signup - User registration pathway (rate limited)
router.post('/signup', authLimiter, signup);

export default router;
