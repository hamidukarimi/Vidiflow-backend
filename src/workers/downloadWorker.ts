import { Worker } from 'bullmq';
import { downloadsRepository } from '@modules/downloads/downloads.repository';
import { providerRegistry } from '@modules/providers/ProviderRegistry';
import { getIO } from '@shared/socketServer';

const redisUrl = `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;

const downloadWorker = new Worker(
  'downloads',
  async (job) => {
    console.log(`Processing download job ${job.id}:`, job.data);

    const { downloadId, videoUrl, format, quality } = job.data;
    const io = getIO();

    try {
      // Emit: started processing
      await downloadsRepository.updateDownload(downloadId, {
        status: 'PROCESSING',
      });
      io.to(`download:${downloadId}`).emit('download-status', {
        downloadId,
        status: 'PROCESSING',
        progress: 10,
      });

      // Use provider to download
      const provider = providerRegistry.findProvider(videoUrl);
      if (!provider) {
        throw new Error('Provider not found');
      }

      const result = await provider.download(videoUrl, { format, quality });

      if (result.success) {
        // Emit: completed
        await downloadsRepository.updateDownload(downloadId, {
          status: 'COMPLETED',
        });
        io.to(`download:${downloadId}`).emit('download-status', {
          downloadId,
          status: 'COMPLETED',
          progress: 100,
        });
        return { success: true, downloadUrl: result.downloadUrl };
      } else {
        throw new Error(result.error || 'Download failed');
      }
    } catch (error) {
      // Emit: failed
      await downloadsRepository.updateDownload(downloadId, {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      io.to(`download:${downloadId}`).emit('download-status', {
        downloadId,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },
  {
    connection: {
      url: redisUrl,
    },
    concurrency: 2,
  }
);

downloadWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

downloadWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log('Download worker started');