export interface VideoInfo {
  title: string;
  thumbnail: string | null;
  duration: number; // seconds
  availableFormats: Format[];
  availableQualities: Quality[];
}

export interface Format {
  id: string;
  name: string; // e.g., "MP4", "WebM"
  extension: string; // e.g., "mp4", "webm"
}

export interface Quality {
  id: string;
  label: string; // e.g., "1080p", "720p", "128kbps"
  value: number; // pixels or bitrate
}

export interface DownloadOptions {
  format: string;
  quality: string;
}

export interface DownloadResult {
  success: boolean;
  filePath?: string;
  fileSize?: number;
  error?: string;
}

export interface IProvider {
  name: string;
  canHandle(url: string): boolean;
  getVideoInfo(url: string): Promise<VideoInfo>;
  download(url: string, options: DownloadOptions): Promise<DownloadResult>;
}