export interface CreateDownloadRequest {
  videoUrl: string;
  format?: string;
  quality?: string;
}

export interface DownloadResponse {
  id: string;
  videoUrl: string;
  provider: string;
  status: string;
  format: string | null;
  quality: string | null;
  title: string | null;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoInfoResponse {
  title: string;
  thumbnail: string | null;
  availableFormats: string[];
  availableQualities: string[];
}

export interface DownloadHistoryResponse {
  downloads: DownloadResponse[];
  total: number;
}