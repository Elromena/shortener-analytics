import express from 'express';
import { getBrandMembers, addBrandMember, removeBrandMember } from '../controllers/teamController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/brand/:brandId/members', getBrandMembers);
router.post('/brand/:brandId/members', addBrandMember);
router.delete('/brand/:brandId/members/:memberId', removeBrandMember);

export default router;
