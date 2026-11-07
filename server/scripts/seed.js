const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function seed() {
  console.log('🌱 Seeding Sweety database with demo user and sample readings...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create Demo User
    const demoEmail = 'demo@sweety.com';
    const demoPassword = 'Password123!';
    const demoName = 'Kenpath Demo User';

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(demoPassword, saltRounds);

    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id, name, email`,
      [demoName, demoEmail, passwordHash]
    );

    const demoUser = userRes.rows[0];
    console.log(`👤 Demo user confirmed (ID: ${demoUser.id}, Email: ${demoUser.email})`);

    // 2. Generate dates for today, past days of current month, and previous month
    const readingsToInsert = [];

    // Helper to format date YYYY-MM-DD
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const now = new Date();

    // Readings for Today (e.g. 3 readings: morning fasting, after breakfast, after lunch)
    const todayStr = formatDate(now);
    readingsToInsert.push(
      { date: todayStr, slot: 'Morning (fasting)', value: 92 },
      { date: todayStr, slot: 'After breakfast', value: 128 },
      { date: todayStr, slot: 'After lunch', value: 135 }
    );

    // Readings for Yesterday (all 4 slots)
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);
    readingsToInsert.push(
      { date: yesterdayStr, slot: 'Morning (fasting)', value: 88 },
      { date: yesterdayStr, slot: 'After breakfast', value: 132 },
      { date: yesterdayStr, slot: 'After lunch', value: 124 },
      { date: yesterdayStr, slot: 'After dinner', value: 142 }
    );

    // Readings for 3 days ago (current month)
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = formatDate(threeDaysAgo);
    readingsToInsert.push(
      { date: threeDaysAgoStr, slot: 'Morning (fasting)', value: 95 },
      { date: threeDaysAgoStr, slot: 'After breakfast', value: 140 },
      { date: threeDaysAgoStr, slot: 'After lunch', value: 118 },
      { date: threeDaysAgoStr, slot: 'After dinner', value: 138 }
    );

    // Readings for previous calendar month (e.g. 15th and 20th of previous month)
    const prevMonthDate1 = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    const prevMonthStr1 = formatDate(prevMonthDate1);
    readingsToInsert.push(
      { date: prevMonthStr1, slot: 'Morning (fasting)', value: 90 },
      { date: prevMonthStr1, slot: 'After breakfast', value: 125 },
      { date: prevMonthStr1, slot: 'After lunch', value: 130 },
      { date: prevMonthStr1, slot: 'After dinner', value: 145 }
    );

    const prevMonthDate2 = new Date(now.getFullYear(), now.getMonth() - 1, 22);
    const prevMonthStr2 = formatDate(prevMonthDate2);
    readingsToInsert.push(
      { date: prevMonthStr2, slot: 'Morning (fasting)', value: 94 },
      { date: prevMonthStr2, slot: 'After breakfast', value: 136 },
      { date: prevMonthStr2, slot: 'After lunch', value: 122 },
      { date: prevMonthStr2, slot: 'After dinner', value: 140 }
    );

    let insertedCount = 0;
    for (const item of readingsToInsert) {
      const res = await client.query(
        `INSERT INTO glucose_readings (user_id, reading_date, time_slot, glucose_value)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, reading_date, time_slot) DO NOTHING
         RETURNING id`,
        [demoUser.id, item.date, item.slot, item.value]
      );
      if (res.rows.length > 0) {
        insertedCount++;
      }
    }

    await client.query('COMMIT');
    console.log(`✅ Seeding complete! ${insertedCount} new readings inserted (duplicates safely skipped).`);
    console.log(`🔑 Demo Login Credentials:`);
    console.log(`   Email:    demo@sweety.com`);
    console.log(`   Password: Password123!`);

    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    client.release();
    await pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;

