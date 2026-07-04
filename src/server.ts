import 'dotenv/config';
import http from 'http';
import app from './app';
import { config } from '@config/index';
import { initializeSocket } from '@shared/socketServer';

const httpServer = http.createServer(app);

// Initialize WebSocket
initializeSocket(httpServer);

httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});