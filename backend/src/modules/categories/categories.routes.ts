import { Router } from 'express';
import { getCategories, createCategory } from './categories.controller';
import { authenticateToken, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateToken, requireRole(['admin']), createCategory);

export default router;