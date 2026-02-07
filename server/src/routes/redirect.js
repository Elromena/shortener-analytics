import express from 'express';
import { redirectAndTrack } from '../controllers/clicksController.js';

const router = express.Router();

// Public redirect endpoint - no authentication required
router.get('/:slug/:code', redirectAndTrack);

export default router;
