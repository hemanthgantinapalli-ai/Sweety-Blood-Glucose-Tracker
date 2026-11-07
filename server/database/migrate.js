const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function runMigration() {
  console.log('🚀 Running database migrations for Sweety...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found at: ${schemaPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully.');
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ Migrations executed successfully! Tables & indexes are ready.');
    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    await pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
