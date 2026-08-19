import { Router } from 'express';
import { scanLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validateScanRequest } from '../middlewares/validate.middleware.js';
import { 
  startScan, 
  getScanStatus, 
  getScanReport, 
  quickScan,
  getRecentScans,
  getDashboardMetrics,
  getLookalikeAlerts
} from '../controllers/scan.controller.js';

const router = Router();

// GET /api/v1/scan/recent - Returns last 10 scans
router.get('/recent', getRecentScans);

// GET /api/v1/scan/metrics - Computes live dashboard metrics
router.get('/metrics', getDashboardMetrics);

// GET /api/v1/scan/lookalikes - Returns flagged lookalike detections
router.get('/lookalikes', getLookalikeAlerts);

// POST /api/v1/scan - Initiates a scan target validation and logs request parameters (rate limited)
router.post('/', scanLimiter, validateScanRequest, startScan);

// POST /api/v1/scan/quick - Chrome Extension lightweight scan target route (rate limited)
router.post('/quick', scanLimiter, validateScanRequest, quickScan);

// GET /api/v1/scan/:scanId/status - Retrieves progress parameters and state flags
router.get('/:scanId/status', getScanStatus);

// GET /api/v1/scan/:scanId/report - Yields findings details if scan has completed
router.get('/:scanId/report', getScanReport);

export default router;
