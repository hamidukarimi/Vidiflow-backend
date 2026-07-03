import { Router } from 'express';
import { authController } from './auth.controller';
import { registerValidation, loginValidation } from './auth.validation';
import { requireAuth } from '@middlewares/auth.middleware';

const router = Router();

router.post('/register', registerValidation(), authController.register);
router.post('/login', loginValidation(), authController.login);
router.post('/logout', requireAuth, authController.logout);

export default router;