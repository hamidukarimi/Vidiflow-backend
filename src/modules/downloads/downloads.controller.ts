import { Response } from 'express';
import { catchAsync } from '@shared/catchAsync';
import { sendSuccess } from '@responses/successResponse';
import { downloadsService } from './downloads.service';
import { AuthRequest } from '@middlewares/auth.middleware';
import { CreateDownloadRequest } from './downloads.types';
import { ValidationError } from '@errors/index';

export class DownloadsController {
  createDownload = catchAsync(async (req: AuthRequest, res: Response) => {
    const { videoUrl, format, quality } = req.body as CreateDownloadRequest;

    const result = await downloadsService.createDownload(
      { videoUrl, format, quality },
      req.user?.userId
    );

    return sendSuccess(res, result, 'Download created successfully', 201);
  });

  getVideoInfo = catchAsync(async (req: AuthRequest, res: Response) => {
  const { url } = req.query as { url: string };

  if (!url) {
    throw new ValidationError('Video URL is required');
  }

  const result = await downloadsService.getVideoInfo(url);
  return sendSuccess(res, result, 'Video info retrieved');
});

  getDownloadHistory = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendSuccess(res, { downloads: [], total: 0 }, 'No download history');
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await downloadsService.getDownloadHistory(req.user.userId, limit, offset);
    return sendSuccess(res, result, 'Download history retrieved');
  });

  getDownload = catchAsync(async (req: AuthRequest, res: Response) => {
const { id } = req.params as { id: string };

const result = await downloadsService.getDownload(id);
    return sendSuccess(res, result, 'Download retrieved');
  });

  addToFavorites = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendSuccess(res, null, 'Must be logged in to favorite', 401);
    }

    const { downloadId } = req.body;

    await downloadsService.addToFavorites(downloadId, req.user.userId);
    return sendSuccess(res, null, 'Added to favorites', 201);
  });

  removeFromFavorites = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendSuccess(res, null, 'Must be logged in', 401);
    }

const { id } = req.params as { id: string };

await downloadsService.removeFromFavorites(id, req.user.userId);
    return sendSuccess(res, null, 'Removed from favorites');
  });

  getFavorites = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendSuccess(res, { downloads: [], total: 0 }, 'No favorites');
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await downloadsService.getFavorites(req.user.userId, limit, offset);
    return sendSuccess(res, result, 'Favorites retrieved');
  });
}

export const downloadsController = new DownloadsController();