import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import {
  getAll,
  getById,
  create,
  update,
  deleteTemplate,
  toggleEnabled,
  preview
} from '../controllers/invitationTemplateController.js';

const router = express.Router();

// Get all invitation templates
router.get('/', getAll);

// Get single invitation template
router.get('/:id',
  [
    param('id').isInt().withMessage('Template ID must be an integer')
  ],
  validate,
  getById
);

// Create invitation template
router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('message_template').notEmpty().withMessage('Message template is required'),
    body('is_enabled').optional().isBoolean().withMessage('is_enabled must be a boolean')
  ],
  validate,
  create
);

// Update invitation template
router.patch('/:id',
  [
    param('id').isInt().withMessage('Template ID must be an integer'),
    body('name').notEmpty().withMessage('Name is required'),
    body('message_template').notEmpty().withMessage('Message template is required'),
    body('is_enabled').optional().isBoolean().withMessage('is_enabled must be a boolean')
  ],
  validate,
  update
);

// Delete invitation template
router.delete('/:id',
  [
    param('id').isInt().withMessage('Template ID must be an integer')
  ],
  validate,
  deleteTemplate
);

// Toggle template enabled status
router.patch('/:id/toggle',
  [
    param('id').isInt().withMessage('Template ID must be an integer'),
    body('is_enabled').isBoolean().withMessage('is_enabled must be a boolean')
  ],
  validate,
  toggleEnabled
);

// Preview template with sample data
router.post('/preview',
  [
    body('message_template').notEmpty().withMessage('Message template is required'),
    body('sample_data').optional().isObject().withMessage('Sample data must be an object')
  ],
  validate,
  preview
);

export default router;
