import { Router } from 'express';
import { scanLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validateScanRequest } from '../middlewares/validate.middleware.js';
import { startScan, getScanStatus, getScanReport, quickScan } from '../controllers/scan.controller.js';

const router = Router();

// POST /api/v1/scan - Initiates a scan target validation and logs request parameters (rate limited)
router.post('/', scanLimiter, validateScanRequest, startScan);

// POST /api/v1/scan/quick - Chrome Extension lightweight scan target route (rate limited)
router.post('/quick', scanLimiter, validateScanRequest, quickScan);

// GET /api/v1/scan/:scanId/status - Retrieves progress parameters and state flags
router.get('/:scanId/status', getScanStatus);

// GET /api/v1/scan/:scanId/report - Yields findings details if scan has completed
router.get('/:scanId/report', getScanReport);

export default router;
