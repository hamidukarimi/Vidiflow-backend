import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Full path to the newer yt-dlp version
const YT_DLP_PATH = 'C:\\Users\\Person 1\\AppData\\Local\\Python\\pythoncore-3.14-64\\Scripts\\yt-dlp.exe';

export interface VideoMetadata {
  title: string;
  duration: number;
  thumbnail: string | null;
  formats: Array<{
    format_id: string;
    ext: string;
    format: string;
    filesize?: number;
  }>;
}

export class ExtractionService {
  async getVideoMetadata(url: string): Promise<VideoMetadata> {
    try {
      const { stdout } = await execFileAsync(YT_DLP_PATH, [
        '--dump-json',
        '--no-warnings',
        url,
      ]);

      const data = JSON.parse(stdout);

      return {
        title: data.title,
        duration: data.duration || 0,
        thumbnail: data.thumbnail || null,
        formats: data.formats || [],
      };
    } catch (error) {
      throw new Error(`Failed to extract video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDownloadUrl(url: string, format: string, quality: string): Promise<string> {
    try {
      const { stdout } = await execFileAsync(YT_DLP_PATH, [
        '--get-url',
        '-f',
        `${format}[ext=${quality}]/best`,
        '--no-warnings',
        url,
      ]);

      return stdout.trim().split('\n')[0];
    } catch (error) {
      throw new Error(`Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const extractionService = new ExtractionService();