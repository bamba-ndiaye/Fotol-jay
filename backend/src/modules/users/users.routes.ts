import { Router } from 'express';
import { getProfile, updateProfile } from './users.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;