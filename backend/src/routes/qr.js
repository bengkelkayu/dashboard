import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import {
  getGuestQRCode,
  scanQRCode,
  webhookQRCheckIn
} from '../controllers/qrController.js';

const router = express.Router();

// Validation rules
const idValidation = [
  param('id').isInt().withMessage('ID must be a valid integer')
];

const scanValidation = [
  body('qrData').notEmpty().withMessage('QR data is required')
];

// Routes
// Get QR code for a guest (or generate if not exists)
router.get('/guests/:id/qrcode', idValidation, validate, getGuestQRCode);

// Scan QR code and auto check-in
router.post('/scan-qr', scanValidation, validate, scanQRCode);

// Webhook endpoint for external scanner (optional)
router.post('/webhook/qr-checkin', webhookQRCheckIn);

export default router;
