// Jest test suite for Glucose Readings CRUD and Validation Rules

const request = require('supertest');
const { mockQuery, resetMockDb } = require('./mockDb');

// Mock database layer
jest.mock('../src/config/db', () => ({
  query: jest.fn((sql, params) => mockQuery(sql, params)),
  pool: { on: jest.fn() },
}));

const app = require('../src/app');

describe('Glucose Readings API Tests', () => {
  let userToken;
  let otherUserToken;
  const today = new Date().toISOString().split('T')[0];

  beforeEach(async () => {
    resetMockDb();
    jest.clearAllMocks();

    // Register User 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'user1@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
    userToken = res1.body.token;

    // Register User 2 (for ownership testing)
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'user2@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
    otherUserToken = res2.body.token;
  });

  describe('POST /api/readings (Creation & 5 Mandatory Validation Rules)', () => {
    it('should successfully create a valid reading', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: today,
          time_slot: 'Morning (fasting)',
          glucose_value: 95,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.reading.glucose_value).toBe(95);
      expect(res.body.reading.time_slot).toBe('Morning (fasting)');
    });

    // Rule 1: Missing glucose value
    it('Rule 1: should reject missing glucose value', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: today,
          time_slot: 'Morning (fasting)',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please enter a glucose value.');
    });

    // Rule 2: Value below 40
    it('Rule 2: should reject glucose value below 40', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: today,
          time_slot: 'Morning (fasting)',
          glucose_value: 39,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
    });

    // Rule 2: Value above 600
    it('Rule 2: should reject glucose value above 600', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: today,
          time_slot: 'Morning (fasting)',
          glucose_value: 601,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
    });

    // Rule 2: Decimal number rejection
    it('Rule 2: should reject non-integer / decimal values', async () => {
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: today,
          time_slot: 'Morning (fasting)',
          glucose_value: 95.5,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Value must be between 40 and 600 mg/dl.');
    });

    // Rule 3: Only one reading per time slot per day
    it('Rule 3: should reject duplicate reading in the same time slot on the same day', async () => {
      // Create first reading
      await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: today,
          time_slot: 'After lunch',
          glucose_value: 120,
        });

      // Attempt duplicate reading
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: today,
          time_slot: 'After lunch',
          glucose_value: 130,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('You already have an After lunch reading for this date.');
    });

    // Rule 4: Maximum four readings per day
    it('Rule 4: should reject more than four readings on the same day', async () => {
      const slots = [
        'Morning (fasting)',
        'After breakfast',
        'After lunch',
        'After dinner',
      ];

      // Add all 4 slots
      for (const slot of slots) {
        const res = await request(app)
          .post('/api/readings')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            reading_date: today,
            time_slot: slot,
            glucose_value: 110,
          });
        expect(res.status).toBe(201);
      }

      // Try adding a 5th reading on same date
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: today,
          time_slot: 'Morning (fasting)', // Even with slot, count check triggers
          glucose_value: 115,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    // Rule 5: Future dates not allowed
    it('Rule 5: should reject reading with a future date', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: futureDate,
          time_slot: 'Morning (fasting)',
          glucose_value: 100,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Date cannot be in the future.');
    });
  });

  describe('Reading Ownership Protection & CRUD Operations', () => {
    let readingId;

    beforeEach(async () => {
      // User 1 creates a reading
      const res = await request(app)
        .post('/api/readings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          reading_date: today,
          time_slot: 'Morning (fasting)',
          glucose_value: 105,
        });
      readingId = res.body.reading.id;
    });

    it('should allow owner (User 1) to retrieve the reading by ID', async () => {
      const res = await request(app)
        .get(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.reading.id).toBe(readingId);
    });

    it('should DENY other user (User 2) from retrieving User 1 reading', async () => {
      const res = await request(app)
        .get(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });

    it('should allow owner to update their reading', async () => {
      const res = await request(app)
        .put(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          glucose_value: 115,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.reading.glucose_value).toBe(115);
    });

    it('should DENY other user from updating User 1 reading', async () => {
      const res = await request(app)
        .put(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          glucose_value: 199,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow owner to delete their reading', async () => {
      const res = await request(app)
        .delete(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should DENY other user from deleting User 1 reading', async () => {
      const res = await request(app)
        .delete(`/api/readings/${readingId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});

