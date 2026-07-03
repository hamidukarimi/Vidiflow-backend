import { Request, Response } from 'express';
import { catchAsync } from '@shared/catchAsync';
import { sendSuccess } from '@responses/successResponse';
import { authService } from './auth.service';
import { RegisterRequest, LoginRequest } from './auth.types';

export class AuthController {
  register = catchAsync(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body as RegisterRequest;

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
    });

    res.cookie('refreshToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(res, result, 'User registered successfully', 201);
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginRequest;

    const result = await authService.login({ email, password });

    res.cookie('refreshToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, result, 'Logged in successfully');
  });

  logout = catchAsync(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (token) {
      await authService.logout(token);
    }

    res.clearCookie('refreshToken');
    return sendSuccess(res, null, 'Logged out successfully');
  });
}

export const authController = new AuthController();