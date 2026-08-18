import { Router } from 'express';

const router = Router();

// GET /api/v1/health - Lightweight health check for production orchestrators
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

export default router;
