const express = require('express');
const router = express.Router();
const {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
} = require('../controllers/readingController');
const {
  createReadingValidation,
  updateReadingValidation,
} = require('../validators/readingValidators');
const authenticate = require('../middleware/auth');

// All reading routes are protected by JWT authentication
router.use(authenticate);

router.post('/', createReadingValidation, createReading);
router.get('/', getReadings);
router.get('/:id', getReadingById);
router.put('/:id', updateReadingValidation, updateReading);
router.delete('/:id', deleteReading);

module.exports = router;
