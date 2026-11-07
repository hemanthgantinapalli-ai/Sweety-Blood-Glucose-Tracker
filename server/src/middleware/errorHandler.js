// Centralized error handling middleware

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // PostgreSQL unique violation error code
  if (err.code === '23505') {
    if (err.constraint === 'users_email_key') {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.',
      });
    }
    if (err.constraint === 'unique_user_reading_date_slot') {
      return res.status(409).json({
        success: false,
        message: 'A reading for this time slot on the selected date already exists.',
      });
    }
  }

  // PostgreSQL check constraint violation error code
  if (err.code === '23514') {
    if (err.constraint === 'check_glucose_value_range') {
      return res.status(400).json({
        success: false,
        message: 'Value must be between 40 and 600 mg/dl.',
      });
    }
  }

  // Custom status code or default 500
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
