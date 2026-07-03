import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository';
import { RegisterRequest, LoginRequest, AuthResponse, TokenPayload } from './auth.types';
import { UnauthorizedError, ConflictError, ValidationError } from '@errors/index';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {
  async register(req: RegisterRequest): Promise<AuthResponse> {
    const existingUser = await authRepository.findUserByEmail(req.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(req.password, 10);
    const user = await authRepository.createUser({
      email: req.email,
      passwordHash,
      firstName: req.firstName,
      lastName: req.lastName,
    });

    const tokens = this.generateTokens(user);
    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.name?.split(' ')[0] || null,
        lastName: user.name?.split(' ').slice(1).join(' ') || null,
      },
    };
  }

  async login(req: LoginRequest): Promise<AuthResponse> {
    const user = await authRepository.findUserByEmail(req.email);
    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(req.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateTokens(user);
    return {
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.name?.split(' ')[0] || null,
        lastName: user.name?.split(' ').slice(1).join(' ') || null,
      },
    };
  }

  private generateTokens(user: any) {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  async logout(token: string): Promise<void> {
    await authRepository.deleteRefreshToken(token);
  }
}

export const authService = new AuthService();