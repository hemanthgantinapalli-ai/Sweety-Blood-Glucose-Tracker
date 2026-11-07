const express = require('express');
const router = express.Router();
const {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
} = require('../controllers/reportController');
const authenticate = require('../middleware/auth');

// All report routes are protected by JWT authentication
router.use(authenticate);

router.get('/daily', getDailyReport);
router.get('/month-to-date', getMonthToDateReport);
router.get('/previous-month', getPreviousMonthReport);

module.exports = router;
