import express from 'express';
import { getBrands, createBrand, updateBrand, getBrandStats } from '../controllers/brandsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getBrands);
router.post('/', createBrand);
router.put('/:id', updateBrand);
router.get('/:id/stats', getBrandStats);

export default router;
