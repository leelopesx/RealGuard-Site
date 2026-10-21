import { Router } from 'express';
import { createLead } from '../controllers/leads.controller.js';
import { rateLimit } from '../middlewares/rateLimit.js';

const router = Router();

router.post('/', rateLimit({ windowMs: 60_000, max: 5 }), createLead);

export default router;
