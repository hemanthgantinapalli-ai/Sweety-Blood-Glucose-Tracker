const db = require('../config/db');

/**
 * Format helper for article "a" vs "an"
 */
const getArticle = (word) => {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
};

/**
 * Create a new glucose reading
 * POST /api/readings
 */
const createReading = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { reading_date, time_slot, glucose_value } = req.body;

    // Rule 3: Check if reading already exists for this time slot on this date
    const slotCheck = await db.query(
      `SELECT id FROM glucose_readings
       WHERE user_id = $1 AND reading_date = $2 AND time_slot = $3`,
      [userId, reading_date, time_slot]
    );

    if (slotCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `You already have ${getArticle(time_slot)} ${time_slot} reading for this date.`,
      });
    }

    // Rule 4: Maximum four readings per day
    const countCheck = await db.query(
      `SELECT COUNT(*)::int as count FROM glucose_readings
       WHERE user_id = $1 AND reading_date = $2`,
      [userId, reading_date]
    );

    if (countCheck.rows[0].count >= 4) {
      return res.status(400).json({
        success: false,
        message: 'You can add only 4 readings per day.',
      });
    }

    // Insert new reading
    const insertResult = await db.query(
      `INSERT INTO glucose_readings (user_id, reading_date, time_slot, glucose_value)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date, time_slot, glucose_value, created_at, updated_at`,
      [userId, reading_date, time_slot, glucose_value]
    );

    return res.status(201).json({
      success: true,
      message: 'Glucose reading added successfully.',
      reading: insertResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all readings for the authenticated user
 * GET /api/readings
 */
const getReadings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date, time_slot, startDate, endDate, page, limit } = req.query;

    const conditions = ['user_id = $1'];
    const values = [userId];
    let paramIndex = 2;

    if (date) {
      conditions.push(`reading_date = $${paramIndex}`);
      values.push(date);
      paramIndex++;
    }

    if (time_slot) {
      conditions.push(`time_slot = $${paramIndex}`);
      values.push(time_slot);
      paramIndex++;
    }

    if (startDate) {
      conditions.push(`reading_date >= $${paramIndex}`);
      values.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`reading_date <= $${paramIndex}`);
      values.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Total count for pagination
    const totalResult = await db.query(
      `SELECT COUNT(*)::int as total FROM glucose_readings WHERE ${whereClause}`,
      values
    );
    const total = totalResult.rows[0].total;

    let queryText = `
      SELECT id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
             time_slot, glucose_value, created_at, updated_at
      FROM glucose_readings
      WHERE ${whereClause}
      ORDER BY reading_date DESC, id DESC
    `;

    // Pagination if requested
    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const offset = (pageNum - 1) * limitNum;

      queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      values.push(limitNum, offset);
    }

    const result = await db.query(queryText, values);

    return res.status(200).json({
      success: true,
      total,
      readings: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single reading by ID
 * GET /api/readings/:id
 */
const getReadingById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
              time_slot, glucose_value, created_at, updated_at
       FROM glucose_readings
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found.',
      });
    }

    const reading = result.rows[0];

    // Ownership check
    if (reading.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own readings.',
      });
    }

    return res.status(200).json({
      success: true,
      reading,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing reading
 * PUT /api/readings/:id
 */
const updateReading = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reading_date, time_slot, glucose_value } = req.body;

    // Fetch existing reading
    const existingResult = await db.query(
      `SELECT id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
              time_slot, glucose_value
       FROM glucose_readings
       WHERE id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found.',
      });
    }

    const existing = existingResult.rows[0];

    // Ownership check
    if (existing.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own readings.',
      });
    }

    const targetDate = reading_date || existing.reading_date;
    const targetSlot = time_slot || existing.time_slot;
    const targetValue = glucose_value !== undefined ? glucose_value : existing.glucose_value;

    // Check if slot duplicate exists for this date on another reading
    if (targetDate !== existing.reading_date || targetSlot !== existing.time_slot) {
      const duplicateCheck = await db.query(
        `SELECT id FROM glucose_readings
         WHERE user_id = $1 AND reading_date = $2 AND time_slot = $3 AND id != $4`,
        [userId, targetDate, targetSlot, id]
      );

      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: `You already have ${getArticle(targetSlot)} ${targetSlot} reading for this date.`,
        });
      }
    }

    // Check if date changed and target date already has 4 readings
    if (targetDate !== existing.reading_date) {
      const countCheck = await db.query(
        `SELECT COUNT(*)::int as count FROM glucose_readings
         WHERE user_id = $1 AND reading_date = $2 AND id != $3`,
        [userId, targetDate, id]
      );

      if (countCheck.rows[0].count >= 4) {
        return res.status(400).json({
          success: false,
          message: 'You can add only 4 readings per day.',
        });
      }
    }

    // Perform update
    const updateResult = await db.query(
      `UPDATE glucose_readings
       SET reading_date = $1,
           time_slot = $2,
           glucose_value = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
                 time_slot, glucose_value, created_at, updated_at`,
      [targetDate, targetSlot, targetValue, id, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Glucose reading updated successfully.',
      reading: updateResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a reading
 * DELETE /api/readings/:id
 */
const deleteReading = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existingResult = await db.query(
      `SELECT id, user_id FROM glucose_readings WHERE id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reading not found.',
      });
    }

    if (existingResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own readings.',
      });
    }

    await db.query(
      `DELETE FROM glucose_readings WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Glucose reading deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
};
