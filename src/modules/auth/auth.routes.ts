import { Router } from 'express';
import { authController } from './auth.controller';
import { registerValidation, loginValidation } from './auth.validation';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', registerValidation(), authController.register);

// POST /api/v1/auth/login
router.post('/login', loginValidation(), authController.login);

// POST /api/v1/auth/logout
router.post('/logout', authController.logout);

export default router;