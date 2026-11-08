const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables with fallback hierarchy:
// 1. Root .env.local (generated/updated by neon deploy)
const rootEnvLocal = path.resolve(__dirname, '../../../.env.local');
if (fs.existsSync(rootEnvLocal)) {
  dotenv.config({ path: rootEnvLocal });
}

// 2. Root .env
const rootEnv = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
}

// 3. Server .env
const serverEnv = path.resolve(__dirname, '../../.env');
if (fs.existsSync(serverEnv)) {
  dotenv.config({ path: serverEnv });
}

const isProduction = process.env.NODE_ENV === 'production';

const getPoolConfig = (connectionString) => {
  const isNeon = connectionString && (
    connectionString.includes('neon.tech') ||
    connectionString.includes('sslmode=require')
  );
  const config = { connectionString };

  if (isNeon || isProduction) {
    config.ssl = {
      rejectUnauthorized: false,
    };
  }

  return config;
};

const pool = new Pool(getPoolConfig(process.env.DATABASE_URL));
const migrationPool = new Pool(
  getPoolConfig(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL)
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  migrationPool,
};
