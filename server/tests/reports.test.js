// Jest test suite for Reports and Analytics

const request = require('supertest');
const { mockQuery, resetMockDb } = require('./mockDb');

// Mock database layer
jest.mock('../src/config/db', () => ({
  query: jest.fn((sql, params) => mockQuery(sql, params)),
  pool: { on: jest.fn() },
}));

const app = require('../src/app');

describe('Reports & Analytics API Tests', () => {
  let userToken;
  let otherUserToken;
  const today = '2026-11-07';

  beforeEach(async () => {
    resetMockDb();
    jest.clearAllMocks();

    // Register User 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Report User',
        email: 'report@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
    userToken = res1.body.token;

    // Register User 2 (for data isolation testing)
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Other User',
        email: 'other@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
    otherUserToken = res2.body.token;

    // Seed readings for User 1 on selected date: 90, 130, 145 (avg = 121.666 -> rounded to 121.7)
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reading_date: today, time_slot: 'Morning (fasting)', glucose_value: 90 });

    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reading_date: today, time_slot: 'After breakfast', glucose_value: 130 });

    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reading_date: today, time_slot: 'After lunch', glucose_value: 145 });

    // Seed reading for User 1 on another day of current month (2026-11-03)
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reading_date: '2026-11-03', time_slot: 'Morning (fasting)', glucose_value: 100 });

    // Seed reading for User 1 in previous month (2026-10-15)
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reading_date: '2026-10-15', time_slot: 'Morning (fasting)', glucose_value: 92 });

    // Seed reading for User 2 (high value that should NEVER appear in User 1's reports)
    await request(app)
      .post('/api/readings')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ reading_date: today, time_slot: 'Morning (fasting)', glucose_value: 350 });
  });

  describe('GET /api/reports/daily', () => {
    it('should correctly calculate daily statistics (Highest, Lowest, Average rounded to 1 decimal, Total)', async () => {
      const res = await request(app)
        .get(`/api/reports/daily?date=${today}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.report_type).toBe('daily');
      expect(res.body.statistics).toEqual({
        total_readings: 3,
        highest_reading: 145,
        lowest_reading: 90,
        average_reading: 121.7, // 365 / 3 = 121.6666... rounded to 1 decimal
      });
      expect(res.body.readings).toHaveLength(3);
    });

    it('should never include another user data in daily statistics', async () => {
      const res = await request(app)
        .get(`/api/reports/daily?date=${today}`)
        .set('Authorization', `Bearer ${userToken}`);

      // User 2's value of 350 must not affect highest reading
      expect(res.body.statistics.highest_reading).toBe(145);
      expect(res.body.statistics.highest_reading).not.toBe(350);
    });

    it('should handle empty daily report gracefully with null statistics', async () => {
      const emptyDate = '2026-11-01';
      const res = await request(app)
        .get(`/api/reports/daily?date=${emptyDate}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.statistics).toEqual({
        total_readings: 0,
        highest_reading: null,
        lowest_reading: null,
        average_reading: null,
      });
      expect(res.body.readings).toHaveLength(0);
    });
  });

  describe('GET /api/reports/month-to-date', () => {
    it('should calculate month-to-date aggregates from 1st of month to selected date', async () => {
      const res = await request(app)
        .get(`/api/reports/month-to-date?date=${today}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.start_date).toBe('2026-11-01');
      expect(res.body.end_date).toBe(today);
      // Total 4 readings in Nov: 90, 130, 145, 100 => sum = 465, avg = 116.3
      expect(res.body.statistics).toEqual({
        total_readings: 4,
        highest_reading: 145,
        lowest_reading: 90,
        average_reading: 116.3,
      });
    });
  });

  describe('GET /api/reports/previous-month', () => {
    it('should calculate previous calendar month statistics', async () => {
      const res = await request(app)
        .get(`/api/reports/previous-month?date=${today}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.start_date).toBe('2026-10-01');
      expect(res.body.end_date).toBe('2026-10-31');
      expect(res.body.statistics).toEqual({
        total_readings: 1,
        highest_reading: 92,
        lowest_reading: 92,
        average_reading: 92,
      });
    });
  });
});
