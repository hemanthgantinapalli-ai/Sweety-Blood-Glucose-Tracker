// Jest test suite for Authentication APIs

const request = require('supertest');
const { mockQuery, resetMockDb } = require('./mockDb');

// Mock database layer
jest.mock('../src/config/db', () => ({
  query: jest.fn((sql, params) => mockQuery(sql, params)),
  pool: { on: jest.fn() },
}));

const app = require('../src/app');

describe('Authentication API Tests', () => {
  beforeEach(() => {
    resetMockDb();
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toMatchObject({
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
      expect(res.body.user.password_hash).toBeUndefined();
    });

    it('should reject registration when email already exists', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'duplicate@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      // Duplicate attempt
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'duplicate@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Email is already registered');
    });

    it('should reject registration if password is less than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short Pass',
          email: 'short@example.com',
          password: 'pass',
          confirmPassword: 'pass',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least 8 characters');
    });

    it('should reject registration if confirm password does not match', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Mismatch',
          email: 'mismatch@example.com',
          password: 'Password123!',
          confirmPassword: 'PasswordDifferent!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Confirm password does not match');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Seed a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login User',
          email: 'login@example.com',
          password: 'SecretPassword123!',
          confirmPassword: 'SecretPassword123!',
        });
    });

    it('should successfully log in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecretPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('login@example.com');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should reject login for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown@example.com',
          password: 'SomePassword123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });
  });

  describe('GET /api/auth/me (Protected Route)', () => {
    it('should reject request without Bearer token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication required');
    });

    it('should reject request with an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_garbage_token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return user profile when valid token is provided', async () => {
      // Register to get valid token
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Token User',
          email: 'token@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });

      const token = regRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('token@example.com');
    });
  });
});

