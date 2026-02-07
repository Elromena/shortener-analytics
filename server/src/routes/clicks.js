import express from 'express';
import { trackClick, exportCSV } from '../controllers/clicksController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/track', authenticateToken, trackClick);
router.get('/export/:brandId', authenticateToken, exportCSV);

export default router;
