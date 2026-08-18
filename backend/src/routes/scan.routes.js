import { Router } from 'express';
import { validateScanRequest } from '../middlewares/validate.middleware.js';
import { startScan, getScanStatus, getScanReport } from '../controllers/scan.controller.js';

const router = Router();

// POST /api/v1/scan - Initiates a scan target validation and logs request parameters
router.post('/', validateScanRequest, startScan);

// GET /api/v1/scan/:scanId/status - Retrieves progress parameters and state flags
router.get('/:scanId/status', getScanStatus);

// GET /api/v1/scan/:scanId/report - Yields findings details if scan has completed
router.get('/:scanId/report', getScanReport);

export default router;
