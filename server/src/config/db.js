const { Pool } = require('pg');
require('dotenv').config();

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
