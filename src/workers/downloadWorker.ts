import { Worker } from 'bullmq';
import { downloadsRepository } from '@modules/downloads/downloads.repository';
import { providerRegistry } from '@modules/providers/ProviderRegistry';

const redisUrl = `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;

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
  // Update status to COMPLETED with download URL
  await downloadsRepository.updateDownload(downloadId, {
    status: 'COMPLETED',
  });
  return { success: true, downloadUrl: result.downloadUrl };  // Changed
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