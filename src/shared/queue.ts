import { Queue } from 'bullmq';
import { createClient } from 'redis';

const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.connect();

export const downloadQueue = new Queue('downloads', {
  connection: redisClient,
});

export { redisClient };