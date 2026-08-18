import { Router } from 'express';
import healthRouter from './health.routes.js';
import scanRouter from './scan.routes.js';
import historyRouter from './history.routes.js';
import lookalikeRouter from './lookalike.routes.js';
import scannerRouter from './scanner.routes.js';
import authRouter from './auth.routes.js';
import secureAiRouter from './secureAi.routes.js';

const router = Router();

// Mount system routes
router.use('/health', healthRouter);
router.use('/scan', scanRouter);
router.use('/history', historyRouter);
router.use('/lookalikes', lookalikeRouter);
router.use('/scanners', scannerRouter);
router.use('/auth', authRouter);
router.use('/secure-ai', secureAiRouter);

export default router;
