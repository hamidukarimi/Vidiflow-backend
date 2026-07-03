import { Request, Response, NextFunction } from 'express';
import { authService } from '@modules/auth/auth.service';
import { UnauthorizedError } from '@errors/index';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const payload = await authService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeader(req);
    if (token) {
      const payload = await authService.verifyAccessToken(token);
      req.user = payload;
    }
    // no error if token missing — just continue without user
    next();
  } catch (err) {
    // token exists but invalid — still an error
    next(err);
  }
};

function extractTokenFromHeader(req: AuthRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // remove "Bearer " prefix
}