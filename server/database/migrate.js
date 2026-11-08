const fs = require('fs');
const path = require('path');
const { migrationPool } = require('../src/config/db');

async function runMigration() {
  console.log('🚀 Running database migrations for Sweety...');
  const schemaPath = path.join(__dirname, 'schema.sql');

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at: ${schemaPath}`);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');
  let client;

  try {
    client = await migrationPool.connect();
    console.log('Connected to PostgreSQL successfully.');

    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log('✅ Migrations executed successfully! Tables & indexes are ready.');
  } catch (err) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('❌ Migration rollback failed:', rollbackError.message);
      }
    }
    throw err;
  } finally {
    if (client) client.release();
    await migrationPool.end();
  }
}

if (require.main === module) {
  runMigration().catch((err) => {
    console.error('❌ Migration failed:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    process.exitCode = 1;
  });
}

module.exports = runMigration;
