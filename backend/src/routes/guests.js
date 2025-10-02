import express from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate.js';
import {
  getAllGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestStats
} from '../controllers/guestController.js';

const router = express.Router();

// Validation rules
const guestValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required').matches(/^62[0-9]{9,13}$/).withMessage('Phone must start with 62 and be 11-15 digits'),
  body('category').isIn(['VVIP', 'VIP', 'Regular']).withMessage('Category must be VVIP, VIP, or Regular')
];

const idValidation = [
  param('id').isInt().withMessage('ID must be a valid integer')
];

// Routes
router.get('/', 
  [
    query('category').optional().isIn(['VVIP', 'VIP', 'Regular']),
    query('search').optional().trim()
  ],
  validate,
  getAllGuests
);

router.get('/stats', getGuestStats);

router.get('/:id', idValidation, validate, getGuestById);

router.post('/', guestValidation, validate, createGuest);

router.patch('/:id', [...idValidation, ...guestValidation], validate, updateGuest);

router.delete('/:id', idValidation, validate, deleteGuest);

export default router;
