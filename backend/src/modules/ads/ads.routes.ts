import { Router } from 'express';
import { getAllAds, getAd, createNewAd, updateAdController, updateAdStatusController, deleteAdController, uploadAdImage } from './ads.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { createAdSchema, extendAdSchema } from './ads.schemas';
import { upload } from './ads.service';

const router = Router();

router.post('/upload', authenticateToken, upload.single('photo'), uploadAdImage);
router.post('/', authenticateToken, validateRequest(createAdSchema), createNewAd);
router.get('/', getAllAds);
router.get('/:id', getAd);
router.put('/:id', authenticateToken, updateAdController);
router.put('/:id/status', authenticateToken, updateAdStatusController);
router.delete('/:id', authenticateToken, deleteAdController);
router.post('/extend', authenticateToken, validateRequest(extendAdSchema), (req, res) => {
  // TODO: Implement extend functionality
  res.status(501).json({ error: 'Not implemented' });
});

export default router;