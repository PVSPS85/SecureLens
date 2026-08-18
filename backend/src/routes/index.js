import { Router } from 'express';
import healthRouter from './health.routes.js';
import scanRouter from './scan.routes.js';

const router = Router();

// Mount system routes
router.use('/health', healthRouter);
router.use('/scan', scanRouter);

export default router;
