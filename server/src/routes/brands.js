import express from 'express';
import { getBrands, createBrand, getBrandStats } from '../controllers/brandsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getBrands);
router.post('/', createBrand);
router.get('/:id/stats', getBrandStats);

export default router;
