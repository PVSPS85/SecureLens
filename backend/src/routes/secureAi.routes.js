import { Router } from 'express';
import { getAiSummary, postAiChat } from '../controllers/secureAi.controller.js';

const router = Router();

// GET /api/v1/secure-ai/summary/:scanId - Returns the AI plain language report summary
router.get('/summary/:scanId', getAiSummary);

// POST /api/v1/secure-ai/chat - Accept query messages regarding target scans
router.post('/chat', postAiChat);

export default router;
