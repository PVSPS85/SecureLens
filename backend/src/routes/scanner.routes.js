import { Router } from 'express';
import { scanQrPayload, scanEmailDomain, scanPhoneReputation } from '../controllers/scanner.controller.js';

const router = Router();

// POST /api/v1/scanners/qr - Decodes QR payload data and redirects URL scans
router.post('/qr', scanQrPayload);

// POST /api/v1/scanners/email - Inspects email validation domain DNS controls
router.post('/email', scanEmailDomain);

// POST /api/v1/scanners/phone - Analyzes phone reputation signals (PII protected)
router.post('/phone', scanPhoneReputation);

export default router;
