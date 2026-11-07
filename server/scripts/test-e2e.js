// Live End-to-End Test for Sweety with Neon PostgreSQL
const http = require('http');
const app = require('../src/app');
const { pool } = require('../src/config/db');

const PORT = 5001;

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : {},
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runLiveTest() {
  console.log('🧪 Starting live end-to-end test against Neon PostgreSQL...');

  // 1. Verify direct Neon DB connection
  const client = await pool.connect();
  const dbCheck = await client.query('SELECT current_database(), version(), NOW() as now');
  client.release();
  console.log(`✅ Direct Neon DB check passed:`);
  console.log(`   Database: ${dbCheck.rows[0].current_database}`);
  console.log(`   Time:     ${dbCheck.rows[0].now}`);

  // 2. Start Express server on test port 5001
  const server = app.listen(PORT);
  console.log(`✅ Express server listening on http://127.0.0.1:${PORT}`);

  try {
    // 3. Test Health Check
    console.log('\n--- 1. Testing GET /api/health ---');
    const healthRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/health',
      method: 'GET',
    });
    console.log(`HTTP ${healthRes.statusCode}:`, healthRes.body);
    if (healthRes.statusCode !== 200) throw new Error('Health check failed');

    // 4. Test User Login against live Neon DB
    console.log('\n--- 2. Testing POST /api/auth/login against Neon ---');
    const loginRes = await makeRequest(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'demo@sweety.com',
        password: 'Password123!',
      }
    );
    console.log(`HTTP ${loginRes.statusCode}: Login successful!`);
    console.log(`User: ${loginRes.body.user.name} (${loginRes.body.user.email})`);
    if (loginRes.statusCode !== 200 || !loginRes.body.token) {
      throw new Error('Login failed against Neon');
    }
    const token = loginRes.body.token;

    // 5. Test Auth Me
    console.log('\n--- 3. Testing GET /api/auth/me with Bearer Token ---');
    const meRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`HTTP ${meRes.statusCode}: Authenticated as:`, meRes.body.user.email);
    if (meRes.statusCode !== 200) throw new Error('Auth /me failed');

    // 6. Test Fetching Readings from Neon DB
    console.log('\n--- 4. Testing GET /api/readings from Neon ---');
    const readingsRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/readings',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`HTTP ${readingsRes.statusCode}: Fetched ${readingsRes.body.total} readings from Neon.`);
    if (readingsRes.statusCode !== 200 || readingsRes.body.total === 0) {
      throw new Error('Fetching readings failed or 0 readings found');
    }

    // 7. Test Reports API against Neon DB
    console.log('\n--- 5. Testing GET /api/reports/daily against Neon ---');
    const today = new Date().toISOString().split('T')[0];
    const reportRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/reports/daily?date=${today}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`HTTP ${reportRes.statusCode}: Daily statistics:`, reportRes.body.statistics);
    if (reportRes.statusCode !== 200) throw new Error('Daily report failed');

    console.log('\n🎉 ALL LIVE END-TO-END TESTS PASSED ON NEON POSTGRESQL!');
  } finally {
    server.close();
    await pool.end();
  }
}

runLiveTest().catch((err) => {
  console.error('❌ E2E test failed:', err);
  process.exit(1);
});

