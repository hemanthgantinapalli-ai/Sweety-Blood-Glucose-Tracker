const { body, validationResult } = require('express-validator');

const VALID_TIME_SLOTS = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

const createReadingValidation = [
  body('reading_date')
    .notEmpty()
    .withMessage('Reading date is required.')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format.')
    .custom((value) => {
      // Calculate current date in YYYY-MM-DD format (local server/UTC safe)
      const now = new Date();
      // Format current date as YYYY-MM-DD
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;

      if (value > today) {
        throw new Error('Date cannot be in the future.');
      }
      return true;
    }),

  body('time_slot')
    .notEmpty()
    .withMessage('Time slot is required.')
    .isIn(VALID_TIME_SLOTS)
    .withMessage('Invalid time slot selected.'),

  body('glucose_value')
    .custom((value) => {
      // Rule 1: Value is required
      if (value === undefined || value === null || value === '') {
        throw new Error('Please enter a glucose value.');
      }
      // Rule 2: Whole number between 40 and 600
      const num = Number(value);
      if (!Number.isInteger(num) || num < 40 || num > 600) {
        throw new Error('Value must be between 40 and 600 mg/dl.');
      }
      return true;
    }),

  validate,
];

const updateReadingValidation = [
  body('reading_date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format.')
    .custom((value) => {
      if (value) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        if (value > today) {
          throw new Error('Date cannot be in the future.');
        }
      }
      return true;
    }),

  body('time_slot')
    .optional()
    .isIn(VALID_TIME_SLOTS)
    .withMessage('Invalid time slot selected.'),

  body('glucose_value')
    .optional()
    .custom((value) => {
      if (value === null || value === '') {
        throw new Error('Please enter a glucose value.');
      }
      const num = Number(value);
      if (!Number.isInteger(num) || num < 40 || num > 600) {
        throw new Error('Value must be between 40 and 600 mg/dl.');
      }
      return true;
    }),

  validate,
];

module.exports = {
  VALID_TIME_SLOTS,
  createReadingValidation,
  updateReadingValidation,
};
