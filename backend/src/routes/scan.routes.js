import { Router } from 'express';
import { startScan } from '../controllers/scan.controller.js';
import { validateScanRequest } from '../middlewares/validate.middleware.js';

const router = Router();

// POST /api/v1/scan
router.post('/', validateScanRequest, startScan);

export default router;
