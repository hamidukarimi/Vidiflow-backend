import { Queue } from 'bullmq';

const redisUrl = `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;

export const downloadQueue = new Queue('downloads', {
  connection: {
    url: redisUrl,
  },
});