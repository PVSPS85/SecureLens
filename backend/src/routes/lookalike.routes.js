import { Router } from 'express';
import { getLookalikeAlerts, getLookalikeAlertById } from '../controllers/lookalike.controller.js';

const router = Router();

// GET /api/v1/lookalikes - Retrieves a list of suspicious lookalike candidate domains
router.get('/', getLookalikeAlerts);

// GET /api/v1/lookalikes/:id - Retrieves forensic details for a specific candidate alert
router.get('/:id', getLookalikeAlertById);

export default router;
