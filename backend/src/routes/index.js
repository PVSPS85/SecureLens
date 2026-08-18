import { Router } from 'express';
import healthRouter from './health.routes.js';
import scanRouter from './scan.routes.js';
import historyRouter from './history.routes.js';

const router = Router();

// Mount system routes
router.use('/health', healthRouter);
router.use('/scan', scanRouter);
router.use('/history', historyRouter);

export default router;
