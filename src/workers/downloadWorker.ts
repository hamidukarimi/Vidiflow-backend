import { Worker } from 'bullmq';
import { createClient } from 'redis';
import { downloadsRepository } from '@modules/downloads/downloads.repository';
import { providerRegistry } from '@modules/providers/ProviderRegistry';

const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

const downloadWorker = new Worker(
  'downloads',
  async (job) => {
    console.log(`Processing download job ${job.id}:`, job.data);

    const { downloadId, videoUrl, format, quality } = job.data;

    try {
      // Update status to PROCESSING
      await downloadsRepository.updateDownload(downloadId, {
        status: 'PROCESSING',
      });

      // Use provider to download
      const provider = providerRegistry.findProvider(videoUrl);
      if (!provider) {
        throw new Error('Provider not found');
      }

      const result = await provider.download(videoUrl, { format, quality });

      if (result.success) {
        // Update status to COMPLETED
        await downloadsRepository.updateDownload(downloadId, {
          status: 'COMPLETED',
        });
        return { success: true, filePath: result.filePath };
      } else {
        throw new Error(result.error || 'Download failed');
      }
    } catch (error) {
      // Update status to FAILED
      await downloadsRepository.updateDownload(downloadId, {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },
  {
    connection: redisClient,
    concurrency: 2, // process 2 downloads simultaneously
  }
);

downloadWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

downloadWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log('Download worker started');