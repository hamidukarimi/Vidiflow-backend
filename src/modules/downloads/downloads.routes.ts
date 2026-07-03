import { Router } from 'express';
import { downloadsController } from './downloads.controller';
import { createDownloadValidation } from './downloads.validation';
import { optionalAuth, requireAuth } from '@middlewares/auth.middleware';

const router = Router();

// GET /api/v1/downloads/info?url=... - get video info (formats/qualities)
router.get('/info', downloadsController.getVideoInfo);

// POST /api/v1/downloads - create download (guests + users)
router.post(
  '/',
  optionalAuth,
  createDownloadValidation(),
  downloadsController.createDownload
);

// GET /api/v1/downloads/:id - get single download
router.get('/:id', downloadsController.getDownload);

// GET /api/v1/downloads/history - download history (logged-in users)
router.get('/history', optionalAuth, downloadsController.getDownloadHistory);

// POST /api/v1/downloads/:id/favorite - add to favorites (requires auth)
router.post('/:id/favorite', requireAuth, downloadsController.addToFavorites);

// DELETE /api/v1/downloads/:id/favorite - remove from favorites (requires auth)
router.delete('/:id/favorite', requireAuth, downloadsController.removeFromFavorites);

// GET /api/v1/downloads/favorites - get favorite downloads (requires auth)
router.get('/favorites', requireAuth, downloadsController.getFavorites);

export default router;