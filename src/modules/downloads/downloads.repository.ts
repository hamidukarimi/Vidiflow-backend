import { prisma } from '@database/prismaClient';
import { Download, Favorite } from '@prisma/client';

export class DownloadsRepository {
  async createDownload(data: {
    videoUrl: string;
    provider: string;
    title?: string;
    thumbnail?: string;
    format?: string;
    quality?: string;
    userId?: string;
  }): Promise<Download> {
    return prisma.download.create({
      data,
    });
  }

  async getDownloadById(id: string): Promise<Download | null> {
    return prisma.download.findUnique({
      where: { id },
    });
  }

  async getDownloadsByUserId(userId: string, limit = 50, offset = 0): Promise<Download[]> {
    return prisma.download.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async countDownloadsByUserId(userId: string): Promise<number> {
    return prisma.download.count({
      where: { userId },
    });
  }

  async updateDownload(id: string, data: Partial<Download>): Promise<Download> {
    return prisma.download.update({
      where: { id },
      data,
    });
  }

  async addFavorite(userId: string, downloadId: string): Promise<Favorite> {
    return prisma.favorite.create({
      data: {
        userId,
        downloadId,
      },
    });
  }

  async removeFavorite(userId: string, downloadId: string): Promise<Favorite | null> {
    return prisma.favorite.deleteMany({
      where: {
        userId,
        downloadId,
      },
    }).then(() => null);
  }

  async isFavorited(userId: string, downloadId: string): Promise<boolean> {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_downloadId: {
          userId,
          downloadId,
        },
      },
    });
    return !!favorite;
  }

  async getFavorites(userId: string, limit = 50, offset = 0): Promise<Download[]> {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { download: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return favorites.map((fav) => fav.download);
  }
}

export const downloadsRepository = new DownloadsRepository();