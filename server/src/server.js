const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('🔄 Checking database connection...');
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as current_time');
    client.release();
    console.log(`✅ Database connected successfully! Postgres time: ${res.rows[0].current_time}`);
  } catch (err) {
    console.error('⚠️ Database connection warning/error:', err.message);
    console.warn('👉 Please ensure your DATABASE_URL in server/.env is valid and reachable.');
  }

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🌸 Sweety Backend Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}

startServer();

