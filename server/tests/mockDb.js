// In-memory mock database for Jest testing

let users = [];
let readings = [];
let nextUserId = 1;
let nextReadingId = 1;

const resetMockDb = () => {
  users = [];
  readings = [];
  nextUserId = 1;
  nextReadingId = 1;
};

const mockQuery = async (sql, params = []) => {
  const normalizedSql = sql.trim().replace(/\s+/g, ' ');

  // 1. Users: Select by email
  if (normalizedSql.startsWith('SELECT id FROM users WHERE LOWER(email) = LOWER($1)')) {
    const email = params[0].toLowerCase();
    const found = users.filter((u) => u.email.toLowerCase() === email);
    return { rows: found.map((u) => ({ id: u.id })) };
  }

  // 2. Users: Select full user by email
  if (normalizedSql.startsWith('SELECT id, name, email, password_hash, created_at FROM users WHERE LOWER(email) = LOWER($1)')) {
    const email = params[0].toLowerCase();
    const found = users.filter((u) => u.email.toLowerCase() === email);
    return { rows: found };
  }

  // 3. Users: Select by ID
  if (normalizedSql.startsWith('SELECT id, name, email, created_at FROM users WHERE id = $1')) {
    const id = params[0];
    const found = users.filter((u) => u.id === id);
    return { rows: found };
  }

  // 4. Users: Insert
  if (normalizedSql.startsWith('INSERT INTO users')) {
    const [name, email, password_hash] = params;
    const user = {
      id: nextUserId++,
      name,
      email: email.toLowerCase(),
      password_hash,
      created_at: new Date().toISOString(),
    };
    users.push(user);
    return { rows: [user] };
  }

  // 5. Readings: Slot check on create
  if (normalizedSql.includes('FROM glucose_readings WHERE user_id = $1 AND reading_date = $2 AND time_slot = $3')) {
    const [userId, readingDate, timeSlot] = params;
    const found = readings.filter(
      (r) => r.user_id === userId && r.reading_date === readingDate && r.time_slot === timeSlot
    );
    return { rows: found.map((r) => ({ id: r.id })) };
  }

  // 6. Readings: Daily count check
  if (normalizedSql.includes('SELECT COUNT(*)::int as count FROM glucose_readings WHERE user_id = $1 AND reading_date = $2')) {
    const [userId, readingDate] = params;
    const count = readings.filter(
      (r) => r.user_id === userId && r.reading_date === readingDate
    ).length;
    return { rows: [{ count }] };
  }

  // 7. Readings: Insert
  if (normalizedSql.startsWith('INSERT INTO glucose_readings')) {
    const [userId, readingDate, timeSlot, glucoseValue] = params;
    const reading = {
      id: nextReadingId++,
      user_id: userId,
      reading_date: readingDate,
      time_slot: timeSlot,
      glucose_value: glucoseValue,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    readings.push(reading);
    return { rows: [reading] };
  }

  // 8. Readings: Select single by ID (for get or auth check)
  if (normalizedSql.includes('FROM glucose_readings WHERE id = $1')) {
    const id = parseInt(params[0], 10);
    const found = readings.filter((r) => r.id === id);
    return { rows: found };
  }

  // 9. Readings: Duplicate slot check on update (id != $4)
  if (normalizedSql.includes('AND time_slot = $3 AND id != $4')) {
    const [userId, readingDate, timeSlot, excludeId] = params;
    const found = readings.filter(
      (r) =>
        r.user_id === userId &&
        r.reading_date === readingDate &&
        r.time_slot === timeSlot &&
        r.id !== parseInt(excludeId, 10)
    );
    return { rows: found.map((r) => ({ id: r.id })) };
  }

  // 10. Readings: Count check on update (id != $3)
  if (normalizedSql.includes('AND reading_date = $2 AND id != $3')) {
    const [userId, readingDate, excludeId] = params;
    const count = readings.filter(
      (r) =>
        r.user_id === userId &&
        r.reading_date === readingDate &&
        r.id !== parseInt(excludeId, 10)
    ).length;
    return { rows: [{ count }] };
  }

  // 11. Readings: Update
  if (normalizedSql.startsWith('UPDATE glucose_readings')) {
    const [targetDate, targetSlot, targetValue, id, userId] = params;
    const readingId = parseInt(id, 10);
    const index = readings.findIndex((r) => r.id === readingId && r.user_id === userId);
    if (index !== -1) {
      readings[index] = {
        ...readings[index],
        reading_date: targetDate,
        time_slot: targetSlot,
        glucose_value: targetValue,
        updated_at: new Date().toISOString(),
      };
      return { rows: [readings[index]] };
    }
    return { rows: [] };
  }

  // 12. Readings: Delete
  if (normalizedSql.startsWith('DELETE FROM glucose_readings')) {
    const [id, userId] = params;
    const readingId = parseInt(id, 10);
    const initialLen = readings.length;
    readings = readings.filter((r) => !(r.id === readingId && r.user_id === userId));
    return { rowCount: initialLen - readings.length };
  }

  // 13. Readings: List with filter
  if (normalizedSql.includes('FROM glucose_readings WHERE') && normalizedSql.includes('ORDER BY reading_date DESC')) {
    const userId = params[0];
    let filtered = readings.filter((r) => r.user_id === userId);

    if (params.length > 1 && sql.includes('reading_date = $2')) {
      filtered = filtered.filter((r) => r.reading_date === params[1]);
    }

    return { rows: filtered };
  }

  // 14. Readings: Total count for pagination
  if (normalizedSql.includes('SELECT COUNT(*)::int as total FROM glucose_readings')) {
    const userId = params[0];
    const total = readings.filter((r) => r.user_id === userId).length;
    return { rows: [{ total }] };
  }

  // 15. Reports: Daily statistics
  if (normalizedSql.includes('ROUND(AVG(glucose_value)::numeric, 1)::float AS average_reading') && normalizedSql.includes('reading_date = $2')) {
    const [userId, date] = params;
    const userReadings = readings.filter((r) => r.user_id === userId && r.reading_date === date);

    if (userReadings.length === 0) {
      return {
        rows: [{
          total_readings: 0,
          highest_reading: null,
          lowest_reading: null,
          average_reading: null,
        }],
      };
    }

    const values = userReadings.map((r) => r.glucose_value);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const avg = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));

    return {
      rows: [{
        total_readings: userReadings.length,
        highest_reading: highest,
        lowest_reading: lowest,
        average_reading: avg,
      }],
    };
  }

  // 16. Reports: Daily readings list with CASE ordering
  if (normalizedSql.includes('FROM glucose_readings WHERE user_id = $1 AND reading_date = $2 ORDER BY')) {
    const [userId, date] = params;
    const userReadings = readings.filter((r) => r.user_id === userId && r.reading_date === date);
    return { rows: userReadings };
  }

  // 17. Reports: Date bounds for previous month
  if (normalizedSql.includes('prev_start') && normalizedSql.includes('prev_end')) {
    const selectedDate = params[0];
    const [year, month] = selectedDate.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(prevYear, prevDate.getMonth() + 1, 0).getDate();

    return {
      rows: [{
        prev_start: `${prevYear}-${prevMonth}-01`,
        prev_end: `${prevYear}-${prevMonth}-${String(lastDay).padStart(2, '0')}`,
      }],
    };
  }

  // 18. Reports: Range aggregates (month-to-date or previous month)
  if (normalizedSql.includes('reading_date >= $2 AND reading_date <= $3')) {
    const [userId, startDate, endDate] = params;
    const matched = readings.filter(
      (r) => r.user_id === userId && r.reading_date >= startDate && r.reading_date <= endDate
    );

    if (sql.includes('GROUP BY reading_date')) {
      // Daily breakdown
      const byDate = {};
      matched.forEach((r) => {
        if (!byDate[r.reading_date]) byDate[r.reading_date] = [];
        byDate[r.reading_date].push(r.glucose_value);
      });
      const rows = Object.keys(byDate).sort().map((d) => ({
        date: d,
        avg_glucose: parseFloat((byDate[d].reduce((a, b) => a + b, 0) / byDate[d].length).toFixed(1)),
        count: byDate[d].length,
      }));
      return { rows };
    }

    if (matched.length === 0) {
      return {
        rows: [{
          total_readings: 0,
          highest_reading: null,
          lowest_reading: null,
          average_reading: null,
        }],
      };
    }

    const values = matched.map((r) => r.glucose_value);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const avg = parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));

    return {
      rows: [{
        total_readings: matched.length,
        highest_reading: highest,
        lowest_reading: lowest,
        average_reading: avg,
      }],
    };
  }

  // Default fallback
  return { rows: [] };
};

module.exports = {
  mockQuery,
  resetMockDb,
};

