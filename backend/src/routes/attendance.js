import express from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate.js';
import {
  getAllAttendance,
  getAttendanceSummary,
  createAttendance,
  updateAttendanceStatus
} from '../controllers/attendanceController.js';

const router = express.Router();

// Validation rules
const attendanceValidation = [
  body('guest_id').isInt().withMessage('Guest ID must be a valid integer'),
  body('status').optional().isIn(['Presence', 'Not Presence']).withMessage('Status must be Presence or Not Presence'),
  body('check_in_source').optional().trim(),
  body('notes').optional().trim()
];

const idValidation = [
  param('id').isInt().withMessage('ID must be a valid integer')
];

// Routes
router.get('/', 
  [
    query('status').optional().isIn(['Presence', 'Not Presence']),
    query('guest_id').optional().isInt()
  ],
  validate,
  getAllAttendance
);

router.get('/summary', getAttendanceSummary);

router.post('/', attendanceValidation, validate, createAttendance);

router.patch('/:id/status', 
  [
    ...idValidation,
    body('status').isIn(['Presence', 'Not Presence']).withMessage('Status must be Presence or Not Presence')
  ], 
  validate, 
  updateAttendanceStatus
);

export default router;
