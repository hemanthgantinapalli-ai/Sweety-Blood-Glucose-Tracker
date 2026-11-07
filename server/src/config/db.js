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

const connectionString = process.env.DATABASE_URL;

// Determine SSL settings
// Neon and remote cloud postgres databases require SSL.
const isNeon = connectionString && (connectionString.includes('neon.tech') || connectionString.includes('sslmode=require'));
const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = {
  connectionString,
};

if (isNeon || isProduction) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
