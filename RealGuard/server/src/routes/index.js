import { Router } from 'express';
import contentRoutes from './content.routes.js';
import leadsRoutes from './leads.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
router.use('/', contentRoutes);
router.use('/leads', leadsRoutes);

export default router;
