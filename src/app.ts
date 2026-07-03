import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './responses/errorResponse';
import { sendSuccess } from './responses/successResponse';
import authRoutes from './modules/auth/auth.routes';
import cookieParser from 'cookie-parser';

const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/health', (req, res) => {
  sendSuccess(res, { status: 'ok' }, 'Server is healthy');
});

// Auth routes
app.use('/api/v1/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

export default app;