import { body, ValidationChain } from 'express-validator';

export const registerValidation = (): ValidationChain[] => [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('First name must be 100 characters or less'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Last name must be 100 characters or less'),
];

export const loginValidation = (): ValidationChain[] => [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];