import { downloadsRepository } from './downloads.repository';
import { providerRegistry } from '@modules/providers/ProviderRegistry';
import { CreateDownloadRequest, DownloadResponse, VideoInfoResponse } from './downloads.types';
import { ValidationError, NotFoundError, ConflictError } from '@errors/index';
import { downloadQueue } from '@shared/queue';


export class DownloadsService {
  async createDownload(
    req: CreateDownloadRequest,
    userId?: string
  ): Promise<DownloadResponse> {
    // Validate URL format
    try {
      new URL(req.videoUrl);
    } catch (err) {
      throw new ValidationError('Invalid video URL format');
    }

    // Use provider registry to find matching provider
    const provider = providerRegistry.findProvider(req.videoUrl);
    if (!provider) {
      throw new ValidationError('Video platform not supported');
    }

    // Create download record with PENDING status
const download = await downloadsRepository.createDownload({
  videoUrl: req.videoUrl,
  provider: provider.name,
  format: req.format,
  quality: req.quality,
  userId,
});

// Queue the download job (will be processed in background)


await downloadQueue.add(
  'process-download',
  {
    downloadId: download.id,
    videoUrl: req.videoUrl,
    format: req.format,
    quality: req.quality,
  },
  {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  }
);

return this.mapDownloadToResponse(download);
  }

  async getVideoInfo(url: string): Promise<VideoInfoResponse> {
    // Validate URL format
    try {
      new URL(url);
    } catch (err) {
      throw new ValidationError('Invalid video URL format');
    }

    // Use provider registry to get video info
    const videoInfo = await providerRegistry.getVideoInfo(url);

    return {
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      availableFormats: videoInfo.availableFormats.map((f) => f.id),
      availableQualities: videoInfo.availableQualities.map((q) => q.id),
    };
  }

  async getDownloadHistory(userId: string, limit = 50, offset = 0) {
    const downloads = await downloadsRepository.getDownloadsByUserId(userId, limit, offset);
    const total = await downloadsRepository.countDownloadsByUserId(userId);

    return {
      downloads: downloads.map((d) => this.mapDownloadToResponse(d)),
      total,
    };
  }

  async getDownload(id: string): Promise<DownloadResponse> {
    const download = await downloadsRepository.getDownloadById(id);
    if (!download) {
      throw new NotFoundError('Download not found');
    }
    return this.mapDownloadToResponse(download);
  }

async addToFavorites(downloadId: string, userId: string): Promise<void> {
  const download = await downloadsRepository.getDownloadById(downloadId);
  if (!download) {
    throw new NotFoundError('Download not found');
  }

  const alreadyFavorited = await downloadsRepository.isFavorited(userId, downloadId);
  if (alreadyFavorited) {
    throw new ConflictError('Download already in favorites');
  }

  await downloadsRepository.addFavorite(userId, downloadId);
}

  async removeFromFavorites(downloadId: string, userId: string): Promise<void> {
    await downloadsRepository.removeFavorite(userId, downloadId);
  }

  async getFavorites(userId: string, limit = 50, offset = 0) {
    const downloads = await downloadsRepository.getFavorites(userId, limit, offset);
    return {
      downloads: downloads.map((d) => this.mapDownloadToResponse(d)),
      total: downloads.length,
    };
  }

private mapDownloadToResponse(download: any): DownloadResponse {
  return {
    id: download.id,
    videoUrl: download.videoUrl,
    provider: download.provider,
    status: download.status,
    format: download.format,
    quality: download.quality,
    title: download.title,
    thumbnail: download.thumbnail,
    errorMessage: download.errorMessage,
    createdAt: download.createdAt.toISOString(),
    updatedAt: download.updatedAt.toISOString(),
  };
}
}

export const downloadsService = new DownloadsService();