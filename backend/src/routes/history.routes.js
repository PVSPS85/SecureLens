import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { getScanHistory } from '../controllers/history.controller.js';

const router = Router();

// GET /api/v1/history - Retrieves paginated scan history (auth protected)
router.get('/', requireAuth, getScanHistory);

export default router;
