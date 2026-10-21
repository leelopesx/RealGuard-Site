import { Router } from 'express';
import { getTeam, getVideos } from '../controllers/content.controller.js';

const router = Router();

router.get('/team', getTeam);
router.get('/videos', getVideos);

export default router;
