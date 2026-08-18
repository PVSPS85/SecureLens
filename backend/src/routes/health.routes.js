import { Router } from 'express';
import { getSystemHealth } from '../controllers/health.controller.js';

const router = Router();

// GET /api/v1/health
router.get('/', getSystemHealth);

export default router;
