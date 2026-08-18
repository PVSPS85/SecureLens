import { Router } from 'express';
import { login, signup } from '../controllers/auth.controller.js';

const router = Router();

// POST /api/v1/auth/login - User authentication credentials check
router.post('/login', login);

// POST /api/v1/auth/signup - User registration pathway
router.post('/signup', signup);

export default router;
