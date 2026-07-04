import { IProvider, VideoInfo, DownloadOptions, DownloadResult, Format, Quality } from '../IProvider';
import { extractionService } from '@shared/extractionService';

export class YouTubeProvider implements IProvider {
  name = 'youtube';

  canHandle(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      return hostname.includes('youtube.com') || hostname.includes('youtu.be');
    } catch {
      return false;
    }
  }

  async getVideoInfo(url: string): Promise<VideoInfo> {
    try {
      const metadata = await extractionService.getVideoMetadata(url);

      // Parse formats from yt-dlp response
      const formats = Array.from(
        new Set(metadata.formats.map((f) => f.ext))
      ).map((ext) => ({
        id: ext,
        name: ext.toUpperCase(),
        extension: ext,
      }));

      // Parse qualities (resolutions)
      const qualities = Array.from(
        new Set(
          metadata.formats
            .filter((f) => f.height)
            .map((f) => `${f.height}p`)
        )
      ).map((label) => ({
        id: label,
        label,
        value: parseInt(label),
      }));

      return {
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        duration: metadata.duration,
        availableFormats: formats,
        availableQualities: qualities,
      };
    } catch (error) {
      throw new Error(`YouTube extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async download(url: string, options: DownloadOptions): Promise<DownloadResult> {
    try {
      // Get actual download URL from YouTube
      const downloadUrl = await extractionService.getDownloadUrl(
        url,
        options.format || 'best',
        options.quality || 'best'
      );

      return {
        success: true,
        downloadUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      };
    }
  }
}

export const youtubeProvider = new YouTubeProvider();