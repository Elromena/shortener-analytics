import express from 'express';
import {
  getLinks,
  createLink,
  archiveLinks,
  getTopPerformers,
  getPerformanceData
} from '../controllers/linksController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/brand/:brandId', getLinks);
router.post('/', createLink);
router.post('/archive', archiveLinks);
router.get('/brand/:brandId/top-performers', getTopPerformers);
router.get('/brand/:brandId/performance', getPerformanceData);

export default router;
