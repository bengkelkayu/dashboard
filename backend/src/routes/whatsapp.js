import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import {
  getStatus,
  getQRCode,
  initialize,
  sendToGuest,
  sendToAll,
  disconnect
} from '../controllers/whatsappController.js';

const router = express.Router();

// Get WhatsApp connection status
router.get('/status', getStatus);

// Get QR code for authentication
router.get('/qr', getQRCode);

// Initialize WhatsApp connection
router.post('/initialize', initialize);

// Send message to a single guest
router.post('/send/:guestId',
  [
    param('guestId').isInt().withMessage('Guest ID must be a valid integer'),
    body('templateId').optional().isInt().withMessage('Template ID must be an integer'),
    body('customMessage').optional().isString().withMessage('Custom message must be a string')
  ],
  validate,
  sendToGuest
);

// Send message to all guests (bulk)
router.post('/send-all',
  [
    body('templateId').optional().isInt().withMessage('Template ID must be an integer'),
    body('customMessage').optional().isString().withMessage('Custom message must be a string'),
    body('category').optional().isIn(['VVIP', 'VIP', 'Regular']).withMessage('Category must be VVIP, VIP, or Regular')
  ],
  validate,
  sendToAll
);

// Disconnect WhatsApp
router.post('/disconnect', disconnect);

export default router;
