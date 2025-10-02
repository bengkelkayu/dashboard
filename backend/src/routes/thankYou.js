import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateEnabled,
  previewTemplate
} from '../controllers/thankYouController.js';

const router = express.Router();

// Validation rules
const templateValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('message_template').trim().notEmpty().withMessage('Message template is required'),
  body('is_enabled').optional().isBoolean().withMessage('is_enabled must be a boolean')
];

const idValidation = [
  param('id').isInt().withMessage('ID must be a valid integer')
];

// Routes
router.get('/', getAllTemplates);

router.get('/:id', idValidation, validate, getTemplateById);

router.post('/', templateValidation, validate, createTemplate);

router.post('/preview', 
  [
    body('message_template').trim().notEmpty().withMessage('Message template is required'),
    body('sample_data').optional().isObject()
  ],
  validate,
  previewTemplate
);

router.patch('/:id', [...idValidation, ...templateValidation], validate, updateTemplate);

router.patch('/:id/toggle',
  [
    ...idValidation,
    body('is_enabled').isBoolean().withMessage('is_enabled must be a boolean')
  ],
  validate,
  toggleTemplateEnabled
);

router.delete('/:id', idValidation, validate, deleteTemplate);

export default router;
