import { body, ValidationChain } from 'express-validator';

export const createDownloadValidation = (): ValidationChain[] => [
  body('videoUrl')
    .trim()
    .isURL()
    .withMessage('Invalid video URL'),
  body('format')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Format must be between 2 and 20 characters'),
  body('quality')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Quality must be between 2 and 20 characters'),
];