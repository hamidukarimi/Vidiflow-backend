import { Router } from 'express';
import { authController } from './auth.controller';
import { registerValidation, loginValidation } from './auth.validation';
import { authLimiter, registerLimiter } from '@middlewares/rateLimiters';

const router = Router();

router.post('/register', registerLimiter, registerValidation(), authController.register);
router.post('/login', authLimiter, loginValidation(), authController.login);
router.post('/logout', authController.logout);

export default router;