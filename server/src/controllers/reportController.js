const db = require('../config/db');

/**
 * Helper to ensure valid YYYY-MM-DD date string
 */
const getValidDate = (dateStr) => {
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Daily Report
 * GET /api/reports/daily?date=YYYY-MM-DD
 */
const getDailyReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const selectedDate = getValidDate(req.query.date);

    // Aggregate query
    const statsResult = await db.query(
      `SELECT
         COUNT(*)::int AS total_readings,
         MAX(glucose_value)::int AS highest_reading,
         MIN(glucose_value)::int AS lowest_reading,
         ROUND(AVG(glucose_value)::numeric, 1)::float AS average_reading
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date = $2`,
      [userId, selectedDate]
    );

    // Individual readings query
    const readingsResult = await db.query(
      `SELECT
         id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         time_slot,
         glucose_value,
         created_at
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date = $2
       ORDER BY
         CASE time_slot
           WHEN 'Morning (fasting)' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
           ELSE 5
         END ASC`,
      [userId, selectedDate]
    );

    const stats = statsResult.rows[0];

    return res.status(200).json({
      success: true,
      report_type: 'daily',
      date: selectedDate,
      statistics: {
        total_readings: stats.total_readings || 0,
        highest_reading: stats.highest_reading !== null ? stats.highest_reading : null,
        lowest_reading: stats.lowest_reading !== null ? stats.lowest_reading : null,
        average_reading: stats.average_reading !== null ? stats.average_reading : null,
      },
      readings: readingsResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Month-to-Date Report
 * GET /api/reports/month-to-date?date=YYYY-MM-DD
 * From the first day of the selected month until the selected date
 */
const getMonthToDateReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const selectedDate = getValidDate(req.query.date);

    // Month start date is YYYY-MM-01
    const [year, month] = selectedDate.split('-');
    const startDate = `${year}-${month}-01`;

    // Aggregate query
    const statsResult = await db.query(
      `SELECT
         COUNT(*)::int AS total_readings,
         MAX(glucose_value)::int AS highest_reading,
         MIN(glucose_value)::int AS lowest_reading,
         ROUND(AVG(glucose_value)::numeric, 1)::float AS average_reading
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3`,
      [userId, startDate, selectedDate]
    );

    // Daily breakdown for visual trends / charts
    const dailyBreakdownResult = await db.query(
      `SELECT
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS date,
         ROUND(AVG(glucose_value)::numeric, 1)::float AS avg_glucose,
         COUNT(*)::int as count
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3
       GROUP BY reading_date
       ORDER BY reading_date ASC`,
      [userId, startDate, selectedDate]
    );

    const stats = statsResult.rows[0];

    return res.status(200).json({
      success: true,
      report_type: 'month-to-date',
      start_date: startDate,
      end_date: selectedDate,
      statistics: {
        total_readings: stats.total_readings || 0,
        highest_reading: stats.highest_reading !== null ? stats.highest_reading : null,
        lowest_reading: stats.lowest_reading !== null ? stats.lowest_reading : null,
        average_reading: stats.average_reading !== null ? stats.average_reading : null,
      },
      daily_breakdown: dailyBreakdownResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Previous Month Report
 * GET /api/reports/previous-month?date=YYYY-MM-DD
 * Entire previous calendar month
 */
const getPreviousMonthReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const selectedDate = getValidDate(req.query.date);

    // Determine previous month bounds using PostgreSQL date math
    const boundsResult = await db.query(
      `SELECT
         TO_CHAR((DATE_TRUNC('month', $1::date) - INTERVAL '1 month')::date, 'YYYY-MM-DD') AS prev_start,
         TO_CHAR((DATE_TRUNC('month', $1::date) - INTERVAL '1 day')::date, 'YYYY-MM-DD') AS prev_end`,
      [selectedDate]
    );

    const { prev_start, prev_end } = boundsResult.rows[0];

    // Aggregate query for previous month
    const statsResult = await db.query(
      `SELECT
         COUNT(*)::int AS total_readings,
         MAX(glucose_value)::int AS highest_reading,
         MIN(glucose_value)::int AS lowest_reading,
         ROUND(AVG(glucose_value)::numeric, 1)::float AS average_reading
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3`,
      [userId, prev_start, prev_end]
    );

    // Daily breakdown for charts
    const dailyBreakdownResult = await db.query(
      `SELECT
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS date,
         ROUND(AVG(glucose_value)::numeric, 1)::float AS avg_glucose,
         COUNT(*)::int as count
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3
       GROUP BY reading_date
       ORDER BY reading_date ASC`,
      [userId, prev_start, prev_end]
    );

    const stats = statsResult.rows[0];

    return res.status(200).json({
      success: true,
      report_type: 'previous-month',
      start_date: prev_start,
      end_date: prev_end,
      statistics: {
        total_readings: stats.total_readings || 0,
        highest_reading: stats.highest_reading !== null ? stats.highest_reading : null,
        lowest_reading: stats.lowest_reading !== null ? stats.lowest_reading : null,
        average_reading: stats.average_reading !== null ? stats.average_reading : null,
      },
      daily_breakdown: dailyBreakdownResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
};

