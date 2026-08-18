import { Router } from 'express';
import { getScanHistory } from '../controllers/history.controller.js';

const router = Router();

// GET /api/v1/history - Retrieves paginated scan history
router.get('/', getScanHistory);

export default router;
