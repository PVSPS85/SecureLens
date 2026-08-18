import { Router } from 'express';
import healthRouter from './health.routes.js';
import scanRouter from './scan.routes.js';
import historyRouter from './history.routes.js';
import lookalikeRouter from './lookalike.routes.js';
import scannerRouter from './scanner.routes.js';

const router = Router();

// Mount system routes
router.use('/health', healthRouter);
router.use('/scan', scanRouter);
router.use('/history', historyRouter);
router.use('/lookalikes', lookalikeRouter);
router.use('/scanners', scannerRouter);

export default router;
