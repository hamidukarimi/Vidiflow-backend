import { downloadsRepository } from './downloads.repository';
import { CreateDownloadRequest, DownloadResponse, VideoInfoResponse } from './downloads.types';
import { ValidationError, NotFoundError } from '@errors/index';

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

    // Extract provider from URL (placeholder - will be replaced by provider registry)
    const provider = this.detectProvider(req.videoUrl);
    if (!provider) {
      throw new ValidationError('Video platform not supported');
    }

    // Create download record with PENDING status
    const download = await downloadsRepository.createDownload({
      videoUrl: req.videoUrl,
      provider,
      format: req.format,
      quality: req.quality,
      userId,
    });

    return this.mapDownloadToResponse(download);
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

  private detectProvider(url: string): string | null {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Placeholder detection - will be replaced by provider registry
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube';
    }
    if (hostname.includes('tiktok.com')) {
      return 'tiktok';
    }
    if (hostname.includes('instagram.com')) {
      return 'instagram';
    }
    if (hostname.includes('facebook.com')) {
      return 'facebook';
    }
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'twitter';
    }
    if (hostname.includes('reddit.com')) {
      return 'reddit';
    }

    return null;
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
      createdAt: download.createdAt.toISOString(),
      updatedAt: download.updatedAt.toISOString(),
    };
  }
}

export const downloadsService = new DownloadsService();