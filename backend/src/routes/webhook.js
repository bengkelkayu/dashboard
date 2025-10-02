import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { handleCheckInWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Webhook validation
const webhookValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('name').optional().trim(),
  body('timestamp').optional().isISO8601().withMessage('Timestamp must be a valid ISO 8601 date')
];

// Routes
router.post('/checkin', webhookValidation, validate, handleCheckInWebhook);

export default router;
