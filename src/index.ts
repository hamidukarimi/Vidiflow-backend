import 'dotenv/config';

// Start the main Express app
const appModule = await import('./server');

// Start the download worker
const workerModule = await import('./workers/downloadWorker');

console.log('App and workers started');