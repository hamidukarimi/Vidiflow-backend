import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later',
  skip: (req) => process.env.NODE_ENV !== 'production', // disable in dev
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many registration attempts, please try again later',
  skip: (req) => process.env.NODE_ENV !== 'production',
});