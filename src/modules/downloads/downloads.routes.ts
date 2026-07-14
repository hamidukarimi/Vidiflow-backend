import { Router } from 'express';
import { downloadsController } from './downloads.controller';
import { createDownloadValidation } from './downloads.validation';
import { optionalAuth, requireAuth } from '@middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/downloads/info:
 *   get:
 *     summary: Get video info (formats and qualities)
 *     tags: [Downloads]
 *     parameters:
 *       - name: url
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *     responses:
 *       200:
 *         description: Video info retrieved
 *       400:
 *         description: Unsupported platform
 */
router.get('/info', downloadsController.getVideoInfo);

/**
 * @swagger
 * /api/v1/downloads/history:
 *   get:
 *     summary: Get user's download history
 *     tags: [Downloads]
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: History retrieved
 */
router.get('/history', optionalAuth, downloadsController.getDownloadHistory);

/**
 * @swagger
 * /api/v1/downloads/favorites:
 *   get:
 *     summary: Get user's favorite downloads
 *     tags: [Downloads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 50
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Favorites retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/favorites', requireAuth, downloadsController.getFavorites);

/**
 * @swagger
 * /api/v1/downloads:
 *   post:
 *     summary: Create a new download
 *     tags: [Downloads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoUrl:
 *                 type: string
 *                 example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *               format:
 *                 type: string
 *                 example: mp4
 *               quality:
 *                 type: string
 *                 example: 720p
 *     responses:
 *       201:
 *         description: Download created successfully
 *       400:
 *         description: Invalid URL or unsupported platform
 */
router.post('/', optionalAuth, createDownloadValidation(), downloadsController.createDownload);

/**
 * @swagger
 * /api/v1/downloads/{id}:
 *   get:
 *     summary: Get download details
 *     tags: [Downloads]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Download details retrieved
 *       404:
 *         description: Download not found
 */
router.get('/:id', downloadsController.getDownload);

/**
 * @swagger
 * /api/v1/downloads/{id}/status:
 *   get:
 *     summary: Get download status (for polling)
 *     tags: [Downloads]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status retrieved
 */
router.get('/:id/status', downloadsController.getDownloadStatus);

/**
 * @swagger
 * /api/v1/downloads/{id}/favorite:
 *   post:
 *     summary: Add download to favorites
 *     tags: [Downloads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Added to favorites
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Remove download from favorites
 *     tags: [Downloads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed from favorites
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/favorite', requireAuth, downloadsController.addToFavorites);
router.delete('/:id/favorite', requireAuth, downloadsController.removeFromFavorites);

export default router;